const express = require('express');
const ticketstatusdb = require('../models/ticketstatus.js');
const router = express.Router();

router.use(function (req, res, next) {
    router.route('/ticketstatus/save_ticketstatus').post(function (req, res, next) {

        console.log('data reached ticket status controller', req.body);


        const params = {
            statusname: req.body.statusname,
            remarks: req.body.remarks,
            color: req.body.color,
            status: req.body.status,
            created_at: new Date(),
            status_id: 1
        }

        ticketstatusdb.saveTicketStatus(params, function (err, output) {
            if (err) {
                if (err.code === '23505') {
                    return res.status(409).send({ message: 'Ticket status already exists' });
                }
                return res.status(500).send({ message: 'Something went wrong' });
            }
            else {
                res.status(201).send({
                    data: output,
                    actionMessage: 'Ticket status saved successfully'
                });
            }
            //         return res.status(500).send({ error: 'Something went wrong !' });
            //     } else {
            //         var items = {};
            //         items.data = output;
            //         items.actionMessage = " ticketstatus listed ";
            //         console.log('iiiiiiiiiiiiiiiiiiiii', items);
            //         res.status(200).send(items);
            //     }
            // });
        });

    });

    router.route('/ticketstatus/list_ticketstatus').get(function (req, res, next) {

        // console.log('user controler==============%%%%%%%%%5');
        ticketstatusdb.getTicketStatus((err, output) => {
            if (err) {
                console.log('ticketstatus controler error===========', err)
                return res.status(500).send({ error: "Something went wrong" });
            }

            res.status(200).send({
                message: "ticketstatus list",
                data: output
            });
        });
    });

    router.post('/ticketstatus/delete_ticketstatus', (req, res) => {
        console.log("eeeeeellllleeeeemmmm", req.body)

        const ticketstatus_id = req.body.ticketstatus_id;

        console.log('Received /ticketstatus/delete body:', ticketstatus_id);
        console.log('ticketstatus controller==============%%%%%%%%%5');
        ticketstatusdb.deleteTicketStatus(ticketstatus_id, function (err, output) {
            if (err) {

                return res.status(500).json({
                    success: false,
                    message: 'Delete failed'
                });
            }

            //  DO NOT override success
            return res.status(200).json(output);
        });
    });


    router.post('/ticketstatus/update_ticketstatus', (req, res) => {

        const { ticketstatus_id, statusname, remarks, color, status_id } = req.body;

        // ================= UPDATE =================

        if (!ticketstatus_id) {
            return res.status(400).json({
                message: 'ticketstatus_id is required'
            });
        }

        const params = {
            ticketstatus_id,
            statusname,
            remarks,
            color,
            status_id
        };

        ticketstatusdb.updateTicketStatus(params, (err, result) => {
            if (err) {
                console.error('Update error:', err);
                if (err.code === '23505') {
                    return res.status(409).send({ message: 'Ticket status already exists' });
                }
                return res.status(500).send({ message: 'update failed' });
            }

            else {
                res.status(200).send({
                    success: true,
                    message: "ticketstatus updated",
                    data: result
                });
            }
        });




    });


    next();

});
module.exports.router = router;
