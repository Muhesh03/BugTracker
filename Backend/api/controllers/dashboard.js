const express = require('express');
const router = express.Router();
const dashboarddb = require('../models/dashboard.js');

// GET dashboard counts
router.get('/dashboard/list', function (req, res) {

  let projectId = req.query.projectid;
  const userId = req.query.userid;
  const month = req.query.month;
  // if (projectId === 'null' || projectId === '' || projectId === undefined) {
  //   projectId = null;
  // }
  if (!projectId || projectId === 'null') {
    projectId = null;
  } else {
    projectId = Number(projectId); //  convert to number
  }
  console.log("DASHBOARD PARAMS:", projectId, userId,month);

  dashboarddb.getDashboardCounts({ projectid: projectId, userid: userId, month: month }, (err, output) => {
    console.log("i=dashboard returning", output)
    if (err) {
      console.error("========>>>>>><<<<<<===== DASHBOARD ERROR:", err);

      return res.status(500).send({
        error: err.message || err
      });
    }

    res.status(200).send({
      message: "Dashboard counts",
      data: output
    });
  });
});

module.exports.router = router;
