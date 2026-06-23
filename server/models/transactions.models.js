const mongoose = require('mongoose');

const CATEGORIES = [
    'Food','Rent','Transport','Shopping','Entertainment',
    'Utilities','Health','Education','Salary','Freelance','Other'
]

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        required: true,
        enum: ['income','expense'],
    },
    category: {
        type: String,
        required: true,
        enum: CATEGORIES,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        default: ' ',
    },
    date: {
        type: Date,
        required: true
    },
},
{ timestamps: true}
)

module.exports = mongoose.model('Transaction', transactionSchema);