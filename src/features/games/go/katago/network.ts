// A small, dependency-free runner for KataGo neural networks (ResNet trunks with
// nested-bottleneck and global-pooling blocks, model version 15 and earlier).
// It ports the maths of KataGo's Eigen (CPU) backend. Matrix multiplies run in
// a tiny WebAssembly SIMD kernel (scripts/go/gemm.c) when available, else in
// plain JavaScript. Networks are converted to Shanverse's compact ".svgo" file
// by scripts/go/convert-katago-net.py.

import { GEMM_WASM_BASE64 } from "./gemm-wasm";

type TensorRef = { $: { shape: number[]; dtype: "f32" | "f16" | "i8"; offset: number; bytes: number } };
type Activation = "ACTIVATION_IDENTITY" | "ACTIVATION_RELU" | "ACTIVATION_MISH" | "ACTIVATION_SILU";

/** Conv weights live in the heap at float offset `w` (OC × IC·k·k). */
type Conv = { k: number; ic: number; oc: number; w: number };
type BN = { c: number; scale: Float32Array; bias: Float32Array };
type MatMul = { ic: number; oc: number; w: Float32Array };
type Bias = { c: number; w: Float32Array };

type Ordinary = { kind: "ordinary"; preBN: BN; preAct: Activation; conv1: Conv; midBN: BN; midAct: Activation; conv2: Conv };
type GPool = {
  kind: "gpool";
  preBN: BN;
  preAct: Activation;
  regularConv: Conv;
  gpoolConv: Conv;
  gpoolBN: BN;
  gpoolAct: Activation;
  gpoolToBiasMul: MatMul;
  midBN: BN;
  midAct: Activation;
  conv2: Conv;
};
type Nested = { kind: "nested"; preBN: BN; preAct: Activation; preConv: Conv; blocks: Block[]; postBN: BN; postAct: Activation; postConv: Conv };
type Block = Ordinary | GPool | Nested;

type Arch = {
  name: string;
  version: number;
  numIn: number;
  numGlobal: number;
  metaVersion: number;
  trunk: {
    trunkC: number;
    initialConv: Conv;
    initialMatMul: MatMul;
    meta?: { mul1: MatMul; bias1: Bias; act1: Activation; mul2: MatMul; bias2: Bias; act2: Activation; mul3: MatMul };
    blocks: Block[];
    tipBN: BN;
    tipAct: Activation;
  };
  policy: {
    p1Conv: Conv;
    g1Conv: Conv;
    g1BN: BN;
    g1Act: Activation;
    gpoolToBiasMul: MatMul;
    p1BN: BN;
    p1Act: Activation;
    p2Conv: Conv;
    gpoolToPassMul: MatMul;
    gpoolToPassBias?: Bias;
    passAct?: Activation;
    gpoolToPassMul2?: MatMul;
  };
  value: {
    v1Conv: Conv;
    v1BN: BN;
    v1Act: Activation;
    v2Mul: MatMul;
    v2Bias: Bias;
    v2Act: Activation;
    v3Mul: MatMul;
    v3Bias: Bias;
    sv3Mul: MatMul;
    sv3Bias: Bias;
    ownConv: Conv;
  };
};

export type NetInput = {
  size: number;
  /** numIn spatial planes, channel-major (numIn × size²). */
  spatial: Float32Array;
  /** numGlobal global features. */
  global: Float32Array;
  /** 192 metadata features for human-style networks, or null. */
  meta: Float32Array | null;
};

export type NetOutput = {
  /** Policy logits for every point (row-major), then pass at index size². */
  policy: Float32Array;
  /** Win, loss, no-result logits from the side to move's point of view. */
  value: Float32Array;
  /** Score-related outputs, raw. Index 0 is the score mean / 20 from the side to move. */
  scoreValue: Float32Array;
  /** Ownership logits per point (tanh gives ownership), side to move's point of view. */
  ownership: Float32Array;
};

// ---------------------------------------------------------------------------
// Decoding

let halfTable: Float32Array | null = null;
function halfToFloat(h: number): number {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 0x1f;
  const f = h & 0x3ff;
  if (e === 0) return s * f * 2 ** -24;
  if (e === 31) return f ? Number.NaN : s * Infinity;
  return s * (1 + f / 1024) * 2 ** (e - 15);
}

