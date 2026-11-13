const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(`📷 Processing: ${req.file.originalname}`);

    const result = await Tesseract.recognize(
      req.file.buffer,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Progress: ${(m.progress * 100).toFixed(0)}%`);
          }
        },
      }
    );

    const extractedText = result.data.text.trim();

    if (!extractedText) {
      return res.status(422).json({
        error: 'No readable text found in the image',
      });
    }

    res.json({
      success: true,
      text: extractedText,
      confidence: result.data.confidence,
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({
      error: 'Failed to extract text from image',
      message: error.message,
    });
  }
});

module.exports = router;