const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const VendorChargeSchema = new Schema({
    charge_type: {
        type: String,
        required: true,  // Charge type is required
        enum: ['3D Asset', 'Copy Product', 'Other'],  // Limited to specific types of charges
        message: 'Invalid charge type'
    },
    charge_percentage: {
        type: Number,
        required: true,  // Charge percentage is required
        min: [0, 'Charge percentage cannot be less than 0'],
        max: [100, 'Charge percentage cannot be more than 100'],
        validate: {
            validator: function (v) {
                return Number.isInteger(v);  // Ensure percentage is an integer
            },
            message: props => `${props.value} is not a valid charge percentage!`
        }
    }
});

const CommissionSchema = new Schema({
    platform_charge: {
        type: Number,
        required: true,  // Platform-wide commission charge is required
        min: [0, 'Platform charge cannot be less than 0'],
        max: [100, 'Platform charge cannot be more than 100'],
        validate: {
            validator: function (v) {
                return Number.isInteger(v);  // Ensure percentage is an integer
            },
            message: props => `${props.value} is not a valid platform charge!`
        }
    },
    vendor_charges: {
        type: [VendorChargeSchema],  // Array of vendor-specific charges by charge_type
        validate: {
            validator: function (v) {
                return v.length > 0;  // At least one charge type is required
            },
            message: 'There must be at least one vendor charge'
        }
    },
    created_at: {
        type: Date,
        default: Date.now  // Auto-generated timestamp for when the commission is created
    },
    updated_at: {
        type: Date,
        default: Date.now  // Auto-updated timestamp for when the commission is updated
    }
});

CommissionSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Commission', CommissionSchema);
