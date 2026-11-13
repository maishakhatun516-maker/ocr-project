const express = require('express');
const cors = require('cors');
const ocrRoutes = require('./routes/ocr');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/ocr', ocrRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'OCR Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});