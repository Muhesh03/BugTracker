//controller/tickettype.js
const express = require('express');
const tickettypedb = require('../models/tickettypes.js');
const router = express.Router();

router.use(function (req, res, next) {
    router.route('/tickettype/tickettype_data').post(function (req, res, next) {



        const params = {
            name: req.body.name,
            remarks: req.body.remarks,
            created_on: new Date(),
            status_id: 1
        }

        tickettypedb.savetickettype(params, function (err, output) {
            if (err) {
                if (err.code === '23505') {
                    return res.status(409).send({ message: 'Ticket type already exists' });
                }
                return res.status(500).send({ message: 'Something went wrong' });
            }
            else {
                res.status(201).send({
                    data: output,
                    actionMessage: 'Ticket type saved successfully'
                });
            }
        });
    });

    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

    router.route('/tickettype/gettickettype_List').get(function (req, res, next) {

        // console.log('user controler==============%%%%%%%%%5');
        tickettypedb.gettickettype((err, output) => {
            if (err) {
                console.log('tickettype controler error===========', err)
                return res.status(500).send({ error: "Something went wrong" });
            }

            res.status(200).send({
                message: "tickettype list",
                data: output
            });
        });
    });
    router.post('/tickettype/delete', (req, res) => {

        const tickettype_id = req.body.tickettype_id;

        console.log('Received /tickettype/delete body:', tickettype_id);
        console.log('tickettype controler==============%%%%%%%%%5');
        tickettypedb.deletetickettype(tickettype_id, function (err, output) {
            if (err) {
                console.log('tickettype controler error===========', err)
                return res.status(500).send({ error: "===>>>>Something went wrong" });
            }

            res.status(200).send({
                message: "tickettype deleted",
                data: output
            });
        });

    });
    router.post('/tickettype/update', (req, res) => {
        console.log("tttttttttttttttttttt", req.body);
        const { tickettype_id, name, remarks, status_id } = req.body;

        // ================= UPDATE =================
        if (!tickettype_id) {
             
            return res.status(400).json({
                message: 'tickettype_id is required'
            });
        }
    
            const params = {
                tickettype_id,
                name,
                remarks,
                status_id
            };

            tickettypedb.updatetickettype(params, (err, result) => {
                if (err) {
                    console.error('Update error:', err);

                    // DUPLICATE HANDLING
                    if (err.code === '23505') {
                        return res.status(409).send({
                            message: 'Ticket type already exists'
                        });
                    }

                    return res.status(500).send({
                        message: 'Update failed'
                    });
                }
                else {
                    res.status(200).send({
                        success: true,
                        message: 'Ticket type updated successfully',
                        data: result
                    });
                }
            });

        


    });


    next();
});
module.exports.router = router;