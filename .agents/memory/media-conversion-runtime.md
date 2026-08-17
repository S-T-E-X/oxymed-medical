---
name: Media conversion runtime
description: Replit runtime guidance for server-side image inspection and conversion when a native Node image package is unavailable.
---

The Replit runtime includes the ImageMagick `magick` CLI, while installing a native Node image package may fail. It can inspect actual opacity with `%[opaque]` and convert opaque raster files from a temporary buffer-backed file.

**Why:** The media conversion feature needed alpha detection and JPEG encoding, but the package-management install path could not install `sharp`; the system binary worked without adding a native dependency.

**How to apply:** Keep conversion server-side, use `execFile` with argument arrays, process files sequentially, and delete temporary files in `finally`. Treat transparent and animated inputs as non-convertible unless the product explicitly supports flattening or animation loss.