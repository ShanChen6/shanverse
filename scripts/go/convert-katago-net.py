#!/usr/bin/env python3
"""Converts a KataGo .bin(.gz) network to Shanverse's compact .svgo file.

Usage: python3 scripts/go/convert-katago-net.py model.bin.gz public/go/tianwu-human-b18c384.svgo [i8|f16|f32]

Needs numpy. The parser follows KataGo's cpp/neuralnet/desc.cpp (model version <= 15).
"""

import gzip, json, struct, sys

import numpy as np

class Reader:
    def __init__(self, data): self.d = data; self.i = 0
    def tok(self):
        d = self.d; i = self.i
        while d[i] in b" \t\r\n": i += 1
        j = i
        while d[j] not in b" \t\r\n": j += 1
        self.i = j
        return d[i:j].decode()
    def int(self): return int(self.tok())
    def float(self): return float(self.tok())
    def floats(self, n):
        d = self.d; i = self.i
        while d[i] != ord("@"): i += 1
        assert d[i:i+5] == b"@BIN@", d[i:i+5]
        i += 5
        arr = np.frombuffer(d, dtype="<f4", count=n, offset=i).copy()
        self.i = i + 4 * n
        arr[np.abs(arr) < 1.1754944e-38] = 0
        return arr

def conv(r):
    name = r.tok(); ky, kx, ic, oc, dy, dx = [r.int() for _ in range(6)]
    assert dy == 1 and dx == 1
    w = r.floats(ky * kx * ic * oc).reshape(ky, kx, ic, oc)  # file order y,x,ic,oc
    return {"kind": "conv", "name": name, "k": ky, "ic": ic, "oc": oc, "w": w.transpose(3, 2, 0, 1).copy()}  # oc,ic,y,x

def bn(r):
    name = r.tok(); c = r.int(); eps = r.float(); hasScale = r.int(); hasBias = r.int()
    mean = r.floats(c); var = r.floats(c)
    scale = r.floats(c) if hasScale else np.ones(c, np.float32)
    bias = r.floats(c) if hasBias else np.zeros(c, np.float32)
    ms = (scale / np.sqrt(var + eps)).astype(np.float32)
    mb = (bias - ms * mean).astype(np.float32)
    return {"kind": "bn", "name": name, "c": c, "scale": ms, "bias": mb}

def act(r, version):
    name = r.tok()
    kind = r.tok() if version >= 11 else "ACTIVATION_RELU"
    return kind

def matmul(r):
    name = r.tok(); ic = r.int(); oc = r.int()
    w = r.floats(ic * oc).reshape(ic, oc)
    return {"kind": "matmul", "name": name, "ic": ic, "oc": oc, "w": w.T.copy()}  # oc,ic

def matbias(r):
    name = r.tok(); c = r.int()
    return {"kind": "bias", "name": name, "c": c, "w": r.floats(c)}

def block_stack(r, version, n):
    blocks = []
    for _ in range(n):
        kind = r.tok()
        if kind == "ordinary_block":
            name = r.tok()
            b = {"kind": "ordinary", "name": name}
            b["preBN"] = bn(r); b["preAct"] = act(r, version); b["conv1"] = conv(r)
            b["midBN"] = bn(r); b["midAct"] = act(r, version); b["conv2"] = conv(r)
        elif kind == "gpool_block":
            name = r.tok()
            b = {"kind": "gpool", "name": name}
            b["preBN"] = bn(r); b["preAct"] = act(r, version); b["regularConv"] = conv(r); b["gpoolConv"] = conv(r)
            b["gpoolBN"] = bn(r); b["gpoolAct"] = act(r, version); b["gpoolToBiasMul"] = matmul(r)
            b["midBN"] = bn(r); b["midAct"] = act(r, version); b["conv2"] = conv(r)
        elif kind == "nested_bottleneck_block":
            name = r.tok(); nb = r.int()
            b = {"kind": "nested", "name": name}
            b["preBN"] = bn(r); b["preAct"] = act(r, version); b["preConv"] = conv(r)
            b["blocks"] = block_stack(r, version, nb)
            b["postBN"] = bn(r); b["postAct"] = act(r, version); b["postConv"] = conv(r)
        else:
            raise ValueError("unsupported block " + kind)
        blocks.append(b)
    return blocks

