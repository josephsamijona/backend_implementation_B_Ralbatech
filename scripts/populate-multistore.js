/**
 * ============================================================
 *  Ralba Optical — Multi-Store Portal Population Script
 * ============================================================
 *
 *  This script populates the database with test data for the
 *  entire multistore-portal feature:
 *
 *  1. Admin + Role
 *  2. Default store "yunicbrightvision" (vendor, store, banner,
 *     categories, brands, tags, products)
 *  3. Two additional vendors with stores & products
 *  4. MTG flow (admin MTGs, vendor MTGs, pending → active)
 *  5. Displayer / Fulfiller flow (cross-vendor product sharing)
 *  6. Customer reviews
 *
 *  Usage:
 *    cd backend && node scripts/populate-multistore.js
 *
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const crypto   = require('crypto');

// ── Models ─────────────────────────────────────────────────
const Admin                   = require('../src/models/adminModel');
const Role                    = require('../src/models/roleModel');
const Vendor                  = require('../src/models/vendorModel');
const Store                   = require('../src/models/storeModel');
const Category                = require('../src/models/categoryModel');
const Brand                   = require('../src/models/brandModel');
const Tag                     = require('../src/models/tagModel');
const Department              = require('../src/models/departmentModel');
const Product                 = require('../src/models/productModel');
const VendorBanner            = require('../src/models/vendorBannerModel');
const MediaTextContent        = require('../src/models/mediaTextContentModel');
const VendorMediaTextContent  = require('../src/models/vendorMediaTextContentModel');
const Review                  = require('../src/models/reviewsModel');

// ── Helpers ────────────────────────────────────────────────

/** Hash a password exactly like passwordLib.js (scrypt, 128-byte salt) */
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(128).toString('hex');
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) return reject(err);
      resolve(salt + ':' + key.toString('hex'));
    });
  });
}

/** Slugify a string */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Colour helpers for console ─────────────────────────────
const CLR = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan:  '\x1b[36m',
  yellow:'\x1b[33m',
  red:   '\x1b[31m',
  bold:  '\x1b[1m',
};
function log(icon, msg) { console.log(`${CLR.cyan}${icon}${CLR.reset} ${msg}`); }
function ok(msg)        { console.log(`${CLR.green}  OK${CLR.reset} ${msg}`); }
function section(title) { console.log(`\n${CLR.bold}${CLR.yellow}=== ${title} ===${CLR.reset}`); }

// ╔══════════════════════════════════════════════════════════╗
// ║                     MAIN SCRIPT                         ║
// ╚══════════════════════════════════════════════════════════╝

