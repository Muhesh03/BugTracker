const express = require('express');
const router = express.Router();
const liveNoteModel = require('../models/liveticket_notes.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('Live Ticket Note Controller Loaded');

/* ---------------- Upload Folder ---------------- */
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* ---------------- Multer Config ---------------- */
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/\s+/g, '_');
        cb(null, Date.now() + '-' + cleanName);
    }
});
const upload = multer({ storage });

/* ---------------- Upload Files ---------------- */
router.post('/liveticket-note/upload', upload.array('images'), (req, res) => {
    const files = req.files || [];
    const image_paths = files.map(f => f.filename);

    res.status(200).json({
        message: 'Files uploaded successfully',
        image_paths
    });
});

/* ---------------- Get Notes ---------------- */
router.get('/liveticket-note/get/:liveticket_id', async (req, res) => {
    try {
        const liveticket_id = Number(req.params.liveticket_id); // Ensure it's a number
        console.log("Type of liveticket_id:", typeof liveticket_id, liveticket_id);

        const notes = await liveNoteModel.getNotesByTicket(liveticket_id);
        console.log("Notes fetched:", notes);

        res.json({ data: notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ---------------- Save Note ---------------- */
router.post('/liveticket-note/save', async (req, res) => {
    try {
        const payload = {
            liveticket_id: parseInt(req.body.liveticket_id, 10),   // integer
            note_text: req.body.note_text || '',                   // never null
            attachments: req.body.attachments || [],              // array
            created_by: req.body.created_by,                 // valid user
        };
            console.log("hhhhhhhhhhhheeeeeeeeeeeeeeeeeeeeeeeeelllllllllllll",payload)


        const inserted = await liveNoteModel.addNotesByTicket(payload);
        const insertedNote = inserted[0];


        res.json({
            message: 'Live note added successfully',
            data: insertedNote
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports.router = router;