    const mongoose = require('mongoose');
    const Budget = require("../models/budget.models");
    const Transaction = require('../models/transactions.models');

    const getBudgets = async (req,res) => {
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const budgets = await Budget.find({ userId: req.user.id, month,year});

            const start = new Date(year, month -1,1);
            const end = new Date(year,month,0);

            const spending = await Transaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(req.user.id),
                        type: 'expense',
                        date: {$gte: start, $lte: end},
                    },
                },
                {
                    $group: {
                        _id: '$category',
                        spent: {$sum: '$amount'},
                    },
                },
            ]);

            const spendingMap = {};
            spending.forEach(s => { spendingMap[s._id] = s.spent; });

            const result = budgets.map(b => ({
            _id:         b._id,
            category:    b.category,
            limitAmount: b.limitAmount,
            spent:       spendingMap[b.category] || 0,
            month:       b.month,
            year:        b.year,
            }));

            res.json(result);
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    };

    const upsertBudget = async (req,res) => {
        try {
            const {category, limitAmount} = req.body;
            
            if(!category || !limitAmount){
                return res.status(400).json({
                    message: "Category and limit Amount are required."
                });
            }

            if(Number(limitAmount) <= 0){
                return res.status(400).json({
                    message: "Limit amount must be positive."
                });
            }

            const now   = new Date();
            const month = now.getMonth() + 1;
            const year  = now.getFullYear();

            const budget = await Budget.findOneAndUpdate(
                {userId: req.user.id, category, month, year},
                {limitAmount: Number(limitAmount)},
                {new: true, upsert: true, runValidators: true}
            );

            res.status(201).json(budget);
        } catch (err) {
            res.status(500).json({
                message: "Server Error",
                error: err.message
            });
        }
    };

    const deleteBudget = async (req,res) => {
        try {
            const budget = await Budget.findOneAndDelete({
                _id: req.params.id,
                userId: req.user.id
            });

            if(!budget){
                return res.status(404).json({
                    message: 'Budget not found',
                });
            }

            res.json({ message: 'Budget deleted' });
        } catch (err) {
            return res.status(500).json({
                message: "Server error",
                error: err.message
            })
        }
    };

    module.exports = {
        getBudgets,
        upsertBudget,
        deleteBudget
    };
