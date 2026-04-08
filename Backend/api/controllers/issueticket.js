const express = require('express');
const issueticketdb = require('../models/issueticket.js');
const router = express.Router();
const puppeteer = require('puppeteer');// npm install puppeteer@10.4.0    install this for pdf 

const multer = require('multer'); //extra imported
const path = require('path');
const XLSX = require('xlsx');
const exceljs = require('exceljs');
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
    router.post('/issueticket/save_data', function (req, res) {

        console.log('Received issue ticket data:', req.body);
        // Get last ticket to generate unique code
        knex('issueticket')
            .orderBy('issueticket_id', 'desc')
            .first()
            .then(lastTicket => {
                // Calculate next number
                let nextNumber = 1;
                if (lastTicket && lastTicket.ticket_number) {
                    const parts = lastTicket.ticket_number.split('/');
                    nextNumber = parseInt(parts[1], 10) + 1;
                }

                // Generate unique ticket code
                const ticketnumber = 'QC/' + nextNumber.toString().padStart(2, '0');
                const loggedInUserId = (req.user && req.user.user_id) || req.body.loggedInUserId;


                // Prepare params and include ticketCode
                const params = {
                    summary: req.body.summary,
                    user_id: req.body.user_id || null,
                    description: req.body.description,
                    priority_id: req.body.priority_id,
                    ticket_tag: req.body.ticket_tag || [], // array of tag IDs
                    ticketstatus_id: req.body.ticketstatus_id,
                    status_id: 1,
                    tickettype_id: req.body.tickettype || 0 ,
                    project_id: req.body.storedprojectId,
                    ticket_number: ticketnumber,
                    steps_to_reproduce: req.body.steps_to_reproduce,
                    image_path: req.body.image_path,
                    created_by: req.body.reported_by,
                      liveticket_id: req.body.live_ticket_id

                };
                console.log('Final params to save=================================================+++++++++++++++++++++++++++++++++++:', params);
                // Save to DB
                issueticketdb.saveIssueTicket(params, async function (err, output) {
                    if (err) {
                        console.error('DB Error:', err);
                        return res.status(500).send({ error: 'Something went wrong!' });
                    }
                    // else {
                    //     const items = {
                    //         data: output,
                    //         actionMessage: "Issue ticket saved successfully"
                    //     };
                    //     console.log('Issue ticket saved in db', items);
                    //     res.status(200).send(items);
                    // }
                    try {

                        const issueticket_id = output.issueticket_id;


                        await knex('ticket_activity').insert({
                            issueticket_id: issueticket_id,
                            user_id: params.user_id,
                            field_name: 'New Ticket',
                            old_value: null,
                            new_value: null,
                            created_at: knex.fn.now()
                        });

                        console.log('Ticket activity logged: New Ticket');

                        return res.status(200).json({
                            success: true,
                            message: 'Issue ticket created successfully',
                            data: output
                        });

                    } catch (activityErr) {
                        console.error('Activity log error:', activityErr);
                    }
                });

            })
            .catch(err => {
                console.error('DB Error fetching last ticket:', err);
                res.status(500).send({ error: 'Something went wrong!' });
            });

    });



    router.post('/issueticket/upload', upload.array('images'), (req, res) => {

        console.log('Uploaded file:', req.files); // check this

        if (!req.files) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imagePaths = req.files.map(file => `${file.filename}`);

        res.json({
            image_paths: imagePaths

        });
    });



    // logic for getting latest ticket number
    router.get('/issueticket/latestticketnumber', async (req, res) => {
        try {
            const lastTicket = await knex('issueticket')
                .orderBy('issueticket_id', 'desc')
                .first();

            const ticket_number = lastTicket ? lastTicket.ticket_number : 'QC/01';

            res.status(200).send({
                data: { ticket_number }
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({ error: 'Something went wrong!' });
        }
    });





    router.route('/issueticket/list').get(function (req, res) {

        issueticketdb.getIssueTicket(req.query, (err, output) => {
            if (err) {
                console.error('Issue ticket list error:', err);
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




    router.route('/issueticket/filter/list').get(function (req, res) {
        console.log("filtering data to backend", req.query)


        issueticketdb.getFilter(req.query, (err, output) => {
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







    router.post('/issueticket/delete/:issueticket_id', function (req, res) {

        const issueticket_id = Number(req.params.issueticket_id);


        issueticketdb.deleteIssueTicket(issueticket_id, (err, output) => {
            if (err) {
                return res.status(500).send({ error: 'Delete failed' });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'issueticket deleted successfully',
                    data: output
                });
            }
        });

    });



    router.post('/update/:issueticket_id', function (req, res) {

        const issueticket_id = req.params.issueticket_id;
        console.log('Update request received for ticket ID:+++++++++-----------+++++controller+++++++++----------++++++++++', issueticket_id);

        issueticketdb.updateTicket(issueticket_id, req.body, (err, output) => {
            if (err) {
                return res.status(500).send({ error: 'Update failed' });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Project updated successfully',
                    data: output
                });
            }
        });

    });


    router.route('/issueticket/priorities/list').get(function (req, res) {

        issueticketdb.getPriorities((err, output) => {
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


    router.route('/issueticket/tickettype/list').get(function (req, res) {

        issueticketdb.gettickettype((err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in priority controller"
                });
            }

            res.status(200).send({
                message: "Ticket priorities list",
                data: output,
            });
            console.log("tickettypes", output)
        });
    });





    router.route('/issueticket/users/list').get(function (req, res) {

        issueticketdb.getUsers((err, output) => {
            if (err) {
                return res.status(500).send({
                    error: "Something went wrong in userlist controller"
                });
            }

            res.status(200).send({
                message: "Ticket priorities list",
                data: output
            });
        });
    });





    router.route('/issueticket/statuses/list').get(function (req, res) {

        issueticketdb.getStatuses((err, output) => {
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



    // Excel download route
    router.get('/issueticket/excel/download', async (req, res) => {
        try {
            const filters = req.query;
            console.log('Excel download filters:', filters);

            const data = await issueticketdb.getExcelData(filters);

            const excelData = data.map(item => ({
                'Ticket ID': item.issueticket_id,
                'Summary': item.summary,
                'Priority': item.priority,
                'Status': item.statusname,
                // 'Tags': item.tag_names?.join(', '),
                'Tags': (item.tag_names || []).join(', '),

                'Assigned To': item.assigned_to,
                'Reported By': item.reported_by_name,
                'Ticket Type': item.tickettype_name,
                'Project': item.projectname,

                'Description': item.description,
                'Created Date': new Date(item.created_at).toLocaleDateString()
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            worksheet['!cols'] = [
                { wch: 10 },
                { wch: 30 },
                { wch: 15 },
                { wch: 15 },
                { wch: 18 }
            ];
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
            // worksheet.columns = [
            //     { header: 'Ticket ID', key: 'Ticket ID', width: 10 },
            //     { header: 'Summary', key: 'Summary', width: 30 },
            //     { header: 'Priority', key: 'Priority', width: 15 },
            //     { header: 'Status', key: 'Status', width: 15 },
            //     { header: 'Created Date', key: 'Created Date', width: 15 }
            // ];

            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            res.setHeader('Content-Disposition', 'attachment; filename=Filtered_Tickets.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);

        } catch (err) {
            console.error('Excel download failed:', err);
            res.status(500).json({ message: 'Excel download failed' });
        }

    });



    router.route('/issueticket/tags/list').get(function (req, res) {

        issueticketdb.getTags((err, output) => {
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
router.use('/assets', express.static('assets'));


router.post('/issueticket/pdf', async (req, res) => {
    try {
        const { preview, tickets } = req.body;

        //  Build table rows
        let rows = '';
        tickets.forEach((t, index) => {
            rows += `
        <tr>
          <td>${index + 1}</td>
          <td>${t.assigned_to_name || ''}</td>
          <td>${t.priority || ''}</td>
          <td>${t.statusname || ''}</td>
          <td>${t.tag_names || ''}</td>
          <td>${t.summary || ''}</td>
        </tr>
      `;
        });

        //  Full HTML
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }

            h2 {
              text-align: center;
              margin-bottom: 10px;
              color:#547562;
            }
              .pdfheader{
              width:100%;
              height:200px;
              display:flex;
              flex-direction:row;
              justify-content:space-between;
              background-color:white;
              
              }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #333;
              padding: 6px;
              text-align: center;
              word-break: break-word;
            }

            th {
              background-color: #8fa9a6;
            }
          </style>
        </head>
        <body>
        <div class="pdfheader">
      <img src="http://localhost:3000/assets/hoppertext.png" style="height:125px;">
         <h2>Issue Tickets Report</h2>
          </div>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Full Name</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

        //  PREVIEW MODE (NO PDF)
        if (preview) {
            return res.send(html);
        }

        // PDF MODE
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'inline; filename=issue-tickets.pdf'
        );

        res.send(pdfBuffer);

    } catch (err) {
        console.error('PDF Error:', err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});


router.put('/issueticket/:id', async (req, res) => {
    console.log(
        'Update request received for ticket ID:++++++++++++++controller+++++++++++++++++++',
        req.params.id
    );

    try {
        const issueticket_id = req.params.id;
        const { ticketstatus_id, assigned_user_id, updated_by } = req.body;

        console.log('Update payload:', {
            ticketstatus_id,
            assigned_user_id,
            updated_by
        });

        // Fetch old ticket
        const oldTicket = await knex('issueticket')
            .where({ issueticket_id })
            .first();

        if (!oldTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Update ticket
        const updatedTicket = await issueticketdb.updateIssueTicket(
            issueticket_id,
            {
                ticketstatus_id: ticketstatus_id,
                assigned_to: assigned_user_id,
                updated_by

            }
        );

        //  Activity — Status
        if (
            ticketstatus_id !== undefined &&
            oldTicket.ticketstatus_id !== ticketstatus_id
        ) {
            await knex('ticket_activity').insert({
                issueticket_id,
                user_id: updated_by,
                field_name: 'Status',
                old_value: oldTicket.ticketstatus_id,
                new_value: ticketstatus_id,
                created_at: knex.fn.now()
            });
        }

        //  Activity — Assigned user
        if (
            assigned_user_id !== undefined &&
            oldTicket.user_id !== assigned_user_id
        ) {
            await knex('ticket_activity').insert({
                issueticket_id,
                user_id: updated_by,
                field_name: 'Assigned To',
                old_value: oldTicket.user_id,
                new_value: assigned_user_id,
                created_at: knex.fn.now()
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            data: updatedTicket
        });

    } catch (err) {
        console.error('Update ticket error:', err);
        return res.status(500).json({ error: err.message });
    }
});

// router.get('/:issueticket_id', async (req, res) => {
//   try {
//     const { issueticket_id } = req.params;
//     console.log('Fetching activities+++++++++++++++++++++++++++++++++++++++controller++++++++++++++++++++++++++++++++++++++++++++ for ticket ID:', issueticket_id);

//     const data = await issueticketdb.getActivitiesByTicket(issueticket_id);

//     res.status(200).json({ data });
//   } catch (err) {
//     console.error('Fetch activity error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports.router = router;


