const router = require('express').Router();
const protect = require('../middleware/auth');

const {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary
} = require('../controllers/transactionControllers');

router.get('/summary',protect,getSummary);
router.get('/',protect,getTransactions);
router.post('/',protect,createTransaction);
router.put('/:id',protect,updateTransaction);
router.delete('/:id',protect,deleteTransaction);

module.exports = router;