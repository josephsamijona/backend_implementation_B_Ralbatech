const response = require("../../libs/responseLib");
const MediaTextContent = require('../../models/mediaTextContentModel');
const VendorMediaTextContent = require('../../models/vendorMediaTextContentModel');
const Store = require('../../models/storeModel');
const mongoose = require('mongoose');
const checkLib = require("../../libs/checkLib");

/**
 * getPlatformMTGList
 * Liste tous les MTGs de la plateforme avec statut 'active'
 * Utilisé par le Vendor Portal pour choisir un MTG existant
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
                select: 'store_slug store_name logo'
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
 * Crée un nouveau MTG (vendor) → statut 'pending' jusqu'à approbation admin
 */
let createVendorMTG = async (req, res) => {
    try {
        let vendor_id = req.user.vendor_id;

        // Validation
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
            heading_text: req.body.heading_text,
            description_text: req.body.description_text,
            section_image: req.body.section_image,
            section_image_name: req.body.section_image_name || '',
            tags: req.body.tags || [],
            vendor_id: mongoose.Types.ObjectId(vendor_id),
            mtg_status: 'pending', // Toujours pending — jamais auto-approuvé
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
 * Ajoute un MTG existant de la plateforme à la landing page du vendor
 */
let addMTGToVendorStore = async (req, res) => {
    try {
        let { vendor_id, media_text_contain_id, position } = req.body;

        if (checkLib.isEmpty(vendor_id) || checkLib.isEmpty(media_text_contain_id)) {
            return res.status(400).send(response.generate(1, 'vendor_id and media_text_contain_id are required', {}));
        }

        // Vérifier que le MTG source existe et est actif
        let sourceMTG = await MediaTextContent.findOne({
            _id: mongoose.Types.ObjectId(media_text_contain_id),
            status: 'active',
            mtg_status: 'active'
        }).lean();

        if (!sourceMTG) {
            return res.status(404).send(response.generate(1, 'MTG not found or not active', {}));
        }

        // Vérifier qu'il n'y a pas déjà une entrée pour ce couple (vendor_id + mtg_id)
        let existing = await VendorMediaTextContent.findOne({
            media_text_contain_id: mongoose.Types.ObjectId(media_text_contain_id),
            vendor_id: mongoose.Types.ObjectId(vendor_id)
        }).lean();

        if (existing) {
            return res.status(409).send(response.generate(1, 'This MTG is already added to your store', {}));
        }

        // Créer l'entrée VendorMediaTextContent
        let newVendorMTG = new VendorMediaTextContent({
            media_text_contain_id: mongoose.Types.ObjectId(media_text_contain_id),
            vendor_id: mongoose.Types.ObjectId(vendor_id),
            heading_text: sourceMTG.heading_text,
            description_text: sourceMTG.description_text,
            section_image: sourceMTG.section_image,
            section_image_name: sourceMTG.section_image_name || '',
            tags: sourceMTG.tags || [],
            position: position || 0,
            mtg_status: 'active', // Déjà approuvé car MTG source est actif
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
 * Liste les MTGs de la landing page d'un vendor spécifique (pour le store web portal)
 * Inclut les MTGs d'autres vendors ajoutés par ce vendor
 */
let getVendorStoreLandingMTGs = async (req, res) => {
    try {
        let { store_slug } = req.body;

        if (checkLib.isEmpty(store_slug)) {
            return res.status(400).send(response.generate(1, 'store_slug is required', {}));
        }

        // Trouver le vendor via store_slug
        let store = await Store.findOne({ store_slug: store_slug }).lean();
        if (!store) {
            return res.status(404).send(response.generate(1, 'Store not found', {}));
        }

        let vendor_id = store.store_owner;

        // Trouver tous les VendorMediaTextContent pour ce vendor
        let vendorMTGs = await VendorMediaTextContent.find({
            vendor_id: mongoose.Types.ObjectId(vendor_id),
            status: 'active',
            mtg_status: 'active'
        })
        .populate({
            path: 'media_text_contain_id',
            select: 'vendor_id mtg_status heading_text description_text section_image'
        })
        .sort({ position: 1 })
        .lean();

        // Pour chaque MTG, déterminer le shop_now_store_slug
        let enrichedMTGs = [];
        for (let mtg of vendorMTGs) {
            let shop_now_store_slug = store_slug; // par défaut: la boutique courante

            // Si le MTG source a un vendor_id (créé par un autre vendor)
            if (mtg.media_text_contain_id && mtg.media_text_contain_id.vendor_id) {
                let originalVendorId = mtg.media_text_contain_id.vendor_id;

                // Si ce vendor est différent du vendor courant
                if (originalVendorId.toString() !== vendor_id.toString()) {
                    // Trouver la boutique du vendor original
                    let originalStore = await Store.findOne({
                        store_owner: mongoose.Types.ObjectId(originalVendorId),
                        status: 'active'
                    }).select('store_slug').lean();

                    if (originalStore) {
                        shop_now_store_slug = originalStore.store_slug;
                    }
                }
            }

            enrichedMTGs.push({
                ...mtg,
                shop_now_store_slug: shop_now_store_slug
            });
        }

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
