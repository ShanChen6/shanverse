// Matrix multiply kernel for Shanverse's Go network runner, compiled to
// WebAssembly with SIMD (see build-gemm.sh). Layouts, all row-major float32:
//   W   : OC x K      weights
//   X   : K  x S      inputs, S = board points padded to a multiple of 8
//   out : OC x S      out (+)= W · X
#include <wasm_simd128.h>

__attribute__((export_name("gemm")))
void gemm(const float* W, const float* X, float* out, int OC, int K, int S, int accumulate) {
  int oc = 0;
  for (; oc + 4 <= OC; oc += 4) {
    const float* w0 = W + (oc + 0) * K;
    const float* w1 = W + (oc + 1) * K;
    const float* w2 = W + (oc + 2) * K;
    const float* w3 = W + (oc + 3) * K;
    float* o0 = out + (oc + 0) * S;
    float* o1 = out + (oc + 1) * S;
    float* o2 = out + (oc + 2) * S;
    float* o3 = out + (oc + 3) * S;
    for (int p = 0; p < S; p += 8) {
      v128_t a00, a01, a10, a11, a20, a21, a30, a31;
      if (accumulate) {
        a00 = wasm_v128_load(o0 + p); a01 = wasm_v128_load(o0 + p + 4);
        a10 = wasm_v128_load(o1 + p); a11 = wasm_v128_load(o1 + p + 4);
        a20 = wasm_v128_load(o2 + p); a21 = wasm_v128_load(o2 + p + 4);
        a30 = wasm_v128_load(o3 + p); a31 = wasm_v128_load(o3 + p + 4);
      } else {
        a00 = a01 = a10 = a11 = a20 = a21 = a30 = a31 = wasm_f32x4_splat(0.0f);
      }
      const float* x = X + p;
      for (int k = 0; k < K; k++, x += S) {
        v128_t x0 = wasm_v128_load(x);
        v128_t x1 = wasm_v128_load(x + 4);
        v128_t b0 = wasm_f32x4_splat(w0[k]);
        v128_t b1 = wasm_f32x4_splat(w1[k]);
        v128_t b2 = wasm_f32x4_splat(w2[k]);
        v128_t b3 = wasm_f32x4_splat(w3[k]);
        a00 = wasm_f32x4_add(a00, wasm_f32x4_mul(b0, x0)); a01 = wasm_f32x4_add(a01, wasm_f32x4_mul(b0, x1));
        a10 = wasm_f32x4_add(a10, wasm_f32x4_mul(b1, x0)); a11 = wasm_f32x4_add(a11, wasm_f32x4_mul(b1, x1));
        a20 = wasm_f32x4_add(a20, wasm_f32x4_mul(b2, x0)); a21 = wasm_f32x4_add(a21, wasm_f32x4_mul(b2, x1));
        a30 = wasm_f32x4_add(a30, wasm_f32x4_mul(b3, x0)); a31 = wasm_f32x4_add(a31, wasm_f32x4_mul(b3, x1));
      }
      wasm_v128_store(o0 + p, a00); wasm_v128_store(o0 + p + 4, a01);
      wasm_v128_store(o1 + p, a10); wasm_v128_store(o1 + p + 4, a11);
      wasm_v128_store(o2 + p, a20); wasm_v128_store(o2 + p + 4, a21);
      wasm_v128_store(o3 + p, a30); wasm_v128_store(o3 + p + 4, a31);
    }
  }
  for (; oc < OC; oc++) {
    const float* w = W + oc * K;
    float* o = out + oc * S;
    for (int p = 0; p < S; p += 4) {
      v128_t a = accumulate ? wasm_v128_load(o + p) : wasm_f32x4_splat(0.0f);
      const float* x = X + p;
      for (int k = 0; k < K; k++, x += S) a = wasm_f32x4_add(a, wasm_f32x4_mul(wasm_f32x4_splat(w[k]), wasm_v128_load(x)));
      wasm_v128_store(o + p, a);
    }
  }
}
