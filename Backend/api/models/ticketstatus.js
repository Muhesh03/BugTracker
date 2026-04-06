
exports.saveTicketStatus = function (data, cb) {
	console.log('ticketstatus in model=============data to save ', data)
	knex('ticketstatus')
		.insert(data)
		.returning('*')
		.then(rows => cb(null, rows[0]))
		.catch(err => cb(err, null));

};

exports.getTicketStatus = function (cb) {
	knex('ticketstatus')
		.select('*')
		.whereNot({ "status_id": 3 })
        .orderBy('ticketstatus_id','desc')
		.then(function (out) {
			console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmm', out);
			cb(null, out);

		}).catch(function (e) {

			cb(e, 'error');
		})
}


// exports.deleteTicketStatus = function (ticketstatus_id, cb) {

// 	console.log('Deleting ticketstatus (soft delete): ', ticketstatus_id);
// 	console.log('ssssssssssssssssssssss', ticketstatus_id);
// 	knex('ticketstatus')
// 		.where({ ticketstatus_id })
// 		.update({ status_id: 3 })        // <-- update status_id instead of delete
// 		.then(count => {
// 			if (count === 0) {
// 				return cb(null, { message: 'User not found' });
// 			}
// 			return cb(null, { message: 'User status updated to 3', updated: count });
// 		})
// 		.catch(err => {
// 			console.error('Error updating user:', err);
// 			return cb(err, null);
// 		});
// };





exports.deleteTicketStatus = function (ticketstatus_id, callback) {
    knex('issueticket')   // users table
        .where({ ticketstatus_id })
        .select('issueticket_id')
        .then(statusarray => {

            //  Block delete if users exist
            if (statusarray.length > 0) {
                // const priority = priorities.map(u => u.priority).join(', ');
                
                return callback(null, {
                    success: false,
                    message: `Cannot delete: status is in use`
                });
            }

            // No users → SAFE to delete (soft delete)
            return knex('ticketstatus')
                .where({ ticketstatus_id })
                .update({ status_id: 3 })
                .then(() => {
                    callback(null, {
                        success: true,
                        message: 'status deleted successfully'
                    });
                });

        })
        .catch(err => {
            console.error('Delete status error:', err);
            callback(err);
        });
};



// UPDATE
// exports.updateTicketStatus = (ticketstatus_id,data, cb) => {
// 	knex('ticketstatus')
// 		.where({ ticketstatus_id })
// 		.update({
// 			statusname: data.statusname,
// 			remarks: data.remarks,
// 			color: data.color,
// 			status: data.status,
// 			updated_at: new Date()
// 		})
// 		// .returning('*')
// 		// .then(rows => cb(null, rows[0]))
//          .then(result => {
//             console.log('status updated, rows affected:', result);
//             cb(null, result);
//         })
// 		.catch(err => cb(err));
// };

exports.updateTicketStatus = function (params, cb) {

  const { ticketstatus_id, status_id } = params;

  if (!ticketstatus_id) {
    return cb(new Error('ticketstatus_id is required'));
  }

  knex('ticketstatus')
    .where('ticketstatus_id', ticketstatus_id)
    .update({
      status_id,
      updated_at: knex.fn.now()
    })
    .then(result => cb(null, result))
    .catch(err => cb(err));
};