def parse(path):
    raw = open(path, "rb").read()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    r = Reader(raw)
    m = {"name": r.tok(), "version": r.int(), "numIn": r.int(), "numGlobal": r.int()}
    v = m["version"]
    if v >= 13: m["post"] = [r.float() for _ in range(7)]
    m["metaVersion"] = 0
    if v >= 15:
        m["metaVersion"] = r.int()
        flags = [r.int() for _ in range(7)]
        m["flags"] = flags
    t = {"name": r.tok()}
    t["numBlocks"] = r.int(); t["trunkC"] = r.int(); t["midC"] = r.int(); t["regularC"] = r.int(); r.int(); t["gpoolC"] = r.int()
    if v >= 15:
        t["normKind"] = r.int(); [r.int() for _ in range(5)]
        assert t["normKind"] == 0
    t["initialConv"] = conv(r); t["initialMatMul"] = matmul(r)
    if m["metaVersion"] > 0:
        name = r.tok(); nmeta = r.int()
        enc = {"mul1": matmul(r), "bias1": matbias(r), "act1": act(r, v), "mul2": matmul(r), "bias2": matbias(r), "act2": act(r, v), "mul3": matmul(r)}
        t["meta"] = enc
    t["blocks"] = block_stack(r, v, t["numBlocks"])
    t["tipBN"] = bn(r); t["tipAct"] = act(r, v)
    m["trunk"] = t
    p = {"name": r.tok()}
    assert v < 16
    p["p1Conv"] = conv(r); p["g1Conv"] = conv(r); p["g1BN"] = bn(r); p["g1Act"] = act(r, v); p["gpoolToBiasMul"] = matmul(r)
    p["p1BN"] = bn(r); p["p1Act"] = act(r, v); p["p2Conv"] = conv(r); p["gpoolToPassMul"] = matmul(r)
    if v >= 15:
        p["gpoolToPassBias"] = matbias(r); p["passAct"] = act(r, v); p["gpoolToPassMul2"] = matmul(r)
    m["policy"] = p
    vh = {"name": r.tok()}
    vh["v1Conv"] = conv(r); vh["v1BN"] = bn(r); vh["v1Act"] = act(r, v); vh["v2Mul"] = matmul(r); vh["v2Bias"] = matbias(r); vh["v2Act"] = act(r, v)
    vh["v3Mul"] = matmul(r); vh["v3Bias"] = matbias(r); vh["sv3Mul"] = matmul(r); vh["sv3Bias"] = matbias(r); vh["ownConv"] = conv(r)
    m["value"] = vh
    rest = r.d[r.i:].strip()
    m["trailing"] = len(rest)
    return m


def convert(src, dst, dtype):
    m = parse(src)
    blobs = []
    offset = 0
    def add(arr, kind):
        nonlocal offset
        arr = np.ascontiguousarray(arr, dtype=np.float32)
        entry = {"shape": list(arr.shape)}
        if kind == "f32" or dtype == "f32":
            data = arr.astype("<f4").tobytes(); entry["dtype"] = "f32"
        elif dtype == "f16":
            data = arr.astype("<f2").tobytes(); entry["dtype"] = "f16"
        else:  # int8 with one scale per output channel (first axis)
            rows = arr.reshape(arr.shape[0], -1)
            scale = np.abs(rows).max(axis=1) / 127.0
            scale[scale == 0] = 1.0
            q = np.clip(np.round(rows / scale[:, None]), -127, 127).astype(np.int8)
            data = scale.astype("<f4").tobytes() + q.tobytes(); entry["dtype"] = "i8"
        pad = (-offset) % 16
        blobs.append(b"\0" * pad); offset += pad
        entry["offset"] = offset; entry["bytes"] = len(data)
        blobs.append(data); offset += len(data)
        return entry
    def walk(o):
        if isinstance(o, dict):
            k = o.get("kind")
            out = {}
            for key, v in o.items():
                if isinstance(v, np.ndarray):
                    big = key == "w" and k in ("conv", "matmul") and v.size >= 4096
                    out[key] = {"$": add(v, "big" if big else "f32")}
                else:
                    out[key] = walk(v)
            return out
        if isinstance(o, list): return [walk(x) for x in o]
        return o
    arch = walk(m)
    header = json.dumps(arch, separators=(",", ":")).encode()
    head = b"SVGONET1" + struct.pack("<I", len(header)) + header
    head += b"\0" * ((-len(head)) % 16)
    with open(dst, "wb") as f:
        f.write(head)
        for b in blobs: f.write(b)
    print(dst, dtype, "header", len(head), "data", offset)

if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "i8")
