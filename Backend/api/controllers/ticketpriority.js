const express = require('express');
const prioritydb = require('../models/ticketpriority.js');
const router = express.Router();

// Middleware (if needed)
router.use(function (req, res, next) {
    next();
});

router.post('/ticketpriority/save_data', function (req, res) {
    console.log('ticketpriority data reached controller', req.body);

    const params = {
        priority: req.body.priority,
        remarks: req.body.remarks,
        status_id: req.body.status_id,
        icon: req.body.icon,
        created_on: new Date()
    };

    prioritydb.saveTicketPriority(params, function (err, output) {
        if (err) {
            // Check for PostgreSQL unique constraint violation
            if (err.code === '23505') {
                return res.status(409).send({ message: 'Priority already exists' });
            }
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const items = {
                data: output,
                actionMessage: "Priority saved"
            };
            console.log('Saved:', items);
            res.status(201).send(items); // 201 is better than 200 for creation
        }
    });
});


router.get('/ticketpriority/list', function (req, res) {
    console.log('Getting ticketpriority list from controller');
    prioritydb.getTicketPriority((err, output) => {
        if (err) {
            return res.status(500).send({ error: "Something went wrong in controller" });
        }
        res.status(200).send({
            message: "Ticket priorities list",
            data: output
        });
    });
});


router.post('/ticketpriority/delete/:priority_id', function (req, res) {
    const priority_id = Number(req.params.priority_id);
    console.log('TicketPriority Delete working, priority_id:', priority_id);

    prioritydb.deleteTicketPriority(priority_id, (err, output) => {
        if (err) {
            // Send backend error message
            return res.status(500).send({
                success: false,
                message: err.message || 'Delete failed'
            });
        } else {
            // Use the actual output from the model
            return res.status(200).send(output);
        }
    });
});


// 
router.post('/ticketpriority/update/:priority_id', function (req, res) {
    const priority_id = req.params.priority_id;
    console.log('Ticket priority update controller working', priority_id, req.body);

    prioritydb.updateTicketPriority(priority_id, req.body, (err, output) => {
        if (err) {
            return res.status(500).send({ error: 'Update failed' });
        } else {
            res.status(200).send({
                success: true,
                message: 'Priority updated successfully',
                data: output
            });
        }
    });
});

module.exports.router = router;
