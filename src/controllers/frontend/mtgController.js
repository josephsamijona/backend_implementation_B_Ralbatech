const response = require("../../libs/responseLib");
const MediaTextContent = require('../../models/mediaTextContentModel');
const VendorMediaTextContent = require('../../models/vendorMediaTextContentModel');
const Store = require('../../models/storeModel');
const mongoose = require('mongoose');
const checkLib = require("../../libs/checkLib");

const toObjectId = (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    return mongoose.Types.ObjectId(id);
};

/**
 * getPlatformMTGList
 * Liste tous les MTGs de la plateforme avec statut 'active'
 */
let getPlatformMTGList = async (req, res) => {
    try {
        let mtgList = await MediaTextContent.find({
            status: 'active',
            mtg_status: 'active'
        })
            .populate({
                path: 'vendor_id',
                select: 'name stores',
                populate: {
                    path: 'stores',
                    select: 'store_slug store_name logo status'
                }
            })
            .sort({ position: 1 })
            .lean();

        let apiResponse = response.generate(0, 'Platform MTG list retrieved successfully', { mtgList });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * createVendorMTG
 * Crée un nouveau MTG vendor -> pending
 */
let createVendorMTG = async (req, res) => {
    try {
        let vendorId = toObjectId(req?.user?.vendor_id);
        if (!vendorId) {
            return res.status(401).send(response.generate(1, 'Invalid vendor token', {}));
        }

        if (checkLib.isEmpty(req.body.heading_text)) {
            return res.status(400).send(response.generate(1, 'heading_text is required', {}));
        }
        if (checkLib.isEmpty(req.body.description_text)) {
            return res.status(400).send(response.generate(1, 'description_text is required', {}));
        }
        if (checkLib.isEmpty(req.body.section_image)) {
            return res.status(400).send(response.generate(1, 'section_image is required', {}));
        }

        let newMTG = new MediaTextContent({
            heading_text: String(req.body.heading_text).trim(),
            description_text: String(req.body.description_text).trim(),
            section_image: req.body.section_image,
            section_image_name: req.body.section_image_name || '',
            tags: Array.isArray(req.body.tags) ? req.body.tags : [],
            vendor_id: vendorId,
            mtg_status: 'pending',
            status: 'active'
        });

        let savedMTG = await newMTG.save();
        let apiResponse = response.generate(0, 'MTG created successfully. Pending admin approval.', savedMTG);
        res.status(201).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * addMTGToVendorStore
 * Ajoute un MTG existant à la landing page du vendor connecté
 */
let addMTGToVendorStore = async (req, res) => {
    try {
        const vendorId = toObjectId(req?.user?.vendor_id);
        const mediaTextContainId = toObjectId(req.body.media_text_contain_id);
        const position = Number.isFinite(Number(req.body.position)) ? Number(req.body.position) : 0;

        if (!vendorId) {
            return res.status(401).send(response.generate(1, 'Invalid vendor token', {}));
        }
        if (!mediaTextContainId) {
            return res.status(400).send(response.generate(1, 'media_text_contain_id is required', {}));
        }

        let sourceMTG = await MediaTextContent.findOne({
            _id: mediaTextContainId,
            status: 'active',
            mtg_status: 'active'
        }).lean();

        if (!sourceMTG) {
            return res.status(404).send(response.generate(1, 'MTG not found or not active', {}));
        }

        let existing = await VendorMediaTextContent.findOne({
            media_text_contain_id: mediaTextContainId,
            vendor_id: vendorId,
            status: { $ne: 'deleted' }
        }).lean();

        if (existing) {
            return res.status(409).send(response.generate(1, 'This MTG is already added to your store', {}));
        }

        let newVendorMTG = new VendorMediaTextContent({
            media_text_contain_id: mediaTextContainId,
            vendor_id: vendorId,
            heading_text: sourceMTG.heading_text,
            description_text: sourceMTG.description_text,
            section_image: sourceMTG.section_image,
            section_image_name: sourceMTG.section_image_name || '',
            tags: sourceMTG.tags || [],
            position,
            mtg_status: 'active',
            status: 'active'
        });

        let savedEntry = await newVendorMTG.save();
        let apiResponse = response.generate(0, 'MTG added to store successfully', savedEntry);
        res.status(201).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * getVendorStoreLandingMTGs
 * Liste les MTGs de la landing page d'un vendor spécifique
 */
let getVendorStoreLandingMTGs = async (req, res) => {
    try {
        let { store_slug } = req.body;

        if (checkLib.isEmpty(store_slug)) {
            return res.status(400).send(response.generate(1, 'store_slug is required', {}));
        }

        let store = await Store.findOne({ store_slug, status: 'active' }).select('_id store_slug store_name logo store_owner').lean();
        if (!store) {
            return res.status(404).send(response.generate(1, 'Store not found', {}));
        }

        let vendorId = toObjectId(store.store_owner);
        if (!vendorId) {
            return res.status(404).send(response.generate(1, 'Store owner not found', {}));
        }

        let vendorMTGs = await VendorMediaTextContent.find({
            vendor_id: vendorId,
            status: 'active',
            mtg_status: 'active'
        })
            .populate({
                path: 'media_text_contain_id',
                select: 'vendor_id mtg_status heading_text description_text section_image status',
                match: { status: 'active', mtg_status: 'active' }
            })
            .sort({ position: 1 })
            .lean();

        const sourceVendorIds = new Set();
        for (const mtg of vendorMTGs) {
            const srcVendor = mtg?.media_text_contain_id?.vendor_id;
            if (srcVendor && srcVendor.toString() !== vendorId.toString()) {
                sourceVendorIds.add(srcVendor.toString());
            }
        }

        let sourceStoreMap = new Map();
        if (sourceVendorIds.size > 0) {
            const sourceStores = await Store.find({
                store_owner: { $in: Array.from(sourceVendorIds).map(id => mongoose.Types.ObjectId(id)) },
                status: 'active'
            })
                .select('store_owner store_slug store_name logo')
                .lean();

            for (const s of sourceStores) {
                sourceStoreMap.set(String(s.store_owner), {
                    store_slug: s.store_slug,
                    store_name: s.store_name || '',
                    store_logo: s.logo || ''
                });
            }
        }

        const enrichedMTGs = vendorMTGs
            .filter((mtg) => !!mtg.media_text_contain_id)
            .map((mtg) => {
                let shopNowStoreSlug = store.store_slug;
                let shopNowStoreName = store.store_name || '';
                let shopNowStoreLogo = store.logo || '';
                const srcVendor = mtg?.media_text_contain_id?.vendor_id ? String(mtg.media_text_contain_id.vendor_id) : null;

                if (srcVendor && srcVendor !== String(vendorId) && sourceStoreMap.has(srcVendor)) {
                    const sourceStore = sourceStoreMap.get(srcVendor);
                    shopNowStoreSlug = sourceStore.store_slug;
                    shopNowStoreName = sourceStore.store_name;
                    shopNowStoreLogo = sourceStore.store_logo;
                }

                return {
                    ...mtg,
                    shop_now_store_slug: shopNowStoreSlug,
                    shop_now_store_name: shopNowStoreName,
                    shop_now_store_logo: shopNowStoreLogo,
                    shop_now_store_path: `/${shopNowStoreSlug}`,
                    is_cross_store: shopNowStoreSlug !== store.store_slug
                };
            });

        let apiResponse = response.generate(0, 'Vendor store landing MTGs retrieved successfully', { mtgList: enrichedMTGs });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

module.exports = {
    getPlatformMTGList,
    createVendorMTG,
    addMTGToVendorStore,
    getVendorStoreLandingMTGs
};

