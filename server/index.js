const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes (we'll fill these in Phase 2 & 3)
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transactions.routes'));
app.use('/api/budgets',      require('./routes/budgets.routes'));
app.use('/api/upload',       require('./routes/uploads.routes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Finance Tracker API running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));