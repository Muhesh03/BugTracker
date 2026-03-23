const express = require('express');
const router = express.Router();
const issueticketdb = require('../models/ticketActivity.js');

router.get('/:issueticket_id', async (req, res) => {
    try {
        const { issueticket_id } = req.params;

        console.log(
            'Fetching activities from ticket_activity for ticket:',
            issueticket_id
        );

        const data = await issueticketdb.getActivitiesByTicket(issueticket_id);

        res.status(200).json({ data });
    } catch (err) {
        console.error('Fetch activity error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports.router = router;