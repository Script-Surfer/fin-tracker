const { parse } = require('csv-parse');
const Transaction = require('../models/transactions.models');

const CATEGORIES = [
  'Food','Rent','Transport','Shopping','Entertainment',
  'Utilities','Health','Education','Salary','Freelance','Other',
];

const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const rows = [];

    // Parse CSV from buffer
    await new Promise((resolve, reject) => {
      parse(fileBuffer, {
        columns:          true,
        skip_empty_lines: true,
        trim:             true,
      }, (err, records) => {
        if (err) return reject(err);
        rows.push(...records);
        resolve();
      });
    });

    let inserted = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, accounting for header row

      // ── Validate date ──────────────────────────────────────
      const parsedDate = new Date(row.date);
      if (!row.date || isNaN(parsedDate.getTime())) {
        errors.push(`Row ${rowNum}: invalid date "${row.date}"`);
        continue;
      }

      // ── Validate type ──────────────────────────────────────
      const type = (row.type || '').toLowerCase().trim();
      if (!['income', 'expense'].includes(type)) {
        errors.push(`Row ${rowNum}: type must be "income" or "expense", got "${row.type}"`);
        continue;
      }

      // ── Validate amount ────────────────────────────────────
      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Row ${rowNum}: amount must be a positive number, got "${row.amount}"`);
        continue;
      }

      // ── Normalize category ─────────────────────────────────
      const rawCat = (row.category || '').trim();
      const category = CATEGORIES.find(
        c => c.toLowerCase() === rawCat.toLowerCase()
      ) || 'Other';

      // ── Insert ─────────────────────────────────────────────
      try {
        await Transaction.create({
          userId:      req.user.id,
          amount,
          type,
          category,
          description: (row.description || '').trim(),
          date:        parsedDate,
        });
        inserted++;
      } catch (dbErr) {
        errors.push(`Row ${rowNum}: DB error — ${dbErr.message}`);
      }
    }

    res.json({
      inserted,
      skipped: errors.length,
      errors,
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

module.exports = { uploadCSV };
