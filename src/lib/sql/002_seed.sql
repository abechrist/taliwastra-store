-- Seed data for Taliwastra

-- ============================================
-- Categories
-- ============================================
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Tas Rajut', 'tas-rajut', 'Koleksi tas tangan dan bahu rajut yang fungsional dan estetik', NULL),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'Dompet Rajut', 'dompet-rajut', 'Dompet dan pouch rajut dengan berbagai ukuran dan model', NULL),
  ('a1b2c3d4-0001-4000-8000-000000000003', 'Amigurumi', 'amigurumi', 'Boneka rajut lucu buatan tangan, karakter unik dan menggemaskan', NULL),
  ('a1b2c3d4-0001-4000-8000-000000000004', 'Gantungan Kunci', 'gantungan-kunci', 'Gantungan kunci rajut mini yang lucu dan penuh warna', NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Products
-- ============================================
INSERT INTO products (id, category_id, name, slug, description, material, price, stock, weight_grams, is_featured, tags) VALUES
  ('b1c2d3e4-0001-4000-8000-000000000001',
   'a1b2c3d4-0001-4000-8000-000000000001',
   'Tas Bahu Estetik',
   'tas-bahu-estetik',
   'Tas bahu rajut handmade dengan desain minimalis dan elegan. Dibuat dengan Katun Bali premium, nyaman dipakai sehari-hari.',
   'Katun Bali',
   150000, 10, 200, true,
   ARRAY['Handmade', 'Best Seller']),

  ('b1c2d3e4-0001-4000-8000-000000000002',
   'a1b2c3d4-0001-4000-8000-000000000003',
   'Amigurumi Kelinci Lucu',
   'amigurumi-kelinci-lucu',
   'Boneka kelinci amigurumi yang imut dan lembut. Cocok sebagai hadiah atau teman tidur anak-anak.',
   'Katun Bali',
   85000, 15, 80, true,
   ARRAY['Best Seller']),

  ('b1c2d3e4-0001-4000-8000-000000000003',
   'a1b2c3d4-0001-4000-8000-000000000002',
   'Dompet Koin Rajut',
   'dompet-koin-rajut',
   'Dompet koin rajut kecil yang praktis dan cantik. Dilengkapi resleting, cocok untuk menyimpan koin atau aksesoris kecil.',
   'Rayon',
   45000, 20, 30, true,
   ARRAY['Handmade']),

  ('b1c2d3e4-0001-4000-8000-000000000004',
   'a1b2c3d4-0001-4000-8000-000000000001',
   'Tas Tangan Premium',
   'tas-tangan-premium',
   'Tas tangan premium dengan detail rajut yang rumit. Material Katun Bali pilihan, cocok untuk acara formal maupun kasual.',
   'Katun Bali',
   225000, 5, 250, true,
   ARRAY['Premium']),

  ('b1c2d3e4-0001-4000-8000-000000000005',
   'a1b2c3d4-0001-4000-8000-000000000004',
   'Gantungan Kunci Bunga',
   'gantungan-kunci-bunga',
   'Gantungan kunci rajutan berbentuk bunga yang ceria. Hadir dalam berbagai warna cerah, membuat tas atau kunci Anda lebih menarik.',
   'Nylon',
   25000, 30, 15, false,
   ARRAY['Handmade']),

  ('b1c2d3e4-0001-4000-8000-000000000006',
   'a1b2c3d4-0001-4000-8000-000000000003',
   'Set Boneka Mini',
   'set-boneka-mini',
   'Paket 3 boneka amigurumi mini dengan karakter berbeda. Dibuat dengan detail dan cinta, cocok sebagai koleksi atau mainan anak.',
   'Katun Bali',
   120000, 8, 120, false,
   ARRAY['Handmade', 'Set'])
ON CONFLICT (slug) DO NOTHING;
