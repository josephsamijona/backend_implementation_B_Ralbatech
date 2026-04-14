const response = require("../../libs/responseLib");
const Review = require('../../models/reviewsModel');
const mongoose = require('mongoose');
const checkLib = require("../../libs/checkLib");

const toObjectId = (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    return mongoose.Types.ObjectId(id);
};

/**
 * getVendorReviews
 * Reviews d'un vendor (optionnellement filtrees par produit)
 */
let getVendorReviews = async (req, res) => {
    try {
        const vendorId = toObjectId(req.params.vendor_id);

        if (!vendorId) {
            return res.status(400).send(response.generate(1, 'vendor_id is invalid', {}));
        }

        let query = {
            vendor_id: vendorId,
            status: 'active'
        };

        if (req.query.product_id) {
            const productId = toObjectId(req.query.product_id);
            if (!productId) {
                return res.status(400).send(response.generate(1, 'product_id is invalid', {}));
            }
            query.product_id = productId;
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
 * Creer une review pour un vendor
 */
let createReview = async (req, res) => {
    try {
        let { vendor_id, product_id, reviewer_email, comment_text } = req.body;

        const vendorId = toObjectId(vendor_id);
        if (!vendorId) {
            return res.status(400).send(response.generate(1, 'vendor_id is invalid', {}));
        }

        const cleanComment = typeof comment_text === 'string' ? comment_text.trim() : '';
        if (checkLib.isEmpty(cleanComment)) {
            return res.status(400).send(response.generate(1, 'comment_text is required', {}));
        }
        if (cleanComment.length > 2000) {
            return res.status(400).send(response.generate(1, 'comment_text must not exceed 2000 characters', {}));
        }

        let productId = null;
        if (product_id !== undefined && product_id !== null && String(product_id).trim() !== '') {
            productId = toObjectId(product_id);
            if (!productId) {
                return res.status(400).send(response.generate(1, 'product_id is invalid', {}));
            }
        }

        let newReview = new Review({
            vendor_id: vendorId,
            product_id: productId,
            reviewer_email: reviewer_email || '',
            comment_text: cleanComment
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