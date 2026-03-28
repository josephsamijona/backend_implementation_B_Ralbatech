const response = require("../../libs/responseLib");
const Review = require('../../models/reviewsModel');
const mongoose = require('mongoose');
const checkLib = require("../../libs/checkLib");

/**
 * getVendorReviews
 * Reviews d'un vendor (optionnellement filtrées par produit)
 */
let getVendorReviews = async (req, res) => {
    try {
        let vendor_id = req.params.vendor_id;

        if (checkLib.isEmpty(vendor_id)) {
            return res.status(400).send(response.generate(1, 'vendor_id is required', {}));
        }

        let query = {
            vendor_id: mongoose.Types.ObjectId(vendor_id),
            status: 'active'
        };

        // Filtre optionnel par produit
        if (req.query.product_id) {
            query.product_id = mongoose.Types.ObjectId(req.query.product_id);
        }

        let reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .lean();

        let apiResponse = response.generate(0, 'Reviews retrieved successfully', { reviews });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * createReview
 * Créer une review pour un vendor
 */
let createReview = async (req, res) => {
    try {
        let { vendor_id, product_id, reviewer_email, comment_text } = req.body;

        // Validations
        if (checkLib.isEmpty(vendor_id)) {
            return res.status(400).send(response.generate(1, 'vendor_id is required', {}));
        }
        if (checkLib.isEmpty(comment_text)) {
            return res.status(400).send(response.generate(1, 'comment_text is required', {}));
        }
        if (comment_text.length > 2000) {
            return res.status(400).send(response.generate(1, 'comment_text must not exceed 2000 characters', {}));
        }

        let newReview = new Review({
            vendor_id: mongoose.Types.ObjectId(vendor_id),
            product_id: product_id ? mongoose.Types.ObjectId(product_id) : null,
            reviewer_email: reviewer_email || '',
            comment_text: comment_text
        });

        let savedReview = await newReview.save();
        let apiResponse = response.generate(0, 'Review created successfully', savedReview);
        res.status(201).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

module.exports = {
    getVendorReviews,
    createReview
};