async function main() {
  // ── Connect ──────────────────────────────────────────────
  await mongoose.connect(process.env.DB_URL);
  log('DB', `Connected to ${process.env.DB_URL.replace(/\/\/.*@/, '//***@')}`);

  const defaultPwd = await hashPassword('Test1234!');

  // ════════════════════════════════════════════════════════
  //  STEP 1 — Admin + Role
  // ════════════════════════════════════════════════════════
  section('STEP 1 — Admin + Role');

  const adminRole = await Role.create({
    role_name: 'admin',
    status: 'active',
  });
  ok(`Role created: ${adminRole.role_name} (${adminRole._id})`);

  const vendorRole = await Role.create({
    role_name: 'vendor',
    status: 'active',
  });
  ok(`Role created: ${vendorRole.role_name} (${vendorRole._id})`);

  const admin = await Admin.create({
    name: 'Ralba Admin',
    email: 'admin@ralbaoptical.com',
    password: defaultPwd,
    admin_image: '',
    status: 'active',
    role: adminRole._id,
  });
  ok(`Admin created: ${admin.email} (${admin._id})`);

  // ════════════════════════════════════════════════════════
  //  STEP 2 — Categories
  // ════════════════════════════════════════════════════════
  section('STEP 2 — Categories');

  const catData = [
    {
      category_name: 'Eyeglasses',
      category_image: 'https://via.placeholder.com/300x200?text=Eyeglasses',
      attributes: [
        { attribute_name: 'Frame Material', attribute_slug: 'frame-material', is_mandatory: false },
        { attribute_name: 'Frame Shape', attribute_slug: 'frame-shape', is_mandatory: false },
      ],
      add_ons: [
        {
          add_ons_name: 'Lens Type',
          add_ons_slug: 'lens-type',
          is_mandatory: true,
          add_ons_value: [
            { values: 'Single Vision', value_image: '' },
            { values: 'Progressive', value_image: '' },
            { values: 'Bifocal', value_image: '' },
          ],
        },
      ],
    },
    {
      category_name: 'Sunglasses',
      category_image: 'https://via.placeholder.com/300x200?text=Sunglasses',
      attributes: [
        { attribute_name: 'Lens Color', attribute_slug: 'lens-color', is_mandatory: false },
        { attribute_name: 'UV Protection', attribute_slug: 'uv-protection', is_mandatory: false },
      ],
      add_ons: [],
    },
    {
      category_name: 'Contact Lenses',
      category_image: 'https://via.placeholder.com/300x200?text=ContactLenses',
      attributes: [
        { attribute_name: 'Wear Duration', attribute_slug: 'wear-duration', is_mandatory: false },
      ],
      add_ons: [],
    },
    {
      category_name: 'Accessories',
      category_image: 'https://via.placeholder.com/300x200?text=Accessories',
      attributes: [],
      add_ons: [],
    },
  ];

  const categories = [];
  for (const c of catData) {
    const cat = await Category.create({
      category_name: c.category_name,
      category_slug: slugify(c.category_name),
      category_image: c.category_image,
      category_image_name: slugify(c.category_name) + '.png',
      attributes: c.attributes,
      add_ons: c.add_ons,
      status: 'active',
    });
    categories.push(cat);
    ok(`Category: ${cat.category_name} (${cat._id})`);
  }

  // ════════════════════════════════════════════════════════
  //  STEP 3 — Brands
  // ════════════════════════════════════════════════════════
  section('STEP 3 — Brands');

  const brandData = [
    { brand_name: 'Ray-Ban',    cats: [0, 1] },
    { brand_name: 'Oakley',     cats: [0, 1] },
    { brand_name: 'Gucci',      cats: [0, 1, 3] },
    { brand_name: 'Acuvue',     cats: [2] },
    { brand_name: 'Prada',      cats: [0, 1] },
  ];

  const brands = [];
  for (const b of brandData) {
    const brand = await Brand.create({
      brand_name: b.brand_name,
      brand_slug: slugify(b.brand_name),
      brand_image: `https://via.placeholder.com/150x80?text=${encodeURIComponent(b.brand_name)}`,
      brand_image_name: slugify(b.brand_name) + '.png',
      categories: b.cats.map(i => ({ _id: categories[i]._id, category_name: categories[i].category_name })),
      status: 'active',
    });
    brands.push(brand);
    ok(`Brand: ${brand.brand_name} (${brand._id})`);
  }

  // ════════════════════════════════════════════════════════
  //  STEP 4 — Tags
  // ════════════════════════════════════════════════════════
  section('STEP 4 — Tags');

  const tagNames = ['New Arrival', 'Best Seller', 'On Sale', 'Premium', 'Trending'];
  const tags = [];
  for (const t of tagNames) {
    const tag = await Tag.create({
      tag_name: t,
      tag_slug: slugify(t),
      tag_description: `${t} products`,
      tag_image: '',
      tag_image_name: '',
      web_view_status: 'active',
      status: 'active',
    });
    tags.push(tag);
    ok(`Tag: ${tag.tag_name} (${tag._id})`);
  }

  // ════════════════════════════════════════════════════════
  //  STEP 5 — Default Vendor + Store "yunicbrightvision"
  // ════════════════════════════════════════════════════════
  section('STEP 5 — Default Vendor + Store "yunicbrightvision"');

  const vendor1 = await Vendor.create({
    name: 'YunicBrightVision',
    email: 'yunic@ralbaoptical.com',
    phone: '5551000001',
    password: defaultPwd,
    vendor_image: '',
    vendor_type: 'main',
    status: 'active',
    stores: [],
    is_copy: false,
  });
  ok(`Vendor: ${vendor1.name} (${vendor1._id})`);

  const store1 = await Store.create({
    store_name: 'yunicbrightvision',
    store_slug: 'yunicbrightvision',
    store_description: 'Premium optical store by YunicBrightVision — eyeglasses, sunglasses & contacts.',
    store_location: 'New York, NY',
    domain_name: 'yunicbrightvision.ralbaoptical.com',
    store_owner: vendor1._id,
    store_department: [],
    store_products: [],
    is_logo: false,
    is_copy: false,
    status: 'active',
  });
  ok(`Store: ${store1.store_name} (${store1._id})`);

  // Link store to vendor
  vendor1.stores.push(store1._id);
  await vendor1.save();

  // Department
  const dept1 = await Department.create({
    department_name: 'Main Showroom',
    department_slug: 'main-showroom',
    department_store: store1._id,
    status: 'active',
  });
  store1.store_department.push(dept1._id);
  await store1.save();
  ok(`Department: ${dept1.department_name}`);

  // Vendor Banner
  const banner1 = await VendorBanner.create({
    vendor_id: vendor1._id,
    banner_title: 'Welcome to YunicBrightVision',
    banner_subtitle: 'Premium Eyewear for Every Style',
    banner_background_image: 'https://via.placeholder.com/1200x400?text=YunicBrightVision',
    banner_background_image_name: 'yunic-banner.jpg',
    banner_title_color: '#FFFFFF',
    banner_subtitle_color: '#EEEEEE',
    banner_button_bg_color: '#007BFF',
    banner_button_text_color: '#FFFFFF',
    banner_top_brands: brands.slice(0, 3).map(b => ({ _id: b._id, brand_name: b.brand_name })),
    banner_homepage_brands: brands.map(b => ({ _id: b._id, brand_name: b.brand_name })),
    banner_sub_categories: [],
    status: 'active',
  });
  ok(`Banner: ${banner1.banner_title}`);

  // ════════════════════════════════════════════════════════
  //  STEP 6 — Products for yunicbrightvision
  // ════════════════════════════════════════════════════════
  section('STEP 6 — Products for yunicbrightvision');

  const v1Products = [
    {
      sku: 'YBV-EG-001', name: 'Classic Aviator Eyeglasses',
      desc: 'Timeless aviator frame with lightweight titanium build.',
      catIdx: 0, brandIdx: 0, price: 199.99, sale: 169.99, stock: 50,
      tags: [0, 1],
    },
    {
      sku: 'YBV-EG-002', name: 'Modern Round Eyeglasses',
      desc: 'Vintage-inspired round frames for a retro look.',
      catIdx: 0, brandIdx: 1, price: 149.99, sale: 129.99, stock: 35,
      tags: [0, 4],
    },
    {
      sku: 'YBV-SG-001', name: 'Sport Polarized Sunglasses',
      desc: 'High-performance polarized sunglasses for active lifestyles.',
      catIdx: 1, brandIdx: 1, price: 249.99, sale: 219.99, stock: 25,
      tags: [1, 3],
    },
    {
      sku: 'YBV-SG-002', name: 'Designer Cat-Eye Sunglasses',
      desc: 'Luxury cat-eye sunglasses with gradient lenses.',
      catIdx: 1, brandIdx: 2, price: 350.00, sale: 299.99, stock: 15,
      tags: [3, 4],
    },
    {
      sku: 'YBV-CL-001', name: 'Daily Comfort Contact Lenses',
      desc: 'Breathable daily disposable contact lenses. Box of 30.',
      catIdx: 2, brandIdx: 3, price: 45.00, sale: 39.99, stock: 100,
      tags: [1, 2],
    },
    {
      sku: 'YBV-AC-001', name: 'Premium Lens Cleaning Kit',
      desc: 'Microfibre cloth, spray solution, and carrying case.',
      catIdx: 3, brandIdx: 2, price: 29.99, sale: 24.99, stock: 200,
      tags: [2],
    },
  ];

  const productsV1 = [];
  for (const p of v1Products) {
    const product = await Product.create({
      product_sku: p.sku,
      product_name: p.name,
      product_slug: slugify(p.name),
      product_description: p.desc,
      product_category: categories[p.catIdx]._id.toString(),
      product_brand: brands[p.brandIdx]._id,
      product_owner: vendor1._id,
      product_image: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name.split(' ')[0])}`],
      product_retail_price: p.price,
      product_sale_price: p.sale,
      product_discount_price: +(p.price - p.sale).toFixed(2),
      stock: p.stock,
      product_availability: 'in_stock',
      status: 'active',
      tags: p.tags.map(i => ({ _id: tags[i]._id, tag_name: tags[i].tag_name })),
      product_meta_tags: [],
      attributes: [],
      add_ons: [],
      displayer_fulfiller: [],
    });
    productsV1.push(product);
    ok(`Product: ${product.product_name} ($${product.product_retail_price})`);
  }

  // Link products to store
  store1.store_products = productsV1.map(p => p._id);
  await store1.save();

  // ════════════════════════════════════════════════════════
  //  STEP 7 — Vendor 2: "OptiVue Lens Co"
  // ════════════════════════════════════════════════════════
  section('STEP 7 — Vendor 2: OptiVue Lens Co');

  const vendor2 = await Vendor.create({
    name: 'OptiVue Lens Co',
    email: 'optivue@ralbaoptical.com',
    phone: '5552000002',
    password: defaultPwd,
    vendor_image: '',
    vendor_type: 'main',
    status: 'active',
    stores: [],
    is_copy: false,
  });
  ok(`Vendor: ${vendor2.name} (${vendor2._id})`);

  const store2 = await Store.create({
    store_name: 'OptiVue Store',
    store_slug: 'optivue-store',
    store_description: 'Affordable designer eyewear from OptiVue Lens Co.',
    store_location: 'Los Angeles, CA',
    domain_name: 'optivue.ralbaoptical.com',
    store_owner: vendor2._id,
    store_department: [],
    store_products: [],
    is_logo: false,
    is_copy: false,
    status: 'active',
  });
  vendor2.stores.push(store2._id);
  await vendor2.save();
  ok(`Store: ${store2.store_name} (${store2._id})`);

  const dept2 = await Department.create({
    department_name: 'OptiVue Gallery',
    department_slug: 'optivue-gallery',
    department_store: store2._id,
    status: 'active',
  });
  store2.store_department.push(dept2._id);

  const banner2 = await VendorBanner.create({
    vendor_id: vendor2._id,
    banner_title: 'OptiVue — See the Difference',
    banner_subtitle: 'Affordable Designer Eyewear',
    banner_background_image: 'https://via.placeholder.com/1200x400?text=OptiVue',
    banner_background_image_name: 'optivue-banner.jpg',
    banner_title_color: '#FFFFFF',
    banner_subtitle_color: '#DDDDDD',
    banner_button_bg_color: '#28A745',
    banner_button_text_color: '#FFFFFF',
    banner_top_brands: [],
    banner_homepage_brands: [],
    banner_sub_categories: [],
    status: 'active',
  });
  ok(`Banner: ${banner2.banner_title}`);

  const v2ProductData = [
    {
      sku: 'OV-EG-001', name: 'Slim Rectangle Eyeglasses',
      desc: 'Sleek rectangular frames with spring hinges.',
      catIdx: 0, brandIdx: 4, price: 120.00, sale: 99.99, stock: 40,
      tags: [0, 2],
    },
    {
      sku: 'OV-SG-001', name: 'Retro Wayfarer Sunglasses',
      desc: 'Classic wayfarer style with UV400 protection.',
      catIdx: 1, brandIdx: 0, price: 180.00, sale: 159.99, stock: 30,
      tags: [1, 4],
    },
    {
      sku: 'OV-SG-002', name: 'Oversized Shield Sunglasses',
      desc: 'Bold oversized shield design for maximum coverage.',
      catIdx: 1, brandIdx: 4, price: 220.00, sale: 189.99, stock: 20,
      tags: [3],
    },
    {
      sku: 'OV-CL-001', name: 'Monthly Soft Contact Lenses',
      desc: 'Premium monthly disposable soft lenses. Box of 6.',
      catIdx: 2, brandIdx: 3, price: 55.00, sale: 49.99, stock: 80,
      tags: [2],
    },
  ];

  const productsV2 = [];
  for (const p of v2ProductData) {
    const product = await Product.create({
      product_sku: p.sku,
      product_name: p.name,
      product_slug: slugify(p.name),
      product_description: p.desc,
      product_category: categories[p.catIdx]._id.toString(),
      product_brand: brands[p.brandIdx]._id,
      product_owner: vendor2._id,
      product_image: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name.split(' ')[0])}`],
      product_retail_price: p.price,
      product_sale_price: p.sale,
      product_discount_price: +(p.price - p.sale).toFixed(2),
      stock: p.stock,
      product_availability: 'in_stock',
      status: 'active',
      tags: p.tags.map(i => ({ _id: tags[i]._id, tag_name: tags[i].tag_name })),
      displayer_fulfiller: [],
    });
    productsV2.push(product);
    ok(`Product: ${product.product_name} ($${product.product_retail_price})`);
  }

  store2.store_products = productsV2.map(p => p._id);
  await store2.save();

  // ════════════════════════════════════════════════════════
  //  STEP 8 — Vendor 3: "ClearSight Optics"
  // ════════════════════════════════════════════════════════
  section('STEP 8 — Vendor 3: ClearSight Optics');

  const vendor3 = await Vendor.create({
    name: 'ClearSight Optics',
    email: 'clearsight@ralbaoptical.com',
    phone: '5553000003',
    password: defaultPwd,
    vendor_image: '',
    vendor_type: 'main',
    status: 'active',
    stores: [],
    is_copy: false,
  });
  ok(`Vendor: ${vendor3.name} (${vendor3._id})`);

  const store3 = await Store.create({
    store_name: 'ClearSight Boutique',
    store_slug: 'clearsight-boutique',
    store_description: 'Luxury boutique optical experience.',
    store_location: 'Miami, FL',
    domain_name: 'clearsight.ralbaoptical.com',
    store_owner: vendor3._id,
    store_department: [],
    store_products: [],
    is_logo: false,
    is_copy: false,
    status: 'active',
  });
  vendor3.stores.push(store3._id);
  await vendor3.save();
  ok(`Store: ${store3.store_name} (${store3._id})`);

  const dept3 = await Department.create({
    department_name: 'ClearSight Lounge',
    department_slug: 'clearsight-lounge',
    department_store: store3._id,
    status: 'active',
  });
  store3.store_department.push(dept3._id);

  const banner3 = await VendorBanner.create({
    vendor_id: vendor3._id,
    banner_title: 'ClearSight — Premium Vision',
    banner_subtitle: 'Handcrafted Luxury Eyewear',
    banner_background_image: 'https://via.placeholder.com/1200x400?text=ClearSight',
    banner_background_image_name: 'clearsight-banner.jpg',
    banner_title_color: '#FFFFFF',
    banner_subtitle_color: '#CCCCCC',
    banner_button_bg_color: '#6F42C1',
    banner_button_text_color: '#FFFFFF',
    banner_top_brands: [],
    banner_homepage_brands: [],
    banner_sub_categories: [],
    status: 'active',
  });
  ok(`Banner: ${banner3.banner_title}`);

  const v3ProductData = [
    {
      sku: 'CS-EG-001', name: 'Titanium Rimless Eyeglasses',
      desc: 'Ultra-light rimless titanium frames for effortless elegance.',
      catIdx: 0, brandIdx: 2, price: 380.00, sale: 340.00, stock: 10,
      tags: [3, 0],
    },
    {
      sku: 'CS-SG-001', name: 'Gold Aviator Sunglasses',
      desc: 'Gold-plated aviator frame with gradient brown lenses.',
      catIdx: 1, brandIdx: 0, price: 290.00, sale: 260.00, stock: 12,
      tags: [3, 4],
    },
    {
      sku: 'CS-AC-001', name: 'Leather Glasses Case',
      desc: 'Genuine Italian leather hard case with magnetic closure.',
      catIdx: 3, brandIdx: 2, price: 65.00, sale: 55.00, stock: 50,
      tags: [3],
    },
  ];

  const productsV3 = [];
  for (const p of v3ProductData) {
    const product = await Product.create({
      product_sku: p.sku,
      product_name: p.name,
      product_slug: slugify(p.name),
      product_description: p.desc,
      product_category: categories[p.catIdx]._id.toString(),
      product_brand: brands[p.brandIdx]._id,
      product_owner: vendor3._id,
      product_image: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name.split(' ')[0])}`],
      product_retail_price: p.price,
      product_sale_price: p.sale,
      product_discount_price: +(p.price - p.sale).toFixed(2),
      stock: p.stock,
      product_availability: 'in_stock',
      status: 'active',
      tags: p.tags.map(i => ({ _id: tags[i]._id, tag_name: tags[i].tag_name })),
      displayer_fulfiller: [],
    });
    productsV3.push(product);
    ok(`Product: ${product.product_name} ($${product.product_retail_price})`);
  }

  store3.store_products = productsV3.map(p => p._id);
  await store3.save();

  // ════════════════════════════════════════════════════════
  //  STEP 9 — Admin MTGs (MediaTextContent)
  // ════════════════════════════════════════════════════════
  section('STEP 9 — Admin MTGs (MediaTextContent)');

  const adminMTGs = [
    {
      heading: 'Spring Collection 2026',
      desc: 'Discover our curated spring eyewear collection featuring pastel tones and lightweight frames.',
      image: 'https://via.placeholder.com/600x300?text=Spring+2026',
    },
    {
      heading: 'Blue Light Protection Guide',
      desc: 'Learn how our blue-light-blocking lenses protect your eyes during screen time.',
      image: 'https://via.placeholder.com/600x300?text=Blue+Light',
    },
    {
      heading: 'Designer Spotlight: Ray-Ban',
      desc: 'Explore the iconic Ray-Ban collection — from Aviators to Wayfarers.',
      image: 'https://via.placeholder.com/600x300?text=RayBan+Spotlight',
    },
  ];

  const mtgDocs = [];
  for (let i = 0; i < adminMTGs.length; i++) {
    const m = adminMTGs[i];
    const mtg = await MediaTextContent.create({
      heading_text: m.heading,
      description_text: m.desc,
      section_image: m.image,
      section_image_name: slugify(m.heading) + '.jpg',
      position: i + 1,
      tags: [],
      vendor_id: null,          // admin-created
      mtg_status: 'active',     // platform MTGs are active
      web_view_status: 'active',
      status: 'active',
    });
    mtgDocs.push(mtg);
    ok(`Admin MTG: "${mtg.heading_text}" (${mtg._id})`);
  }

  // ════════════════════════════════════════════════════════
  //  STEP 10 — Vendor MTGs (VendorMediaTextContent)
  // ════════════════════════════════════════════════════════
  section('STEP 10 — Vendor MTGs');

  //  a) Vendor 1 creates own MTG (pending — needs admin approval)
  const vendorMtg1_own = await VendorMediaTextContent.create({
    media_text_contain_id: null,    // vendor-created, no admin parent
    vendor_id: vendor1._id,
    heading_text: 'YunicBrightVision — Our Story',
    description_text: 'From a small workshop in Brooklyn to one of New York\'s top eyewear destinations.',
    section_image: 'https://via.placeholder.com/600x300?text=Yunic+Story',
    section_image_name: 'yunic-story.jpg',
    position: 1,
    tags: [],
    mtg_status: 'pending',         // awaiting admin approval
    web_view_status: 'inactive',
    status: 'active',
  });
  ok(`Vendor MTG (pending): "${vendorMtg1_own.heading_text}"`);

  //  b) Vendor 1 adopts admin MTG #1 (Spring Collection)
  const vendorMtg1_adopted = await VendorMediaTextContent.create({
    media_text_contain_id: mtgDocs[0]._id,
    vendor_id: vendor1._id,
    heading_text: mtgDocs[0].heading_text,
    description_text: mtgDocs[0].description_text,
    section_image: mtgDocs[0].section_image,
    section_image_name: mtgDocs[0].section_image_name,
    position: 2,
    tags: [],
    mtg_status: 'active',          // admin MTG adoption is auto-active
    web_view_status: 'active',
    status: 'active',
  });
  ok(`Vendor MTG (adopted): "${vendorMtg1_adopted.heading_text}" by ${vendor1.name}`);

  //  c) Vendor 2 creates own MTG (pending)
  const vendorMtg2_own = await VendorMediaTextContent.create({
    media_text_contain_id: null,
    vendor_id: vendor2._id,
    heading_text: 'OptiVue — Affordable Luxury',
    description_text: 'Designer quality without the designer price tag. That\'s the OptiVue promise.',
    section_image: 'https://via.placeholder.com/600x300?text=OptiVue+Story',
    section_image_name: 'optivue-story.jpg',
    position: 1,
    tags: [],
    mtg_status: 'pending',
    web_view_status: 'inactive',
    status: 'active',
  });
  ok(`Vendor MTG (pending): "${vendorMtg2_own.heading_text}"`);

  //  d) Vendor 2 adopts admin MTG #2 (Blue Light)
  const vendorMtg2_adopted = await VendorMediaTextContent.create({
    media_text_contain_id: mtgDocs[1]._id,
    vendor_id: vendor2._id,
    heading_text: mtgDocs[1].heading_text,
    description_text: mtgDocs[1].description_text,
    section_image: mtgDocs[1].section_image,
    section_image_name: mtgDocs[1].section_image_name,
    position: 2,
    tags: [],
    mtg_status: 'active',
    web_view_status: 'active',
    status: 'active',
  });
  ok(`Vendor MTG (adopted): "${vendorMtg2_adopted.heading_text}" by ${vendor2.name}`);

  //  e) Vendor 3 creates own MTG (already approved by admin for testing)
  const vendorMtg3_own = await VendorMediaTextContent.create({
    media_text_contain_id: null,
    vendor_id: vendor3._id,
    heading_text: 'ClearSight — Craftsmanship Matters',
    description_text: 'Every pair of ClearSight frames is hand-finished by our master opticians in Miami.',
    section_image: 'https://via.placeholder.com/600x300?text=ClearSight+Craft',
    section_image_name: 'clearsight-craft.jpg',
    position: 1,
    tags: [],
    mtg_status: 'active',         // admin already approved
    web_view_status: 'active',
    status: 'active',
  });
  ok(`Vendor MTG (approved): "${vendorMtg3_own.heading_text}"`);

  //  f) Vendor 3 adopts admin MTG #3 (Ray-Ban Spotlight)
  const vendorMtg3_adopted = await VendorMediaTextContent.create({
    media_text_contain_id: mtgDocs[2]._id,
    vendor_id: vendor3._id,
    heading_text: mtgDocs[2].heading_text,
    description_text: mtgDocs[2].description_text,
    section_image: mtgDocs[2].section_image,
    section_image_name: mtgDocs[2].section_image_name,
    position: 2,
    tags: [],
    mtg_status: 'active',
    web_view_status: 'active',
    status: 'active',
  });
  ok(`Vendor MTG (adopted): "${vendorMtg3_adopted.heading_text}" by ${vendor3.name}`);

  // ════════════════════════════════════════════════════════
  //  STEP 11 — Displayer / Fulfiller Flow
  // ════════════════════════════════════════════════════════
  section('STEP 11 — Displayer / Fulfiller Flow');

  //
  // Scenario A: Vendor2 wants to DISPLAY Vendor1's "Classic Aviator Eyeglasses"
  //             and also FULFILL it at a custom price. Status: pending (admin must approve)
  //
  const prodAviator = productsV1[0]; // Classic Aviator Eyeglasses
  prodAviator.displayer_fulfiller.push({
    vendor_id: vendor2._id,
    displayer_status: 'pending',
    fulfiller_status: 'pending',
    multi_vendor_support: true,
    vendor_sales_price: 179.99,
    mtg_id: vendorMtg2_adopted._id,
  });
  await prodAviator.save();
  ok(`DF pending: ${vendor2.name} → "${prodAviator.product_name}" (displayer+fulfiller @ $179.99)`);

  //
  // Scenario B: Vendor3 wants to DISPLAY Vendor1's "Sport Polarized Sunglasses"
  //             as a displayer only. Status: pending
  //
  const prodSport = productsV1[2]; // Sport Polarized Sunglasses
  prodSport.displayer_fulfiller.push({
    vendor_id: vendor3._id,
    displayer_status: 'pending',
    fulfiller_status: 'none',
    multi_vendor_support: true,
    vendor_sales_price: 229.99,
    mtg_id: vendorMtg3_own._id,
  });
  await prodSport.save();
  ok(`DF pending: ${vendor3.name} → "${prodSport.product_name}" (displayer only @ $229.99)`);

  //
  // Scenario C: Vendor2 is an ACTIVE fulfiller for Vendor3's "Gold Aviator Sunglasses"
  //             (admin already approved — to test active flow)
  //
  const prodGoldAviator = productsV3[1]; // Gold Aviator Sunglasses
  prodGoldAviator.displayer_fulfiller.push({
    vendor_id: vendor2._id,
    displayer_status: 'active',
    fulfiller_status: 'active',
    multi_vendor_support: true,
    vendor_sales_price: 250.00,
    mtg_id: vendorMtg2_adopted._id,
  });
  await prodGoldAviator.save();
  ok(`DF active: ${vendor2.name} → "${prodGoldAviator.product_name}" (displayer+fulfiller @ $250)`);

  //
  // Scenario D: Vendor1 is a fulfiller for Vendor2's "Retro Wayfarer" — active
  //
  const prodWayfarer = productsV2[1]; // Retro Wayfarer Sunglasses
  prodWayfarer.displayer_fulfiller.push({
    vendor_id: vendor1._id,
    displayer_status: 'none',
    fulfiller_status: 'active',
    multi_vendor_support: true,
    vendor_sales_price: 165.00,
    mtg_id: vendorMtg1_adopted._id,
  });
  await prodWayfarer.save();
  ok(`DF active: ${vendor1.name} → "${prodWayfarer.product_name}" (fulfiller only @ $165)`);

  //
  // Scenario E: Vendor3 wants to display+fulfill Vendor2's "Slim Rectangle Eyeglasses" — pending
  //
  const prodSlimRect = productsV2[0]; // Slim Rectangle Eyeglasses
  prodSlimRect.displayer_fulfiller.push({
    vendor_id: vendor3._id,
    displayer_status: 'pending',
    fulfiller_status: 'pending',
    multi_vendor_support: true,
    vendor_sales_price: 109.99,
    mtg_id: vendorMtg3_own._id,
  });
  await prodSlimRect.save();
  ok(`DF pending: ${vendor3.name} → "${prodSlimRect.product_name}" (displayer+fulfiller @ $109.99)`);

  // ════════════════════════════════════════════════════════
  //  STEP 12 — Customer Reviews
  // ════════════════════════════════════════════════════════
  section('STEP 12 — Customer Reviews');

  const reviewData = [
    // Reviews for Vendor 1 products
    { vendor: vendor1, product: productsV1[0], email: 'alice@example.com',   text: 'Amazing quality aviators! Super lightweight and comfortable for all-day wear.' },
    { vendor: vendor1, product: productsV1[0], email: 'bob@example.com',     text: 'Great frames but shipping took longer than expected. 4 stars.' },
    { vendor: vendor1, product: productsV1[2], email: 'charlie@example.com', text: 'Perfect polarized lenses. I use these for cycling every weekend.' },
    { vendor: vendor1, product: null,          email: 'dave@example.com',    text: 'YunicBrightVision has great customer service. Highly recommend this store!' },
    // Reviews for Vendor 2 products
    { vendor: vendor2, product: productsV2[1], email: 'eve@example.com',     text: 'These wayfarers are classic. Build quality is impressive for the price.' },
    { vendor: vendor2, product: productsV2[0], email: 'frank@example.com',   text: 'Very comfortable slim frames. My go-to daily pair now.' },
    { vendor: vendor2, product: null,          email: 'grace@example.com',   text: 'OptiVue delivers quality at fair prices. Will buy again!' },
    // Reviews for Vendor 3 products
    { vendor: vendor3, product: productsV3[0], email: 'henry@example.com',   text: 'The rimless titanium frames are a work of art. Worth every penny.' },
    { vendor: vendor3, product: productsV3[1], email: 'iris@example.com',    text: 'Stunning gold aviators. I get compliments everywhere I go.' },
    { vendor: vendor3, product: null,          email: 'jack@example.com',    text: 'ClearSight is the real deal — luxury eyewear with excellent service.' },
  ];

  for (const r of reviewData) {
    const review = await Review.create({
      vendor_id: r.vendor._id,
      product_id: r.product ? r.product._id : null,
      reviewer_email: r.email,
      comment_text: r.text,
      status: 'active',
    });
    ok(`Review: ${r.email} → ${r.product ? r.product.product_name : r.vendor.name + ' (general)'}`);
  }

  // ════════════════════════════════════════════════════════
  //  SUMMARY
  // ════════════════════════════════════════════════════════
  section('POPULATION COMPLETE');

  console.log(`
${CLR.bold}${CLR.green}Database populated successfully!${CLR.reset}

${CLR.bold}Credentials (all passwords: Test1234!)${CLR.reset}
  Admin:   admin@ralbaoptical.com
  Vendor1: yunic@ralbaoptical.com       (YunicBrightVision)
  Vendor2: optivue@ralbaoptical.com     (OptiVue Lens Co)
  Vendor3: clearsight@ralbaoptical.com  (ClearSight Optics)

${CLR.bold}Stores${CLR.reset}
  1. yunicbrightvision      — 6 products (default store)
  2. OptiVue Store          — 4 products
  3. ClearSight Boutique    — 3 products

${CLR.bold}MTG Flow${CLR.reset}
  3 admin MTGs (active)
  2 vendor MTGs pending admin approval (Vendor1, Vendor2)
  1 vendor MTG already approved (Vendor3)
  3 adopted admin MTGs (one per vendor)

${CLR.bold}Displayer / Fulfiller Flow${CLR.reset}
  PENDING (admin must approve):
    - Vendor2 → "Classic Aviator Eyeglasses"      (displayer+fulfiller)
    - Vendor3 → "Sport Polarized Sunglasses"       (displayer only)
    - Vendor3 → "Slim Rectangle Eyeglasses"        (displayer+fulfiller)
  ACTIVE (already approved):
    - Vendor2 → "Gold Aviator Sunglasses"          (displayer+fulfiller)
    - Vendor1 → "Retro Wayfarer Sunglasses"        (fulfiller only)

${CLR.bold}Reviews${CLR.reset}
  10 reviews (7 product-specific + 3 vendor-general)

${CLR.bold}IDs Reference${CLR.reset}
  Admin:   ${admin._id}
  Vendor1: ${vendor1._id}  Store: ${store1._id}
  Vendor2: ${vendor2._id}  Store: ${store2._id}
  Vendor3: ${vendor3._id}  Store: ${store3._id}
`);

  await mongoose.disconnect();
  process.exit(0);
}

// ── Run ────────────────────────────────────────────────────
main().catch(err => {
  console.error(`${CLR.red}FATAL:${CLR.reset}`, err);
  mongoose.disconnect();
  process.exit(1);
});
