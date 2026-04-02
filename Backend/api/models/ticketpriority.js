exports.saveTicketPriority = function (data, cb) {
    console.log('table data', data);

    knex('ticketpriority')
        .insert(data)
        .returning('*') // return the inserted row(s)
        .then(rows => cb(null, rows[0]))
        .catch(err  => {
            // Handle duplicate priority (PostgreSQL unique constraint violation) // we can reanme err as our wish
            if (err.code === '23505') {
                return cb(err); // let the Express route handle 409
            }
            cb(err); // other errors
        });
};

 // this is the db table code for creating each submision a unique // ALTER TABLE ticketpriority  ADD CONSTRAINT ticketpriority_unique_priority UNIQUE (priority);//

  
exports.getTicketPriority = function(cb) {
    knex('ticketpriority')
        .select('*')
        .whereNot({ status_id: 3 })
        .orderBy('priority_id') 
        .then(function (out) {
            console.log('data sending from ticketpriority db to frontend', out);
            cb(null, out);
        })
        .catch(function (e) {
            cb(e, 'error');
        });
};


exports.deleteTicketPriority = function (priority_id, callback) {
    console.log("delete priority called with id:", priority_id);

    // 1 Check if users are assigned to this usergroup
    knex('issueticket')   // users table
        .where({ priority_id })
        .select('issueticket_id')
        .then(priorities => {

            //  Block delete if users exist
            if (priorities.length > 0) {
                const priority = priorities.map(u => u.priority).join(', ');
                 console.log('priority string:', priority);
                
                return callback(null, {
                    success: false,
                    message: `Cannot delete: priority is in use`
                });
            }

            // No users  SAFE to delete 
            return knex('ticketpriority')
                .where({ priority_id })
                .update({ status_id: 3 })
                .then(() => {
                    callback(null, {
                        success: true,
                        message: 'priority deleted successfully'
                    });
                });

        })
        .catch(err => {
            console.error('Delete usergroup error:', err);
            callback(err);
        });
};


















// exports.deleteTicketPriority = async function (priority_id, callback) {
//   try {
//     // 1️ Check if any issue tickets are using this priority
//     const tickets = await knex('issueticket')
//       .where({ priority_id })
//       .select('issueticket_id');

//     //  Block delete if tickets exist
//     if (tickets.length > 0) {
//       return callback(null, {
//         success: false,
//         message: 'Cannot delete priority. It is assigned to existing tickets.'
//       });
//     }

//     // 2️ Safe to soft delete
//     await knex('ticketpriority')
//       .where({ priority_id })
//       .update({ status_id: 3 });

//     //  Success response
//     callback(null, {
//       success: true,
//       message: 'Ticket priority deleted successfully'
//     });

//   } catch (err) {
//     console.error('Delete ticket priority error:', err);
//     callback(err);
//   }
// };



exports.updateTicketPriority = (priority_id, data, cb) => {   
    knex('ticketpriority')
        .where({ priority_id }) 
        .update({
            priority: data.priority,
            remarks: data.remarks,
            status_id: data.status_id,
            icon: data.icon,
            updated_on: new Date()
        })
        .then(result => {
            console.log('Priority updated, rows affected:', result);
            cb(null, result);
        })
        .catch(err => cb(err));
};
