
exports.savetickettype = function (data, cb) {
	console.log('tickettype in model=============data to save ', data)
	knex('tickettype')

		.insert(data)
		.returning('*')
		.then(rows => cb(null, rows[0]))
		.catch(err => cb(err, null));

};

exports.gettickettype = function (cb) {
	knex('tickettype')
		.select('*')
		.whereNot({ "status_id": 3 })
		.orderBy('tickettype_id','desc')
		.then(function (out) {
			cb(null, out);

		}).catch(function (e) {

			cb(e, 'error');
		})
}


exports.deletetickettype = function (tickettype_id, cb) {

	console.log('Deleting tickettype (soft delete): ', tickettype_id);
	console.log('ssssssssssssssssssssss', tickettype_id);
	knex('tickettype')
		.where('tickettype_id', tickettype_id)
		.update({ status_id: 3 })        // <-- update status_id instead of delete
		.then(count => {
			if (count === 0) {
				return cb(null, { message: 'User not found' });
			}
			return cb(null, { message: 'User status updated to 3', updated: count });
		})
		.catch(err => {
			console.error('Error updating user:', err);
			return cb(err, null);
		});
};

// UPDATE
exports.updatetickettype = function (params, cb) {
	knex('tickettype')
		.where({ tickettype_id: params.tickettype_id })
		.update({
			name: params.name,
			remarks: params.remarks,
			status_id: params.status_id,
			updated_on: new Date()
		})
		.returning('*')
		.then(rows => cb(null, rows[0]))
		.catch(err => cb(err, null));
};

