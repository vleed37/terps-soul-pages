# Project architecture

- Keep product photography editable through `strains.product_image_url` and `gallery_image_urls`, resolving main images with `resolveProductImage`; this preserves admin replacement and bundled fallbacks without hard-coding client photos in pages.
- Product cards use the shared model viewer and model-derived loading stills; detail galleries use editable retail photography after the model, keeping wholesale box images separate.