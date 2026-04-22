exports.saveTicketTag = function (data, cb) {
    console.log('table data', data);

    knex('tickettag')       // removed extra space in table name
        .insert(data)
        .then(function (rows) {
            cb(null, rows); // Success → pass rows to callback
        })
        .catch(err => {      // catch will catch any database errors
           
            if (err.code === '23505') {   // Unique constraint violation
                return cb(err);         
            }
            cb(err);                     // Other errors
        });
};




exports.getTicketTag = function(cb) {
knex('tickettag')
	.select('*')
	.whereNot({"status_id": 3})
.orderBy(knex.raw('LOWER(tickettag)'), 'asc')   
	.then(function (out) {
		console.log('data sending form tickeytagdb tof frontend', out);
		cb(null, out);
		
	}).catch(function (e) {
		cb(e, 'error');
	})
}


// exports.deleteTag = function ( tickettag_id, callback) {
//   knex('tickettag')

//     .where({ tickettag_id:  tickettag_id })
//     .update({ status_id: 3 }) 
//     .then(result => {
//       console.log('Delete tickettag result:', result);
//       callback(null, result);   // result = number of rows updated
//     })
//     .catch(err => {
//       callback(err);
//     });
// };









exports.deleteTag = function (tickettag_id, callback) {
    // console.log("delete priority called with id:", tickettag_id);

    // 1 Check if users are assigned to this usergroup
    knex('issueticket')   // users table
     .whereRaw('? = ANY(ticket_tag)', [tickettag_id])
        .select('issueticket_id')
        .then(tagarray => {

            //  Block delete if users exist
            if (tagarray.length > 0) {
                // const Tags = priorities.map(u => u.priority).join(', ');
                //  console.log('priority string:', priority);
                
                return callback(null, {
                    success: false,
                    message: `Cannot delete: Tag is in use`
                });
            }

            // No users → SAFE to delete (soft delete)
            return knex('tickettag')
                .where({ tickettag_id})
                .update({ status_id: 3 })
                .then(() => {
                    callback(null, {
                        success: true,
                        message: 'Tag deleted successfully'
                    });
                });

        })
        .catch(err => {
            console.error('Delete usergroup error:', err);
            callback(err);
        });
};



exports.updateTicketTag = (tickettag_id, data, cb) => {
  knex('tickettag')
    .where({ tickettag_id })
    .update({
       tickettag: data.tickettag,
             remarks: data.remarks,
            status_id:  data.status_id ,
            updated_on: new Date(),  

    })
    .then(() => cb(null))
    .catch(err => cb(err));
};

