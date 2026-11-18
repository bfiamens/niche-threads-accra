alter table public.store_settings add column checkout_open boolean not null default false;
insert into public.products(id,name_en,description_en,section,category,kind,grade,color,price_ghs,sizes,stock,image_url,preorder,sort) values
('polo-navy','Cotton polo','A classic piqué polo in navy.','Men','Tops','thrift','Excellent','Navy',180,ARRAY['M']::text[],1,'/__l5e/assets-v1/3c8aa975-681c-4d0f-9bc6-6df860613658/niche-polo-navy.webp',false,0),
('long-sleeve-polo','Long-sleeve polo','A soft long-sleeve polo that works dressed up or down.','Men','Tops','thrift','Very good','Navy',220,ARRAY['L']::text[],1,'/__l5e/assets-v1/d350e4e1-1ee6-40f9-acd1-21773cec7942/niche-long-sleeve-polo.webp',false,1),
('crew-tee','Crew tee','A clean white tee with a relaxed fit.','Men','Tops','new','New','White',120,ARRAY['S','M','L','XL']::text[],10,'/__l5e/assets-v1/3349dfb4-aacb-4ead-a740-b52cbf6bfb0d/niche-crew-tee.webp',false,2),
('logo-long-sleeve','Logo long sleeve','A long-sleeve tee with a washed finish.','Men','Tops','new','New','Black',260,ARRAY['S','M','L','XL']::text[],10,'/__l5e/assets-v1/3827dd6c-0339-439d-83b9-f4f5e4e3d96b/niche-logo-long-sleeve.webp',true,3),
('pique-polo','Piqué polo','A light, easy polo for warm days.','Men','Tops','new','New','Light blue',150,ARRAY['S','M','L','XL']::text[],10,'/__l5e/assets-v1/60b177be-954a-426b-9942-cfaff2350500/niche-pique-polo.webp',false,4),
('jersey-tee','Vintage jersey tee','A retro jersey-style tee.','Men','Tops','thrift','Good','Navy',140,ARRAY['M']::text[],1,'/__l5e/assets-v1/6be63a44-6d96-4482-87da-eca3b2b14078/niche-jersey-tee.webp',false,5),
('pleated-trousers','Pleated trousers','Wide, pleated trousers with a clean drape.','Men','Bottoms','new','New','Black',300,ARRAY['30','32','34','36']::text[],10,'/__l5e/assets-v1/bdfd2ef1-6938-4805-9e19-ad301c5caac3/niche-pleated-trousers.webp',false,6),
('sweat-shorts','Sweat shorts','Soft cotton shorts with a drawstring waist.','Men','Bottoms','new','New','Black',110,ARRAY['S','M','L','XL']::text[],10,'/__l5e/assets-v1/00accf57-1cae-47ea-8bc4-2d56ae8f565b/niche-sweat-shorts.webp',false,7),
('leather-sneaker','Leather sneaker','A clean court-style sneaker with a gum sole.','Men','Shoes','new','New','White',450,ARRAY['40','41','42','43','44','45']::text[],10,'/__l5e/assets-v1/44a358ea-a98f-45d5-8125-1b7a7270700a/niche-leather-sneaker.webp',false,8),
('cloud-runner','Cloud runner','A light running shoe with a cushioned sole.','Men','Shoes','new','New','White and black',520,ARRAY['40','41','42','43','44','45']::text[],10,'/__l5e/assets-v1/e3bbcbee-f272-46af-826c-47c5f6f88a84/niche-cloud-runner.webp',false,9),
('leather-sandal','Leather sandal','A woven leather slide.','Men','Shoes','thrift','Very good','Tan',200,ARRAY['43']::text[],1,'/__l5e/assets-v1/b72cb042-a104-4838-85a8-0ef76405d5aa/niche-leather-sandal.webp',false,10),
('steel-watch','Ultrathin watch','A slim steel watch with a bracelet strap.','Men','Accessories','new','New','Silver',350,ARRAY['One size']::text[],10,'/__l5e/assets-v1/6e57635d-e1d5-4865-bdb9-d6b049a1febb/niche-steel-watch.webp',false,11);
update public.products set name_de = case id
 when 'polo-navy' then 'Baumwoll-Polo' when 'long-sleeve-polo' then 'Langarm-Polo' when 'crew-tee' then 'Rundhals-T-Shirt'
 when 'logo-long-sleeve' then 'Logo-Langarmshirt' when 'pique-polo' then 'Piqué-Polo' when 'jersey-tee' then 'Vintage-Trikotshirt'
 when 'pleated-trousers' then 'Bundfaltenhose' when 'sweat-shorts' then 'Sweatshorts' when 'leather-sneaker' then 'Leder-Sneaker'
 when 'cloud-runner' then 'Cloud Runner' when 'leather-sandal' then 'Ledersandale' when 'steel-watch' then 'Ultraflache Uhr' end;
