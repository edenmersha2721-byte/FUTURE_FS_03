import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

const IMG = {
  hair: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  haircolor: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80',
  keratin: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80',
  blowdry: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=800&q=80',
  spa: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  nails: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
  makeup: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
  waxing: 'https://images.unsplash.com/photo-1596178060810-72660ee8d99c?w=800&q=80',
  skincare: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80',
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const categories = [
  { name: 'Hair', icon: 'scissors', description: 'Professional care for healthy, beautiful hair.', image_url: IMG.hair },
  { name: 'Spa', icon: 'flower', description: 'Relaxing spa treatments to rejuvenate body and mind.', image_url: IMG.spa },
  { name: 'Massage', icon: 'hand', description: 'Therapeutic massages for total relaxation.', image_url: IMG.massage },
  { name: 'Facial', icon: 'sparkles', description: 'Glowing, refreshed skin with expert facials.', image_url: IMG.facial },
  { name: 'Nails', icon: 'hand-sparkles', description: 'Manicures, pedicures and nail art.', image_url: IMG.nails },
  { name: 'Makeup', icon: 'brush', description: 'Flawless makeup for every occasion.', image_url: IMG.makeup },
  { name: 'Waxing', icon: 'wax', description: 'Smooth, long-lasting waxing services.', image_url: IMG.waxing },
  { name: 'Skin Care', icon: 'leaf', description: 'Advanced treatments for radiant skin.', image_url: IMG.skincare },
];

const servicesByCategory = {
  Hair: [
    ['Hair Cut & Styling', 'Professional haircut and styling for all hair types.', 45, 35, IMG.hair, true],
    ['Hair Coloring', 'Transform your look with our premium hair color services.', 90, 80, IMG.haircolor, true],
    ['Keratin Treatment', 'Smooth, frizz-free and shiny hair with keratin therapy.', 120, 150, IMG.keratin, false],
    ['Hair Wash & Blow Dry', 'Relaxing hair wash with professional blow dry.', 30, 20, IMG.blowdry, false],
    ['Hair Extensions', 'Add length and volume with high quality extensions.', 150, 200, IMG.hair, false],
    ['Bridal Hair', 'Elegant bridal hairstyling for your special day.', 90, 150, IMG.hair, false],
  ],
  Spa: [
    ['Aromatherapy Spa', 'Soothing aromatherapy session for deep relaxation.', 60, 90, IMG.spa, true],
    ['Hot Stone Spa', 'Warm stone therapy to melt away tension.', 75, 110, IMG.spa, false],
    ['Body Scrub & Wrap', 'Exfoliating scrub and nourishing body wrap.', 60, 85, IMG.spa, false],
  ],
  Massage: [
    ['Swedish Massage', 'Classic relaxing full-body massage.', 60, 75, IMG.massage, true],
    ['Deep Tissue Massage', 'Targets deep muscle tension and knots.', 60, 95, IMG.massage, false],
    ['Couples Massage', 'Side-by-side relaxation for two.', 90, 180, IMG.massage, false],
  ],
  Facial: [
    ['Classic Facial', 'Deep cleansing facial for all skin types.', 45, 55, IMG.facial, true],
    ['Anti-Aging Facial', 'Rejuvenating treatment to reduce fine lines.', 60, 90, IMG.facial, false],
    ['Hydrating Facial', 'Intense hydration for glowing skin.', 50, 70, IMG.facial, false],
  ],
  Nails: [
    ['Classic Manicure', 'Clean, shape and polish for beautiful hands.', 30, 25, IMG.nails, true],
    ['Gel Pedicure', 'Long-lasting gel pedicure with spa soak.', 45, 40, IMG.nails, false],
    ['Nail Art', 'Creative custom nail art designs.', 60, 50, IMG.nails, false],
  ],
  Makeup: [
    ['Party Makeup', 'Glamorous makeup for parties and events.', 45, 60, IMG.makeup, true],
    ['Bridal Makeup', 'Complete bridal makeup with trial session.', 90, 180, IMG.makeup, false],
    ['Natural Day Makeup', 'Fresh, natural everyday look.', 30, 40, IMG.makeup, false],
  ],
  Waxing: [
    ['Full Leg Wax', 'Smooth full-leg waxing.', 30, 35, IMG.waxing, false],
    ['Eyebrow Waxing', 'Precise eyebrow shaping.', 15, 15, IMG.waxing, false],
    ['Full Body Wax', 'Complete body waxing package.', 90, 120, IMG.waxing, true],
  ],
  'Skin Care': [
    ['Chemical Peel', 'Renew skin texture and tone.', 45, 85, IMG.skincare, false],
    ['Microdermabrasion', 'Exfoliating treatment for smoother skin.', 45, 75, IMG.skincare, true],
    ['Acne Treatment', 'Targeted treatment for clearer skin.', 50, 65, IMG.skincare, false],
  ],
};

const galleryItems = [
  ['Elegant Hair Styling', 'Salon', 'Hair', IMG.hair],
  ['Vibrant Hair Color', 'Beautiful coloring work', 'Hair', IMG.haircolor],
  ['Relaxing Spa Day', 'Spa treatment', 'Spa', IMG.spa],
  ['Therapeutic Massage', 'Massage session', 'Massage', IMG.massage],
  ['Glowing Facial', 'Facial treatment', 'Facial', IMG.facial],
  ['Perfect Manicure', 'Nail work', 'Nails', IMG.nails],
  ['Flawless Makeup', 'Makeup artistry', 'Makeup', IMG.makeup],
  ['Radiant Skin', 'Skin care', 'Skin Care', IMG.skincare],
  ['Salon Interior', 'Our elegant space', 'Salon', 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80'],
  ['Bridal Glow', 'Bridal makeup artistry', 'Makeup', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80'],
  ['Silky Blowout', 'Professional blow dry', 'Hair', IMG.blowdry],
  ['Luxury Pedicure', 'Relaxing pedicure', 'Nails', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80'],
  ['Hot Stone Therapy', 'Deep relaxation massage', 'Massage', IMG.massage],
  ['Color Transformation', 'Vibrant hair color', 'Hair', IMG.haircolor],
  ['Spa Serenity', 'Aromatherapy spa ritual', 'Spa', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'],
  ['Everyday Elegance', 'Natural glam look', 'Makeup', IMG.makeup],
];

const promotions = [
  {
    title: 'Summer Glow Package',
    description: 'Facial + Manicure + Blow Dry at a special bundle price.',
    discount: 25,
    discount_type: 'percentage',
    image_url: IMG.facial,
    start_date: '2026-06-01',
    end_date: '2026-09-30',
  },
  {
    title: 'Bridal Beauty Bundle',
    description: 'Complete bridal package: hair, makeup and spa.',
    discount: 100,
    discount_type: 'fixed',
    image_url: IMG.makeup,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
  },
  {
    title: 'Midweek Spa Special',
    description: 'Enjoy 20% off all spa treatments Monday–Wednesday.',
    discount: 20,
    discount_type: 'percentage',
    image_url: IMG.spa,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
  },
];

const reviews = [
  { rating: 5, comment: 'Absolutely loved my experience! The staff are so professional and the salon is gorgeous.', featured: true },
  { rating: 5, comment: 'Best keratin treatment I have ever had. My hair feels amazing!', featured: true },
  { rating: 5, comment: 'The spa day was pure bliss. I felt completely rejuvenated. Highly recommend!', featured: true },
  { rating: 4, comment: 'Great service and lovely atmosphere. Will definitely come back.', featured: false },
];

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Clearing existing data...');
    await client.query(
      'TRUNCATE reviews, appointments, gallery, promotions, services, categories, contact_messages RESTART IDENTITY CASCADE'
    );
    await client.query("DELETE FROM users");
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');

    // --- Users ---
    console.log('Seeding users...');
    const adminHash = await bcrypt.hash(env.admin.password, 10);
    const custHash = await bcrypt.hash('Customer@123', 10);
    const adminRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1,$2,$3,'admin','+1 (555) 123-4567') RETURNING id`,
      [env.admin.name, env.admin.email.toLowerCase(), adminHash]
    );
    const custRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ('Sophia Bennett','customer@luxesalon.com',$1,'customer','+1 (555) 987-6543') RETURNING id`,
      [custHash]
    );
    const customerId = custRes.rows[0].id;

    // --- Categories ---
    console.log('Seeding categories...');
    const catIds = {};
    for (const c of categories) {
      const r = await client.query(
        `INSERT INTO categories (name, slug, description, icon, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [c.name, slugify(c.name), c.description, c.icon, c.image_url]
      );
      catIds[c.name] = r.rows[0].id;
    }

    // --- Services ---
    console.log('Seeding services...');
    const serviceIds = [];
    for (const [catName, list] of Object.entries(servicesByCategory)) {
      for (const [name, description, duration, price, image_url, featured] of list) {
        const r = await client.query(
          `INSERT INTO services (name, description, category_id, duration_minutes, price, image_url, is_featured)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
          [name, description, catIds[catName], duration, price, image_url, featured]
        );
        serviceIds.push(r.rows[0].id);
      }
    }

    // --- Gallery ---
    console.log('Seeding gallery...');
    for (const [title, description, category, image_url] of galleryItems) {
      await client.query(
        `INSERT INTO gallery (title, description, category, image_url) VALUES ($1,$2,$3,$4)`,
        [title, description, category, image_url]
      );
    }

    // --- Promotions ---
    console.log('Seeding promotions...');
    for (const p of promotions) {
      await client.query(
        `INSERT INTO promotions (title, description, discount, discount_type, image_url, start_date, end_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [p.title, p.description, p.discount, p.discount_type, p.image_url, p.start_date, p.end_date]
      );
    }

    // --- Reviews ---
    console.log('Seeding reviews...');
    for (const rv of reviews) {
      await client.query(
        `INSERT INTO reviews (customer_id, service_id, rating, comment, is_featured)
         VALUES ($1,$2,$3,$4,$5)`,
        [customerId, serviceIds[0], rv.rating, rv.comment, rv.featured]
      );
    }

    // --- Sample appointments ---
    console.log('Seeding sample appointments...');
    await client.query(
      `INSERT INTO appointments (customer_id, service_id, appointment_date, appointment_time, status, price_snapshot, service_name_snapshot)
       VALUES
        ($1,$2, CURRENT_DATE + INTERVAL '2 day', '11:00', 'pending', 35, 'Hair Cut & Styling'),
        ($1,$3, CURRENT_DATE - INTERVAL '5 day', '14:00', 'completed', 90, 'Aromatherapy Spa')`,
      [customerId, serviceIds[0], serviceIds[6]]
    );

    await client.query('COMMIT');
    console.log('\n✅ Seed complete!');
    console.log('   Admin login:    ', env.admin.email, '/', env.admin.password);
    console.log('   Customer login:  customer@luxesalon.com / Customer@123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
