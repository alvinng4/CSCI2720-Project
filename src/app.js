const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const locationsRoutes = require('./routes/locations.routes');
const eventsRoutes = require('./routes/events.routes');
const commentsRoutes = require('./routes/comments.routes');
const adminRoutes = require('./routes/admin.routes');
const errorMiddleware = require('./middleware/error');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/admin', adminRoutes);

// 错误处理中间件
app.use(errorMiddleware);

module.exports = app;