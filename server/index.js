const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   API ROUTES
========================================================= */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

/* =========================================================
   TEST API
========================================================= */

app.get('/api/test', (req, res) => {
  res.json({
    message: 'FlowBoard Backend Running 🚀',
  });
});

/* =========================================================
   FRONTEND STATIC FILES
========================================================= */

app.use(
  express.static(
    path.join(__dirname, '../client/dist')
  )
);

app.get('*', (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      '../client/dist/index.html'
    )
  );
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});