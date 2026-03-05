// exports.addActivity = async (data) => {
//   return knex('ticket_activity').insert({
//     issueticket_id: data.issueticket_id,
//     user_id: data.user_id,
//     field_name: data.field_name,
//     old_value: data.old_value,
//     new_value: data.new_value,
//     created_at: knex.fn.now()
//   });
// };

// /**
//  * Get activities by ticket
//  */

// exports.getActivitiesByTicket = async (issueticket_id) => {
//   console.log("Get data from Ticket_Activity Table Data++++++++++++++++++++++++++++")
//   return knex('ticket_activity as ta')
//     .leftJoin('userregistration as u', 'u.user_id', 'ta.user_id')
//     .leftJoin('ticketstatus as ts', 'ts.ticketstatus_id', 'ta.new_value','ta.old_value') 
//     .select(
//       'ta.activity_id',
//       'ta.issueticket_id',
//       'ta.field_name',
//       'ta.old_value',
//       'ta.new_value',
//       'ta.created_at',
//       'u.fullname as username',
//       'ts.status_name as new_status',
//       knex.raw(`CASE 
//         WHEN ta.field_name = 'Status' THEN (SELECT status_name FROM ticketstatus WHERE ticketstatus_id = ta.old_value)
//         ELSE NULL
//       END as old_status`)
//     )
//     .where('ta.issueticket_id', issueticket_id)
//     .orderBy('ta.created_at', 'desc');
// };



exports.getActivitiesByTicket = async (issueticket_id) => {
  console.log("Get data from Ticket_Activity Table Data++++++++++++++++++++++++++++");

  return knex('ticket_activity as ta')
    .leftJoin('userregistration as u', 'u.user_id', 'ta.user_id')
    .select(
      'ta.activity_id',
      'ta.issueticket_id',
      'ta.field_name',
      'ta.old_value',
      'ta.new_value',
      'ta.created_at',
      'u.fullname as username',

      // NEW STATUS NAME
      knex.raw(`
        CASE 
          WHEN ta.field_name = 'Status' 
          THEN (SELECT statusname FROM ticketstatus WHERE ticketstatus_id = ta.new_value::int)
          ELSE NULL
        END AS new_status
      `),

      // OLD STATUS NAMEn
      knex.raw(`
        CASE 
          WHEN ta.field_name = 'Status' 
          THEN (SELECT statusname FROM ticketstatus WHERE ticketstatus_id = ta.old_value::int)
          ELSE NULL
        END AS old_status
      `),

      knex.raw(`
        CASE 
          WHEN ta.field_name = 'Assigned To' 
          THEN (SELECT fullname FROM userregistration WHERE user_id = ta.new_value::int)
          ELSE NULL
        END AS new_assigned_to_name
      `),

      // OLD STATUS NAME
      knex.raw(`
        CASE 
          WHEN ta.field_name = 'Assigned To' 
          THEN (SELECT fullname FROM userregistration WHERE user_id = ta.old_value::int)
          ELSE NULL
        END AS old_assigned_to_name
      `)
    )
    .where('ta.issueticket_id', issueticket_id)
    .orderBy('ta.created_at', 'desc');
};