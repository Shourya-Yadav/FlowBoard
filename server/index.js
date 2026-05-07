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
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   TEST ROUTE
========================================================= */

app.get('/', (req, res) => {
  res.send('FlowBoard Backend Running 🚀');
});

/* =========================================================
   API ROUTES
========================================================= */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

/* =========================================================
   SERVE FRONTEND (OPTIONAL)
========================================================= */

if (process.env.NODE_ENV === 'production') {
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
}

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
  });
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});