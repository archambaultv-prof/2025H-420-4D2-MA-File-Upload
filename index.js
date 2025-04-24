const express        = require('express');
const path           = require('path');
const uploadRouter   = require('./routes/upload');
const downloadRouter = require('./routes/download');

const app  = express();
const PORT = process.env.PORT || 3000;

// serve static HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// JSON body-parser (not strictly needed here)
app.use(express.json());

// API
app.use('/api', uploadRouter);
app.use('/api', downloadRouter);

// start
app.listen(PORT, () => {
  console.log(`🚀 Server listening: http://localhost:${PORT}`);
});
