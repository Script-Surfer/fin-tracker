const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    limitAmount: {
        type: Number,
        required: true,
        min: 0
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
},
{timestamps: true}
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
