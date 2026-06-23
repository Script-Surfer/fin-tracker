const router  = require('express').Router();
const multer  = require('multer');
const protect = require('../middleware/auth');
const { uploadCSV } = require('../controllers/upload.controller');

// Store file in memory (no disk writes) — max 2 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are accepted.'), false);
    }
  },
});

router.post('/', protect, upload.single('file'), uploadCSV);

module.exports = router;
