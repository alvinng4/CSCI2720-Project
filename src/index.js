require('dotenv').config();
const { connectDB } = require('./config/db');
const { ensureAdmin } = require('./config/env');

const app = require('./app');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    await ensureAdmin(); // 初次启动确保有一个 admin 账号
    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();