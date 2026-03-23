const express = require('express');
const liveticketdb = require('../models/liveticket.js');
const router = express.Router();
const multer = require('multer'); //extra imported
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



router.use(function (req, res, next) {

    router.post('/liveticket/save_data', function (req, res) {

        // Get last ticket to generate unique code
        knex('livetickets')
            .orderBy('liveticket_id', 'desc')
            .first()
            .then(lastTicket => {
                // Calculate next number
                let nextNumber = 1;
                if (lastTicket && lastTicket.ticket_number) {
                    const parts = lastTicket.ticket_number.split('/');
                    nextNumber = parseInt(parts[1], 10) + 1;
                }

                // Generate unique ticket code
                const ticketnumber = 'CT/' + nextNumber.toString().padStart(2, '0');

                // Prepare params and include ticketCode
                const params = {
                    summary: req.body.summary,
                    // user_id: req.body.user_id,
                    instance: req.body.instance,
                    unit: req.body.unit,
                    description: req.body.description,
                    priority_id: req.body.priority_id,
                    ticket_tag: req.body.ticket_tag || [], // array of tag IDs
                    status_id: 1,
                    tickettype_id: req.body.tickettype_id,
                    ticketstatus_id: req.body.ticketstatus_id,
                    ticket_number: ticketnumber,// Add the generated code here
                    image_path: req.body.image_path,
                    steps_to_reproduce: req.body.steps_to_reproduce || null,
                    updated_by: req.body.reported_by,
                    created_by: req.body.reported_by,
                    created_at: new Date()
                };



                // Save to DB
                liveticketdb.saveLiveTicket(params, function (err, output) {
                    if (err) {
                        console.error('DB Error:', err);
                        return res.status(500).send({ error: 'Something went wrong!' });
                    } else {
                        const items = {
                            data: output,
                            actionMessage: "Issue ticket saved successfully"
                        };
                        console.log('Issue ticket saved in db', items);
                        res.status(200).send(items);
                    }
                    // res.status(200).send({
                    //     message: "Ticket priorities list",
                    //     data: output
                    // });
                });

            })
            .catch(err => {
                console.error('DB Error fetching last ticket:', err);
                res.status(500).send({ error: 'Something went wrong!' });
            });

    });



    router.route('/liveticket/filter/list').get(function (req, res) {


        liveticketdb.getFilter(req.query, (err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in priority controller"
                });
            }

            res.status(200).send({
                message: "Ticket priorities list",
                data: output,
            });
        });
    });




    router.route('/liveticket/list').get(function (req, res) {
        // const projectId = req.query.projectid;
        const userId = req.query.userid;

        liveticketdb.getLiveTicket(req.query, (err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in priority controller"
                });
            }

            res.status(200).send({
                message: "Ticket priorities list",
                data: output
            });
            console.log("lllliiiiiivvvvveeeeeeeeee ticket to frontedn", output)
        });
    });

    //    router.get('/liveticket/latestticketnumber', async (req, res) => {
    //             try {
    //                 const lastTicket = await knex('livetickets')
    //                     .orderBy('liveticket_id', 'desc')
    //                     .first();

    //                 const ticket_number = lastTicket ? lastTicket.ticket_number : 'CT/01';

    //                 res.status(200).send({
    //                     data: { ticket_number }
    //                 });
    //             } catch (err) {
    //                 console.error(err);
    //                 res.status(500).send({ error: 'Something went wrong!' });
    //             }
    //         });

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

    router.route('/liveticket/tickettype/list').get(function (req, res) {

        liveticketdb.gettickettype((err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in type controller"
                });
            }

            res.status(200).send({
                message: "Ticket types list",
                data: output,
            });
        });
    });



    router.route('/liveticket/statuses/list').get(function (req, res) {

        liveticketdb.getTicketStatus((err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in status controller"
                });
            }

            res.status(200).send({
                message: "Ticket statuses list",
                data: output
            });
        });
    });



    router.route('/liveticket/priorities/list').get(function (req, res) {

        liveticketdb.getPriorities((err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in priority controller"
                });
            }

            res.status(200).send({
                message: "Ticket priorities list",
                data: output
            });

        });
    });




    router.post('/liveticket/upload', upload.array('images'), (req, res) => {

        console.log('Uploaded file:', req.files); // check this

        if (!req.files) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        // const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

        // res.json({
        //     image_path: imagePaths

        // });
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

        res.status(200).json({
            success: true,
            image_paths: imagePaths
        });
    });





    // router.route('/issueticket/users/list').get(function (req, res) {

    //     issueticketdb.getUsers((err, output) => {
    //         if (err) {
    //             return res.status(500).send({
    //                 error: "Something went wrong in userlist controller"
    //             });
    //         }

    //         res.status(200).send({
    //             message: "Ticket priorities list",
    //             data: output
    //         });
    //     });
    // });





    // router.route('/issueticket/statuses/list').get(function (req, res) {

    //     issueticketdb.getStatuses((err, output) => {
    //         if (err) {
    //             return res.status(500).send({
    //                 error: "Something went wrong in status controller"
    //             });
    //         }

    //         res.status(200).send({
    //             message: "Ticket statuses list",
    //             data: output
    //         });
    //     });
    // });





    router.route('/liveticket/tags/list').get(function (req, res) {

        liveticketdb.getTags((err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in tag controller"
                });
            }

            res.status(200).send({
                message: "Ticket tags list",
                data: output
            });
        });
    });

    next();
});

// for pdf 



module.exports.router = router;
