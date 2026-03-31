// exports.getDashboardCounts = async function (params, cb) {
//   try {
//     const { projectid, userid } = params;
//     console.log("DASHBOARD PARAMS MODEL:", projectid, userid);
//     const baseQuery = knex('issueticket').where('user_id', userid)
//       .andWhere('status_id', 1); // active tickets only

//     // ✔ project filter
//     if (projectid) {
//       baseQuery.andWhere('project_id', projectid);
//     }
//     // if (projectid !== null && projectid !== 'null' && projectid !== undefined) {
//     //   baseQuery.where('project_id', projectid);
//     // }

//     // if (userid) {
//     //   baseQuery.where('user_id', userid);
//     // }
//     if (userid !== null && userid !== 'null' && userid !== undefined) {
//       baseQuery.where('user_id', userid);
//     }

//     // TOTAL
//     const total = await baseQuery.clone().count('* as count').first();

//     // PENDING
//     const pending = await baseQuery.clone()
//       .where('ticketstatus_id', 5)
//       .count('* as count').first();

//     const priorityhigh = await baseQuery.clone()
//       .where('priority_id', 1)
//       .count('* as count').first();

//     // CLOSED
//     const closed = await baseQuery.clone()
//       .where('ticketstatus_id', 4)
//       .count('* as count').first();

//     // STATUS CHART
//     const statusChart = await baseQuery.clone()
//       .select('ticketstatus_id as status_id')
//       .count('* as count')
//       .groupBy('ticketstatus_id');
//     console.log("STATUS CHART DATA:", statusChart);
//     // PRIORITY CHART
//     const priorityChart = await baseQuery.clone()
//       .select('priority_id')
//       .count('* as count')
//       .groupBy('priority_id');
//     console.log("PRIORITY CHART DATA:", priorityChart);
//     cb(null, {
//       total: Number(total[0].count),
//       pending: Number(pending[0].count),
//       closed: Number(closed[0].count),
//       priority: Number(priorityhigh[0].count),
//       statusChart,
//       priorityChart
//     });

//   } catch (err) {
//     console.error("🔥 MODEL ERROR:", err);
//     cb(err, null);
//   }
// };

exports.getDashboardCounts = async function (params, cb) {
  try {
    function applyFilters(q, params) {
      const { projectid, userid, month } = params;

      if (projectid) q.where('project_id', projectid);
      if (userid) q.where('user_id', userid);

      if (month) {
        q.whereRaw(
          "TO_CHAR(created_at, 'YYYY-MM') = ?",
          [month]
        );
      }
    }
    // TOTAL
    const totalRes = await knex('issueticket')
      .count('* as count')
      .modify(q => applyFilters(q, params));

    const total = Number(totalRes?.[0]?.count ?? 0);

    // PENDING
    const pendingRes = await knex('issueticket')
      .count('* as count')
      .where('ticketstatus_id', 1)
      .modify(q => applyFilters(q, params));

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
      .where('priority_id', 1)
      .modify(q => applyFilters(q, params));

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