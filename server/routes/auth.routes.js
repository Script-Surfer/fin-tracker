const router = require('express').Router();
const protect = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    getMe,
    changePassword,
    updateSettings,
} = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login',    loginUser);
router.get('/me',        protect, getMe);
router.put('/password',  protect, changePassword);
router.put('/settings',  protect, updateSettings);

module.exports = router;