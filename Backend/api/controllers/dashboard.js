const express = require('express');
const router = express.Router();
const dashboarddb = require('../models/dashboard.js');

// GET dashboard counts
router.get('/dashboard/list', function (req, res) {

  let projectId = req.query.projectid;
  const userId = req.query.userid;
  if (projectId === 'null' || projectId === '' || projectId === undefined) {
    projectId = null;
  }
  console.log("DASHBOARD PARAMS:", projectId, userId);

  dashboarddb.getDashboardCounts({projectid: projectId, userid: userId}, (err, output) => {
    console.log("i=dashboard returning", output)
    if (err) {
      return res.status(500).send({
        error: "Something went wrong in dashboard controller"
      });
    }

    res.status(200).send({
      message: "Dashboard counts",
      data: output
    });
  });
});

module.exports.router = router;
