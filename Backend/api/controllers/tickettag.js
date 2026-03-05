
const express = require('express');
const tagdb = require('../models/tickettag.js');
const router = express.Router();


router.use(function (req, res, next) {
router.route('/tickettag/save_data').post(function (req, res) {
    console.log('tickettag data reached controller', req.body);

    const params = {
        tickettag: req.body.tickettag,
        remarks: req.body.remarks,
        status_id: req.body.status_id,
        created_on: new Date()
    };

    tagdb.saveTicketTag(params, function (err, output) {
        if (err) {
            // Check for PostgreSQL UNIQUE constraint violation
            if (err.code === '23505') {
                return res.status(409).send({ message: 'Ticket Tag already exists' });
            }
            return res.status(500).send({ error: 'Something went wrong!' });
        }

        const items = {
            data: output,
            actionMessage: "Ticket Tag saved successfully"
        };
        console.log('Saved:', items);
        res.status(201).send(items); // 201 = Created
    });
});

    next();
});



  router.route('/tickettag/list').get(function (req, res, next)  {
        console.log('Getting TICKETTAG list from  controller', req.body);
        tagdb.getTicketTag((err, output) => {
            if (err) {
                return res.status(500).send({ error: "Something went wrong in member controller" });
            }

            res.status(200).send({
                message: "Members list",
                data: output
            });
        });
    });


    router.post('/tickettag/delete/:id', function (req, res) {
    const  tickettag_id = Number(req.params.id);
    
        console.log('Ticketag Delete working in controller, id:',  tickettag_id);
    
        tagdb.deleteTag( tickettag_id, (err, output) => {
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

    router.post('/tickettag/update/:tickettag_id', function (req, res) {
    
            const tickettag_id = req.params.tickettag_id;
    
            console.log('usergroup update controller working',  req.body);
            console.log(' usergroup Update working, id:', tickettag_id);
    
            tagdb.updateTicketTag(tickettag_id, req.body, (err, output) => {
                if (err) {
                    return res.status(500).send({ error: 'Update failed' });
                } else {
                    res.status(200).send({
                        success: true,
                        message: 'Member updated successfully',
                        data: output
                    });
                }
            });
    
        });
    
    

module.exports.router = router;
