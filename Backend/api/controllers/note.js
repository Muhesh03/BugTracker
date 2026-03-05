const express = require('express');
const router = express.Router();
const ticketHistoryModel = require('../models/note.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('Hello from note controller');

/* ---------- upload folder ---------- */
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/\s+/g, '_');
        cb(null, Date.now() + '-' + cleanName);
    }
});

const upload = multer({ storage });

router.post('/upload', upload.array('images'), (req, res) => {
    console.log('Files received:======================================================', req.files);
    console.log('Body received:========================================================', req.body);
    const files = req.files || [];
    // const image_paths = files.map(f => `/uploads/${f.filename}`);
    const image_paths = files.map(f => f.filename);

    console.log('Mapped image paths:=================================================', image_paths);
    console.log('Upload directory path:=================================================', uploadDir);
    res.status(200).json({
        message: 'Files uploaded successfully',
        image_paths
    });
});

router.get('/:issueticket_id', async (req, res) => {
    console.log('Fetching notes for ticket ID:', req.params.issueticket_id);
    const { issueticket_id } = req.params;
    const data = await ticketHistoryModel.getNotesByTicket(issueticket_id);
    console.log('Notes fetched:', data);
    res.json({ data });
});

router.post('/save', async (req, res) => {
    console.log('Received note data:=====================================================================================================================', req.body);

    const payload = {
        issueticket_id: req.body.issueticket_id,
        note: req.body.note,
        attachments: req.body.attachments || [],
        updated_by: req.body.updated_by
    };

    await ticketHistoryModel.addNotesByTicket(payload);

    await knex('ticket_activity').insert({
        issueticket_id: payload.issueticket_id,
        user_id: payload.updated_by,
        field_name: 'Note Added',
        old_value: null,
        new_value: null,
        created_at: knex.fn.now()
    });
    res.json({ message: 'Note added successfully' });
});

module.exports.router = router;
