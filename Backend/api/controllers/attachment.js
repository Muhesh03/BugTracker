// Backend/api/controllers/attachment.js



const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const userdb = require('../models/users.js');

/* ----------TO save  upload FOLDER ---------- */
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: uploadDir,
  // filename: (req, file, cb) => {
  //   cb(null, Date.now() + '-' + file.originalname);
  // }
  filename: (req, file, cb) => {
  const cleanName = file.originalname.replace(/\s+/g, '_');
  cb(null, Date.now() + '-' + cleanName);
}
});

const upload = multer({ storage });

/* ---------- UPLOAD ATTACHMENT ---------- */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log('FILE:', req.file);
    console.log('BODY:', req.body);

    if (!req.file || !req.body.user_id) {
      return res.status(400).send({ message: 'Invalid Upload' });
    }

    const params = {
      user_id: Number(req.body.user_id),
      attachment_name: req.file.filename
    };

    userdb.saveAttachment(params, (err, output) => {
      if (err) {
        console.error('Attachment save error:', err);
        return res.status(500).send({
          message: 'Attachment upload failed'
        });
      }

      return res.status(201).send({
        user_id: params.user_id,
        attachment_name: params.attachment_name,
        message: 'Attachment uploaded successfully',
        data: output
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

/* ---------- LIST ATTACHMENT ---------- */
router.get('/list/:userId', (req, res) => {
  const userId = Number(req.params.userId);

  userdb.getAttachment(userId, (err, output) => {
    if (err) {
      return res.status(500).send({ message: 'Fetch failed' });
    }
    res.send(output);
  });
});
/* ---------- DOWNLOAD / VIEW ---------- */
router.get('/download/:filename', (req, res) => {
  try {
    const fileName = req.params.filename;

    if (!fileName) {
      return res.status(400).json({ message: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../../uploads', fileName);

    console.log('DOWNLOAD FILE PATH:', filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports.router = router;
