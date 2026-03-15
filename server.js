const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Parse DATABASE_URL من environment variable
// Format: mysql://user:password@host:port/database
const dbUrl = process.env.DATABASE_URL;

let metrics = { pageViews: 0, writes: 0 };

// دالة للتحقق من الاتصال بـ DB
async function checkDB() {
  if (!dbUrl) return false;
  try {
    const conn = await mysql.createConnection(dbUrl);
    await conn.ping();
    await conn.end();
    return true;
  } catch (err) {
    console.error('DB connection failed:', err.message);
    return false;
  }
}

// GET /api/time
app.get('/api/time', (req, res) => {
  metrics.pageViews++;
  res.json({ time: new Date().toISOString() });
});

// POST /api/demo-write
app.post('/api/demo-write', (req, res) => {
  metrics.writes++;
  res.json({ total: metrics.writes });
});

// GET /api/metrics - مع فحص DB
app.get('/api/metrics', async (req, res) => {
  const dbStatus = await checkDB();
  res.json({
    pageViews: metrics.pageViews,
    writes: metrics.writes,
    db: dbStatus   // ← سيصبح true إذا الاتصال نجح
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
