ALTER TABLE public.strains ADD COLUMN IF NOT EXISTS box_image_url text;
COMMENT ON COLUMN public.strains.box_image_url IS 'Wholesale/stockist-only display-box photo. Never used on retail pages.';
UPDATE public.strains SET box_image_url = v.url FROM (VALUES
 ('green-crack','/__l5e/assets-v1/632a09ff-f113-4466-8ad3-63bd401f4f82/terps-box-20pack-infused-green-crack.jpg'),
 ('blue-dream','/__l5e/assets-v1/126e11d9-6b5e-40a2-be0a-75e3a7243d1d/terps-box-20pack-infused-blue-dream.jpg'),
 ('mango-sapphire','/__l5e/assets-v1/6c370fd8-cc52-41b8-be76-435e086cd87e/terps-box-20pack-infused-mango-sapphire.jpg'),
 ('girl-scout-cookie','/__l5e/assets-v1/13a12e04-ac2c-4282-9553-2cab9b4661a4/terps-box-20pack-infused-girl-scout-cookies.jpg'),
 ('caviar-stix-sativa','/__l5e/assets-v1/3638e719-2364-43df-b373-94876adbcc04/terps-box-20pack-caviar-stix-sativa-green.jpg'),
 ('caviar-stix-hybrid','/__l5e/assets-v1/07261815-9c91-4d7b-8d2e-61a95b1101ff/terps-box-20pack-caviar-stix-hybrid-blue.jpg'),
 ('caviar-stix-indica','/__l5e/assets-v1/aeedc240-3676-4643-9670-5d3b55daaa8b/terps-box-20pack-caviar-stix-indica-purple.jpg'),
 ('sour-diesel','/__l5e/assets-v1/0ab2597c-3cd9-4f1a-81d2-40ddfd7c92e2/terps-box-50pack-infused-sour-diesel.jpg'),
 ('northern-lights','/__l5e/assets-v1/6b126ffd-6fa0-41f3-b634-71a457a36136/terps-box-50pack-infused-northern-lights.jpg')
) AS v(slug,url) WHERE public.strains.slug = v.slug;