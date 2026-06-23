const mongoose = require('mongoose');
const Transaction = require('../models/transactions.models');

const CATEGORIES = [
    'Food','Rent','Transport','Shopping','Entertainment',
    'Utilities','Health','Education','Salary','Freelance','Other'
];

const getTransactions = async (req,res) => {
    try {
        const { type, category, search, from, to , page=1, limit=10} = req.query;

        const query = { userId: req.user.id };

        if(type) query.type = type;
        if(category) query.category = category;

        if(from || to){
            query.date = {};
            if(from) query.date.$gte = new Date(from);
            if(to) query.date.$lte = new Date(to);
        }

        if(search) query.description = { $regex: search, $options: 'i'};

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction
            .find(query)
            .sort({ date: -1})
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            transactions,
            total,
            page: Number(page),
            totalPages: Math.ceil(total/limit),
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const createTransaction = async (req,res) => {
    try {
        const {amount,type,category,description,date} = req.body;

        if(!amount || !type || !category || !date){
            return res.status(400).json({
                message: "Amount, type, date, and category are required."
            })
        }

        if(!['income','expense'].includes(type)){
            return res.status(400).json({
                message: "Type must be income or expense."
            })
        }

        if(!CATEGORIES.includes(category)){
            return res.status(400).json({
                message: "Category must be from the defined list."
            })
        }

        if(Number(amount) <= 0){
            return res.status(400).json({
                message: "Amount must be a positive number."
            })
        }

        const transaction = await Transaction.create({
            userId: req.user.id,
            amount: Number(amount),
            type,
            category,
            description: description || '',
            date: new Date(date),
        });

        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};

const updateTransaction = async (req,res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if(!transaction){
            return res.status(404).json({
                message: 'Transaction not found.'
            });
        }

        const {amount,type,category,description,date} = req.body;

        if(type && !['income','expense'].includes(type)){
            return res.status(400).json({
                message: "Type must be income or expense."
            });
        }

        if(category && !CATEGORIES.includes(category)){
            return res.status(400).json({
                message: "Invalid category."
            });
        }

        if(amount !== undefined && Number(amount) <= 0){
            return res.status(400).json({
                message: "Amount must be a positive number."
            });
        }

        transaction.amount      = amount      ? Number(amount)  : transaction.amount;
        transaction.type        = type        || transaction.type;
        transaction.category    = category    || transaction.category;
        transaction.description = description ?? transaction.description;
        transaction.date        = date        ? new Date(date)  : transaction.date;

        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};

const deleteTransaction = async (req,res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if(!transaction){
            return res.status(400).json({
                message: "Transaction not found."
            });
        }

        res.json({
            message: "Transaction deleted."
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};

const getSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now    = new Date();

    // ── Current month totals ──────────────────────────────────
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthResult = await Transaction.aggregate([
      { $match: { userId, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const income   = monthResult.find(r => r._id === 'income')?.total  || 0;
    const expenses = monthResult.find(r => r._id === 'expense')?.total || 0;

    // ── Category breakdown (expense only, current month) ──────
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort:  { total: -1 } },
    ]);

    // ── 6-month income/expense trend ──────────────────────────
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const trendRaw = await Transaction.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$date' },
            month: { $month: '$date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build ordered 6-month array
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr  = d.getFullYear();
      const mo  = d.getMonth() + 1; // 1-indexed
      const key = MONTH_NAMES[d.getMonth()];

      const expEntry = trendRaw.find(r => r._id.year === yr && r._id.month === mo && r._id.type === 'expense');
      const incEntry = trendRaw.find(r => r._id.year === yr && r._id.month === mo && r._id.type === 'income');

      monthlyTrend.push({
        month:    key,
        expenses: expEntry?.total || 0,
        income:   incEntry?.total || 0,
      });
    }

    res.json({
      income,
      expenses,
      balance:          income - expenses,
      savingsRate:      income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0,
      categoryBreakdown,
      monthlyTrend,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary
};