function decodeInto(ref: TensorRef["$"], buffer: ArrayBuffer, dataStart: number, out: Float32Array, at: number) {
  const count = ref.shape.reduce((a, b) => a * b, 1);
  const base = dataStart + ref.offset;
  if (ref.dtype === "f32") {
    out.set(new Float32Array(buffer.slice(base, base + count * 4)), at);
  } else if (ref.dtype === "f16") {
    if (!halfTable) {
      halfTable = new Float32Array(65536);
      for (let h = 0; h < 65536; h++) halfTable[h] = halfToFloat(h);
    }
    const halves = new Uint16Array(buffer.slice(base, base + count * 2));
    for (let i = 0; i < count; i++) out[at + i] = halfTable[halves[i]];
  } else {
    const rows = ref.shape[0];
    const per = count / rows;
    const scales = new Float32Array(buffer.slice(base, base + rows * 4));
    const q = new Int8Array(buffer, base + rows * 4, count);
    for (let r = 0; r < rows; r++) {
      const s = scales[r];
      const o = at + r * per;
      for (let i = 0; i < per; i++) out[o + i] = q[r * per + i] * s;
    }
  }
}

// ---------------------------------------------------------------------------
// The heap: weights and activations in one Float32Array (WebAssembly memory
// when the SIMD kernel is available). Offsets below are float indices.

type Gemm = (w: number, x: number, out: number, oc: number, k: number, s: number, accumulate: boolean) => void;

const HEAP_START = 1 << 18; // floats; leaves 1 MB for the kernel's stack
const WORKSPACE_FLOATS = 16 << 20; // 64 MB of activations, enough for 19×19

