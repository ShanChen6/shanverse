# Tianwu's Go brain

`tianwu-human-b18c384.svgo` is KataGo's human-style network **b18c384nbt-humanv0**
(released with KataGo v1.15.0, https://github.com/lightvector/KataGo/releases/tag/v1.15.0),
converted to Shanverse's compact format with int8 weights (one scale per output channel):

```sh
python3 scripts/go/convert-katago-net.py b18c384nbt-humanv0.bin.gz public/go/tianwu-human-b18c384.svgo i8
```

The game loads it in a web worker on desktop-class screens for full-rules games, caches it with
the Cache API, and runs it with `src/features/games/go/katago/network.ts`. Outputs were checked
against KataGo v1.18.2 (Eigen backend) on 9×9, 13×13 and 19×19 positions: identical in fp32,
within 0.7% policy probability with int8 weights.

To serve the file from elsewhere (a CDN, Vercel Blob…), set `NEXT_PUBLIC_GO_NET_URL`.

The network, and the parts of `network.ts` / `features.ts` that port KataGo's maths, are by
David J Wu ("lightvector") and the KataGo contributors. See `LICENSE-KataGo.txt`.
