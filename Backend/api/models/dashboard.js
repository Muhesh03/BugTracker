exports.getDashboardCounts = async function (params, cb) {
  try {
    const { projectid, userid } = params;
    console.log("DASHBOARD PARAMS MODEL:", projectid, userid);
    const baseQuery = knex('issueticket')
      .where('status_id', 1); // active tickets only

    // ✔ project filter
    // if (projectid) {
    //   baseQuery.where('project_id', projectid);
    // }
if (projectid !== null && projectid !== 'null' && projectid !== undefined) {
  baseQuery.where('project_id', projectid);
}

    // if (userid) {
    //   baseQuery.where('user_id', userid);
    // }
if (userid !== null && userid !== 'null' && userid !== undefined) {
  baseQuery.where('user_id', userid);
}

    // TOTAL
    const total = await baseQuery.clone().count('* as count');

    // PENDING
    const pending = await baseQuery.clone()
      .where('ticketstatus_id', 5)
      .count('* as count');

    const priorityhigh = await baseQuery.clone()
      .where('priority_id', 1)
      .count('* as count');


    // CLOSED
    const closed = await baseQuery.clone()
      .where('ticketstatus_id', 4)
      .count('* as count');

    cb(null, {
      total: Number(total[0].count),
      pending: Number(pending[0].count),
      closed: Number(closed[0].count),
      priority: Number(priorityhigh[0].count)
    });

  } catch (err) {
    cb(err);
  }
};
