
const express = require('express');
const liveticketdb = require('../models/liveticket.js');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });


router.post('/liveticket/save_data', function (req, res) {
    knex('livetickets')
        .orderBy('liveticket_id', 'desc')
        .first()
        .then(lastTicket => {
            let nextNumber = 1;
            if (lastTicket && lastTicket.ticket_number) {
                const parts = lastTicket.ticket_number.split('/');
                nextNumber = parseInt(parts[1], 10) + 1;
            }

            const ticketnumber = 'CT/' + nextNumber.toString().padStart(4, '0');

            const params = {
                summary: req.body.summary,
                instance: req.body.instance,
                unit: req.body.unit,
                description: req.body.description,
                priority_id: req.body.priority_id,
                ticket_tag: req.body.ticket_tag || [],
                status_id: 1,
                tickettype_id: req.body.tickettype_id,
                ticketstatus_id: req.body.ticketstatus_id,
                ticket_number: ticketnumber,
                image_path: req.body.image_path,
                steps_to_reproduce: req.body.steps_to_reproduce || null,
                updated_by: req.body.reported_by,
                created_by: req.body.reported_by,
                project_id: req.body.storedprojectId,  
                created_at: new Date()
            };

            liveticketdb.saveLiveTicket(params, function (err, output) {
                if (err) {
                    console.error('DB Error:', err);
                    return res.status(500).send({ error: 'Something went wrong!' });
                }
                res.status(200).send({
                    data: output,
                    actionMessage: "Issue ticket saved successfully"
                });
            });
        })
        .catch(err => {
            console.error('DB Error fetching last ticket:', err);
            res.status(500).send({ error: 'Something went wrong!' });
        });
});

router.get('/liveticket/filter/list', function (req, res) {
    liveticketdb.getFilter(req.query, (err, output) => {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in filter controller" });
        }
        res.status(200).send({ message: "Filtered list", data: output });
    });
});

router.get('/liveticket/list', function (req, res) {
    liveticketdb.getLiveTicket(req.query, (err, output) => {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in liveticket controller" });
        }
        res.status(200).send({ message: "Live ticket list", data: output });
        console.log("live ticket to frontend", output);
    });
});

router.get('/liveticket/latestticketnumber', async (req, res) => {
    try {
        const lastTicket = await knex('livetickets')
            .orderBy('liveticket_id', 'desc')
            .first();

        let ticket_number = 'CT/0001';
        if (lastTicket && lastTicket.ticket_number) {
            const parts = lastTicket.ticket_number.split('/');
            const prefix = parts[0];
            const lastNum = parseInt(parts[1], 10);
            const nextNum = lastNum + 1;
            const padded = String(nextNum).padStart(4, '0');
            ticket_number = `${prefix}/${padded}`;
        }

        res.status(200).send({ data: { ticket_number } });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Something went wrong!' });
    }
});

router.get('/liveticket/tickettype/list', function (req, res) {
    liveticketdb.gettickettype((err, output) => {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in type controller" });
        }
        res.status(200).send({ message: "Ticket types list", data: output });
    });
});

router.get('/liveticket/statuses/list', function (req, res) {
    liveticketdb.getTicketStatus((err, output) => {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in status controller" });
        }
        res.status(200).send({ message: "Ticket statuses list", data: output });
    });
});

router.get('/liveticket/priorities/list', function (req, res) {
    liveticketdb.getPriorities((err, output) => {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in priority controller" });
        }
        res.status(200).send({ message: "Ticket priorities list", data: output });
    });
});

router.post('/liveticket/upload', upload.array('images'), (req, res) => {
    console.log('Uploaded files:', req.files);
    if (!req.files) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ success: true, image_paths: imagePaths });
});

router.get('/liveticket/tags/list', function (req, res) {
    liveticketdb.getTags((err, output) => {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in tag controller" });
        }
        res.status(200).send({ message: "Ticket tags list", data: output });
    });
});

router.put('/liveticket/markconverted/:liveticket_id', function (req, res) {
    liveticketdb.markAsConverted(req.params.liveticket_id, function (err, output) {
        if (err) {
            return res.status(500).send({ error: 'Something went wrong' });
        }
        res.status(200).send({ success: true, message: 'Marked as converted' });
    });
});


router.get('/liveticket/liveticket-statuses/list', function (req, res) {
    liveticketdb.getLiveticketStatuses(function (err, output) {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in liveticket status controller" });
        }
        res.status(200).send({ message: "Liveticket statuses list", data: output });
    });
});

module.exports.router = router;
