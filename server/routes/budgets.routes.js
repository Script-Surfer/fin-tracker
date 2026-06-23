const router = require('express').Router();
const protect = require('../middleware/auth');
const {getBudgets,upsertBudget,deleteBudget} = require('../controllers/budget.controller');

router.get('/', protect,getBudgets);
router.post('/',protect,upsertBudget);
router.delete('/:id',protect,deleteBudget);

module.exports = router;