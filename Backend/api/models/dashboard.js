

exports.getDashboardCounts = async function (params, cb) {
  try {
    function applyFilters(q, params) {
      const { projectid, userid, month } = params;

      if (projectid) q.where('project_id', projectid);
      // if (userid) q.where('user_id', userid);
      if (userid && params.month && params.month !== 'ALL') {
        q.where(function () {
          this.where('user_id', userid)
            .orWhere('created_by', userid);
        });
      }


      // if (month && month !== 'ALL') {
      //   q.whereRaw(
      //     "TO_CHAR(created_at, 'YYYY-MM') = ?",
      //     [month]
      //   );
      // }

      // if (month && month !== 'ALL' && month !== '') {
      //   q.whereRaw("TO_CHAR(created_at, 'YYYY-MM') = ?", [month]);
      // }
      if (month && month !== 'ALL') {
        const formattedMonth = month.length === 7 ? month : null;

        if (formattedMonth) {
          q.whereRaw("TO_CHAR(created_at, 'YYYY-MM') = ?", [formattedMonth]);
        }
      }
    }
    // TOTAL
    const totalRes = await knex('issueticket')
      .count('* as count')
      .modify(q => {
        applyFilters(q, params);

        if (params.userid && params.month && params.month !== 'ALL') {
          q.where(function () {
            this.where('user_id', params.userid)

          });
        }
      });
    const total = Number(totalRes?.[0]?.count ?? 0);
    // PENDING
    const pendingRes = await knex('issueticket')
      .count('* as count')
      .where('ticketstatus_id', 18)
      .modify(q => {
        applyFilters(q, params);

        if (params.userid && params.month && params.month !== 'ALL') {
          q.where(function () {
            this.where('user_id', params.userid)
              .orWhere('created_by', params.userid);
          });
        }
      });
    const pending = Number(pendingRes?.[0]?.count ?? 0);

    // CLOSED
    // const closedRes = await knex('issueticket')
    //   .count('* as count')
    //   .where('ticketstatus_id', 2)
    //   .modify(q => applyFilters(q, params));

    // const closed = Number(closedRes?.[0]?.count ?? 0);
    const reportedRes = await knex('issueticket')
      .count('* as count')
      .where('created_by', params.userid)
      .modify(q => applyFilters(q, params));


    const reported = Number(reportedRes?.[0]?.count ?? 0);
    console.log("REPORTED RES:", reported);
    // PRIORITY HIGH
    const priorityRes = await knex('issueticket')
      .count('* as count')
      .where('priority_id', 13)
      .modify(q => {
        applyFilters(q, params);

        if (params.userid && params.month && params.month !== 'ALL') {
          q.where(function () {
            this.where('user_id', params.userid)
              .orWhere('created_by', params.userid);
          });
        }
      });
    const priority = Number(priorityRes?.[0]?.count ?? 0);
    // STATUS BAR CHART
    const statusChart = await knex('issueticket')
      .select('ticketstatus_id as status_id')
      .count('* as count')
      .modify(q => applyFilters(q, params))
      .groupBy('ticketstatus_id');

    // PRIORITY DONUT
    const priorityChart = await knex('issueticket')
      .select('priority_id')
      .count('* as count')
      .modify(q => applyFilters(q, params))
      .groupBy('priority_id');

    cb(null, {
      total,
      pending,
      reported,
      priority,
      statusChart,
      priorityChart
    });

  } catch (err) {
    console.error("=========>>>>>>>>><<<<<<<<<<========== MODEL ERROR:", err);
    cb(err, null);
  }
};  