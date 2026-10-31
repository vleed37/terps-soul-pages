# Project architecture

- Keep product photography editable through `strains.product_image_url` and `gallery_image_urls`, resolving main images with `resolveProductImage`; this preserves admin replacement and bundled fallbacks without hard-coding client photos in pages.
- Product cards prioritize an explicitly configured product photograph over a model; retain the existing model-first detail gallery so photography updates do not remove interactive 3D views.