function jsGemm(heap: Float32Array): Gemm {
  return (w, x, out, OC, K, S, accumulate) => {
    if (!accumulate) heap.fill(0, out, out + OC * S);
    let oc = 0;
    for (; oc + 4 <= OC; oc += 4) {
      const r0 = out + oc * S;
      const r1 = r0 + S;
      const r2 = r1 + S;
      const r3 = r2 + S;
      const w0 = w + oc * K;
      for (let k = 0; k < K; k++) {
        const a0 = heap[w0 + k];
        const a1 = heap[w0 + K + k];
        const a2 = heap[w0 + 2 * K + k];
        const a3 = heap[w0 + 3 * K + k];
        const xb = x + k * S;
        for (let p = 0; p < S; p++) {
          const v = heap[xb + p];
          heap[r0 + p] += a0 * v;
          heap[r1 + p] += a1 * v;
          heap[r2 + p] += a2 * v;
          heap[r3 + p] += a3 * v;
        }
      }
    }
    for (; oc < OC; oc++) {
      const r = out + oc * S;
      for (let k = 0; k < K; k++) {
        const a = heap[w + oc * K + k];
        const xb = x + k * S;
        for (let p = 0; p < S; p++) heap[r + p] += a * heap[xb + p];
      }
    }
  };
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export class Network {
  readonly arch: Arch;
  readonly simd: boolean;
  private heap: Float32Array;
  private gemm: Gemm;
  private workspaceStart: number;
  private top: number;

  private constructor(arch: Arch, heap: Float32Array, gemm: Gemm, simd: boolean, workspaceStart: number) {
    this.arch = arch;
    this.heap = heap;
    this.gemm = gemm;
    this.simd = simd;
    this.workspaceStart = workspaceStart;
    this.top = workspaceStart;
  }

  get name() {
    return this.arch.name;
  }

  /** Parses a ".svgo" network file. Uses the WebAssembly kernel unless `forceJs`. */
  static async load(buffer: ArrayBuffer, options: { forceJs?: boolean } = {}): Promise<Network> {
    const bytes = new Uint8Array(buffer);
    if (String.fromCharCode(...bytes.subarray(0, 8)) !== "SVGONET1") throw new Error("Not a Shanverse Go network file");
    const headerLength = new DataView(buffer).getUint32(8, true);
    const header = JSON.parse(new TextDecoder().decode(bytes.subarray(12, 12 + headerLength)));
    const dataStart = Math.ceil((12 + headerLength) / 16) * 16;

    // First pass: count the floats of the big (heap) tensors.
    let heapFloats = 0;
    const isHeapTensor = (key: string, parent: Record<string, unknown>) => key === "w" && parent.kind === "conv";
    const count = (node: unknown) => {
      if (Array.isArray(node)) node.forEach(count);
      else if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          if (value && typeof value === "object" && "$" in (value as TensorRef) && isHeapTensor(key, node as Record<string, unknown>)) {
            heapFloats += (value as TensorRef).$.shape.reduce((a, b) => a * b, 1);
          } else count(value);
        }
      }
    };
    count(header);

    const totalFloats = HEAP_START + heapFloats + WORKSPACE_FLOATS;
    let heap: Float32Array;
    let gemm: Gemm;
    let simd = false;
    try {
      if (options.forceJs) throw new Error("js requested");
      const memory = new WebAssembly.Memory({ initial: Math.ceil((totalFloats * 4) / 65536) });
      const module = new WebAssembly.Module(base64ToBytes(GEMM_WASM_BASE64) as BufferSource);
      const instance = new WebAssembly.Instance(module, { env: { memory } });
      const kernel = instance.exports.gemm as (w: number, x: number, o: number, oc: number, k: number, s: number, acc: number) => void;
      heap = new Float32Array(memory.buffer);
      gemm = (w, x, out, oc, k, s, accumulate) => kernel(w * 4, x * 4, out * 4, oc, k, s, accumulate ? 1 : 0);
      simd = true;
    } catch {
      heap = new Float32Array(totalFloats);
      gemm = jsGemm(heap);
    }

    // Second pass: decode tensors; conv weights go to the heap.
    let next = HEAP_START;
    const resolve = (node: unknown, key = "", parent: Record<string, unknown> | null = null): unknown => {
      if (Array.isArray(node)) return node.map((child) => resolve(child));
      if (node && typeof node === "object") {
        if ("$" in (node as TensorRef)) {
          const ref = (node as TensorRef).$;
          if (parent && isHeapTensor(key, parent)) {
            const at = next;
            decodeInto(ref, buffer, dataStart, heap, at);
            next += ref.shape.reduce((a, b) => a * b, 1);
            return at;
          }
          const out = new Float32Array(ref.shape.reduce((a, b) => a * b, 1));
          decodeInto(ref, buffer, dataStart, out, 0);
          return out;
        }
        const obj = node as Record<string, unknown>;
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, resolve(v, k, obj)]));
      }
      return node;
    };
    const arch = resolve(header) as Arch;
    if (arch.version > 15) throw new Error(`Unsupported network version ${arch.version}`);
    return new Network(arch, heap, gemm, simd, next);
  }

  // -- workspace allocation (a stack, reset after every evaluation) ----------

  private alloc(floats: number): number {
    const at = this.top;
    this.top += floats;
    if (this.top > this.heap.length) throw new Error("network workspace exhausted");
    return at;
  }

  // -- layers ----------------------------------------------------------------

  private bnAct(input: number, out: number, bn: BN, act: Activation, P: number, S: number) {
    const h = this.heap;
    for (let c = 0; c < bn.c; c++) {
      const s = bn.scale[c];
      const b = bn.bias[c];
      const i0 = input + c * S;
      const o0 = out + c * S;
      for (let p = 0; p < P; p++) h[o0 + p] = activate(h[i0 + p] * s + b, act);
      for (let p = P; p < S; p++) h[o0 + p] = 0;
    }
  }

  private conv(layer: Conv, input: number, out: number, size: number, S: number, accumulate: boolean) {
    if (layer.k === 1) {
      this.gemm(layer.w, input, out, layer.oc, layer.ic, S, accumulate);
      return;
    }
    const mark = this.top;
    const col = this.alloc(layer.ic * 9 * S);
    this.im2col3(input, layer.ic, size, S, col);
    this.gemm(layer.w, col, out, layer.oc, layer.ic * 9, S, accumulate);
    this.top = mark;
  }

  private im2col3(input: number, C: number, size: number, S: number, col: number) {
    const h = this.heap;
    for (let c = 0; c < C; c++) {
      const src = input + c * S;
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const dst = col + (c * 9 + ky * 3 + kx) * S;
          for (let y = 0; y < size; y++) {
            const sy = y + ky - 1;
            const rowOut = dst + y * size;
            if (sy < 0 || sy >= size) {
              h.fill(0, rowOut, rowOut + size);
              continue;
            }
            const rowIn = src + sy * size;
            for (let x = 0; x < size; x++) {
              const sx = x + kx - 1;
              h[rowOut + x] = sx < 0 || sx >= size ? 0 : h[rowIn + sx];
            }
          }
          h.fill(0, dst + size * size, dst + S);
        }
      }
    }
  }

  private addChannelBias(t: number, bias: Float32Array, C: number, P: number, S: number) {
    const h = this.heap;
    for (let c = 0; c < C; c++) {
      const b = bias[c];
      for (let i = t + c * S, end = i + P; i < end; i++) h[i] += b;
    }
  }

  /** Mean, size-scaled mean and max over the board (KataGo's gpool). */
  private poolGPool(input: number, C: number, P: number, S: number): Float32Array {
    const h = this.heap;
    const out = new Float32Array(C * 3);
    const sq = Math.sqrt(P);
    for (let c = 0; c < C; c++) {
      let s = 0;
      let m = -1;
      for (let i = input + c * S, end = i + P; i < end; i++) {
        s += h[i];
        if (h[i] > m) m = h[i];
      }
      const mean = s / P;
      out[c] = mean;
      out[c + C] = mean * (sq - 14) * 0.1;
      out[c + 2 * C] = m;
    }
    return out;
  }

  private poolValue(input: number, C: number, P: number, S: number): Float32Array {
    const h = this.heap;
    const out = new Float32Array(C * 3);
    const sq = Math.sqrt(P);
    for (let c = 0; c < C; c++) {
      let s = 0;
      for (let i = input + c * S, end = i + P; i < end; i++) s += h[i];
      const mean = s / P;
      out[c] = mean;
      out[c + C] = mean * (sq - 14) * 0.1;
      out[c + 2 * C] = mean * ((sq - 14) * (sq - 14) * 0.01 - 0.1);
    }
    return out;
  }

  private block(block: Block, trunk: number, C: number, size: number, S: number) {
    const P = size * size;
    const mark = this.top;
    const scratch = this.alloc(C * S);
    if (block.kind === "ordinary") {
      this.bnAct(trunk, scratch, block.preBN, block.preAct, P, S);
      const mid = this.alloc(block.conv1.oc * S);
      this.conv(block.conv1, scratch, mid, size, S, false);
      const midScratch = this.alloc(block.conv1.oc * S);
      this.bnAct(mid, midScratch, block.midBN, block.midAct, P, S);
      this.conv(block.conv2, midScratch, trunk, size, S, true);
    } else if (block.kind === "gpool") {
      this.bnAct(trunk, scratch, block.preBN, block.preAct, P, S);
      const regular = this.alloc(block.regularConv.oc * S);
      this.conv(block.regularConv, scratch, regular, size, S, false);
      const g = this.alloc(block.gpoolConv.oc * S);
      this.conv(block.gpoolConv, scratch, g, size, S, false);
      const g2 = this.alloc(block.gpoolConv.oc * S);
      this.bnAct(g, g2, block.gpoolBN, block.gpoolAct, P, S);
      const pooled = this.poolGPool(g2, block.gpoolConv.oc, P, S);
      this.addChannelBias(regular, matmul(block.gpoolToBiasMul, pooled), block.regularConv.oc, P, S);
      const regularScratch = this.alloc(block.regularConv.oc * S);
      this.bnAct(regular, regularScratch, block.midBN, block.midAct, P, S);
      this.conv(block.conv2, regularScratch, trunk, size, S, true);
    } else {
      this.bnAct(trunk, scratch, block.preBN, block.preAct, P, S);
      const midC = block.preConv.oc;
      const mid = this.alloc(midC * S);
      this.conv(block.preConv, scratch, mid, size, S, false);
      for (const inner of block.blocks) this.block(inner, mid, midC, size, S);
      const midScratch = this.alloc(midC * S);
      this.bnAct(mid, midScratch, block.postBN, block.postAct, P, S);
      this.conv(block.postConv, midScratch, trunk, size, S, true);
    }
    this.top = mark;
  }

  evaluate(input: NetInput): NetOutput {
    const { size } = input;
    const P = size * size;
    const S = Math.ceil(P / 8) * 8;
    const h = this.heap;
    const a = this.arch;
    const t = a.trunk;
    const C = t.trunkC;
    this.top = this.workspaceStart;
    try {
      // Inputs, padded to S.
      const inp = this.alloc(a.numIn * S);
      for (let c = 0; c < a.numIn; c++) {
        h.set(input.spatial.subarray(c * P, (c + 1) * P), inp + c * S);
        h.fill(0, inp + c * S + P, inp + (c + 1) * S);
      }

      // Trunk: initial conv plus the global (and metadata) features as a bias.
      const trunk = this.alloc(C * S);
      this.conv(t.initialConv, inp, trunk, size, S, false);
      this.addChannelBias(trunk, matmul(t.initialMatMul, input.global), C, P, S);
      if (t.meta && input.meta) {
        const m = t.meta;
        const h1 = matmul(m.mul1, input.meta);
        for (let i = 0; i < h1.length; i++) h1[i] = activate(h1[i] + m.bias1.w[i], m.act1);
        const h2 = matmul(m.mul2, h1);
        for (let i = 0; i < h2.length; i++) h2[i] = activate(h2[i] + m.bias2.w[i], m.act2);
        this.addChannelBias(trunk, matmul(m.mul3, h2), C, P, S);
      }
      for (const block of t.blocks) this.block(block, trunk, C, size, S);
      const tip = this.alloc(C * S);
      this.bnAct(trunk, tip, t.tipBN, t.tipAct, P, S);

      // Policy head.
      const ph = a.policy;
      const p1 = this.alloc(ph.p1Conv.oc * S);
      this.conv(ph.p1Conv, tip, p1, size, S, false);
      const g1 = this.alloc(ph.g1Conv.oc * S);
      this.conv(ph.g1Conv, tip, g1, size, S, false);
      const g1b = this.alloc(ph.g1Conv.oc * S);
      this.bnAct(g1, g1b, ph.g1BN, ph.g1Act, P, S);
      const g1Pooled = this.poolGPool(g1b, ph.g1Conv.oc, P, S);
      this.addChannelBias(p1, matmul(ph.gpoolToBiasMul, g1Pooled), ph.p1Conv.oc, P, S);
      const p1b = this.alloc(ph.p1Conv.oc * S);
      this.bnAct(p1, p1b, ph.p1BN, ph.p1Act, P, S);
      const p2 = this.alloc(ph.p2Conv.oc * S);
      this.conv(ph.p2Conv, p1b, p2, size, S, false);
      let pass: Float32Array;
      if (ph.gpoolToPassMul2 && ph.gpoolToPassBias) {
        const hidden = matmul(ph.gpoolToPassMul, g1Pooled);
        for (let i = 0; i < hidden.length; i++) hidden[i] = activate(hidden[i] + ph.gpoolToPassBias.w[i], ph.passAct ?? "ACTIVATION_IDENTITY");
        pass = matmul(ph.gpoolToPassMul2, hidden);
      } else {
        pass = matmul(ph.gpoolToPassMul, g1Pooled);
      }
      const policy = new Float32Array(P + 1);
      policy.set(h.subarray(p2, p2 + P));
      policy[P] = pass[0];

      // Value head.
      const vh = a.value;
      const v1 = this.alloc(vh.v1Conv.oc * S);
      this.conv(vh.v1Conv, tip, v1, size, S, false);
      const v1b = this.alloc(vh.v1Conv.oc * S);
      this.bnAct(v1, v1b, vh.v1BN, vh.v1Act, P, S);
      const pooled = this.poolValue(v1b, vh.v1Conv.oc, P, S);
      const v2 = matmul(vh.v2Mul, pooled);
      for (let i = 0; i < v2.length; i++) v2[i] = activate(v2[i] + vh.v2Bias.w[i], vh.v2Act);
      const value = matmul(vh.v3Mul, v2);
      for (let i = 0; i < value.length; i++) value[i] += vh.v3Bias.w[i];
      const scoreValue = matmul(vh.sv3Mul, v2);
      for (let i = 0; i < scoreValue.length; i++) scoreValue[i] += vh.sv3Bias.w[i];
      const own = this.alloc(vh.ownConv.oc * S);
      this.conv(vh.ownConv, v1b, own, size, S, false);
      const ownership = h.slice(own, own + P);

      return { policy, value, scoreValue, ownership };
    } finally {
      this.top = this.workspaceStart;
    }
  }
}

function activate(x: number, act: Activation): number {
  switch (act) {
    case "ACTIVATION_MISH": {
      // x·tanh(softplus(x)) with a single exp: tanh(log(1+e)) = n / (n + 2), n = e·(e + 2).
      if (x > 20) return x;
      const e = Math.exp(x);
      const n = e * (e + 2);
      return (x * n) / (n + 2);
    }
    case "ACTIVATION_RELU":
      return x > 0 ? x : 0;
    case "ACTIVATION_SILU":
      return x / (1 + Math.exp(-x));
    default:
      return x;
  }
}

function matmul(layer: MatMul, input: Float32Array): Float32Array {
  const out = new Float32Array(layer.oc);
  for (let o = 0; o < layer.oc; o++) {
    let s = 0;
    const base = o * layer.ic;
    for (let i = 0; i < layer.ic; i++) s += layer.w[base + i] * input[i];
    out[o] = s;
  }
  return out;
}
