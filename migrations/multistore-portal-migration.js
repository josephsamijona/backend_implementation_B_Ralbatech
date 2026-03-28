'use strict';

/**
 * Multi-Store Portal — Database Migration
 *
 * Updates existing collections with new fields added for the
 * Multi-Store Portal feature. Safe to run multiple times (idempotent).
 *
 * Collections updated:
 *   1. mediatextcontents    — adds vendor_id (null) + mtg_status ('active')
 *   2. vendormediatextcontents — adds mtg_status ('active') on existing docs
 *   3. products             — adds displayer_fulfiller ([])
 *   4. reviews              — creates collection + indexes (new)
 *
 * Usage:
 *   cd backend
 *   node migrations/multistore-portal-migration.js
 */

const dotenv = require('dotenv');
const envConf = dotenv.config();
if (envConf.error) {
    console.error('Could not load .env file:', envConf.error.message);
    process.exit(1);
}

const mongoose = require('mongoose');

const MONGO_DB = process.env.MONGO_DB;
if (!MONGO_DB) {
    console.error('MONGO_DB environment variable is not set. Check your .env file.');
    process.exit(1);
}

async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.\n');

    const db = mongoose.connection.db;

    // ──────────────────────────────────────────────
    // 1. mediaTextContents — add vendor_id & mtg_status
    // ──────────────────────────────────────────────
    console.log('=== 1/4  mediatextcontents ===');
    const mtcResult = await db.collection('mediatextcontents').updateMany(
        { vendor_id: { $exists: false } },
        { $set: { vendor_id: null, mtg_status: 'active' } }
    );
    console.log(`  Updated ${mtcResult.modifiedCount} documents (added vendor_id + mtg_status)\n`);

    // Also set mtg_status on docs that have vendor_id but no mtg_status
    const mtcResult2 = await db.collection('mediatextcontents').updateMany(
        { mtg_status: { $exists: false } },
        { $set: { mtg_status: 'active' } }
    );
    console.log(`  Updated ${mtcResult2.modifiedCount} additional documents (mtg_status only)\n`);

    // ──────────────────────────────────────────────
    // 2. vendorMediaTextContents — add mtg_status
    // ──────────────────────────────────────────────
    console.log('=== 2/4  vendormediatextcontents ===');
    const vmtcResult = await db.collection('vendormediatextcontents').updateMany(
        { mtg_status: { $exists: false } },
        { $set: { mtg_status: 'active' } }
    );
    console.log(`  Updated ${vmtcResult.modifiedCount} documents (added mtg_status)\n`);

    // ──────────────────────────────────────────────
    // 3. products — add displayer_fulfiller array
    // ──────────────────────────────────────────────
    console.log('=== 3/4  products ===');
    const prodResult = await db.collection('products').updateMany(
        { displayer_fulfiller: { $exists: false } },
        { $set: { displayer_fulfiller: [] } }
    );
    console.log(`  Updated ${prodResult.modifiedCount} documents (added displayer_fulfiller)\n`);

    // ──────────────────────────────────────────────
    // 4. reviews — create collection + indexes
    // ──────────────────────────────────────────────
    console.log('=== 4/4  reviews ===');
    const collections = await db.listCollections({ name: 'reviews' }).toArray();
    if (collections.length === 0) {
        await db.createCollection('reviews');
        console.log('  Created "reviews" collection');
    } else {
        console.log('  "reviews" collection already exists');
    }

    // Ensure indexes
    const reviewsCol = db.collection('reviews');
    await reviewsCol.createIndex({ vendor_id: 1 }, { name: 'idx_vendor_id' });
    await reviewsCol.createIndex({ product_id: 1 }, { name: 'idx_product_id' });
    await reviewsCol.createIndex({ vendor_id: 1, product_id: 1 }, { name: 'idx_vendor_product' });
    console.log('  Indexes ensured (vendor_id, product_id, vendor_id+product_id)\n');

    // ──────────────────────────────────────────────
    // Summary
    // ──────────────────────────────────────────────
    console.log('=== Migration complete ===');
    console.log('All collections have been updated with Multi-Store Portal fields.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
}

run().catch(err => {
    console.error('Migration failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
