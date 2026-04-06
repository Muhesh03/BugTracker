

// exports.findByEmail = function(email) {
//   return knex('userregistration')
//     .where({ email })
//     .first();
// };

// exports.findByEmail = function (email) {
//   return knex('userregistration as u')
//     .join('usergroup as ug', 'ug.usergroupname', 'u.usergroup')
//     .select(
//       'u.user_id',
//       'u.fullname',
//       'u.email',
//       'u.password',
//       'ug.usergroup_id',
//       'ug.usergroupname'
//     )
//     .where('u.email', email)
//     .first();
// };

exports.findByEmail = function (email) {
  return knex('userregistration as u')
    .leftJoin('usergroup as ug', 'ug.usergroup_id', 'u.usergroup_id')
    .leftJoin('projectteam as pt', function () {
      this.on('pt.user_id', 'u.user_id')
        .andOn('pt.is_active', knex.raw('?', [true]));
    })
    .select(
      'u.user_id',
      'u.fullname',
      'u.email',
      'u.password',
      'u.usergroup_id',
      'u.attachment_name',
      'ug.usergroupname'
    )
    .where('u.email', email)
    .whereNot('u.status_id', 3)
    .andWhereNot('u.status_id',2)
    .groupBy(
      'u.user_id',
      'u.fullname',
      'u.email',
      'u.password',
      'u.usergroup_id',
      'u.attachment_name',
      'ug.usergroupname'
    )
    .first();
};


exports.saveuser = function (data, cb) {
  console.log('user in model=============data to save ', data)
  knex('userregistration')
    .insert(data)
    .returning('*')
    .then(rows => cb(null, rows[0]))
    .catch(err => cb(err, null));

};

// exports.getuser = function (cb) {
// 	knex('userregistration as ug')
// 		.leftJoin('usergroup as u', 'ug.usergroup_id', 'u.usergroup_id')
// 		.select(
// 			'ug.*',
// 			'u.usergroupname'
// 		)
// 		.whereNot({ "ug.status_id": 3 })
// 		.then(function (out) {
// 			cb(null, out);

// 		}).catch(function (e) {

// 			cb(e, 'error');
// 		})
// }

exports.getuser = function (cb) {
  knex('userregistration as ug')
    .leftJoin('usergroup as u', 'ug.usergroup_id', 'u.usergroup_id')
    .select(
      'ug.*',
      'u.usergroupname'
    )
    // .whereIn('ug.status_id', [1, 2])
    .whereNot({ "ug.status_id": 3 })
    .orderBy('ug.user_id', 'desc') // Added orderBy here
    .then(async function (out) {
      for (const user of out) {
        const rows = await knex('messages')
         
          .count('* as unread_count')
          .where('receiver_id', user.user_id)  
          .andWhere('chattype_id', 1)
          .andWhere('is_read', false);
        user.unread_count = Number(rows[0].unread_count);
        console.log("&^%$##$%^&&**()==> USER:", user.user_id, "COUNT:", rows[0].unread_count);
      }


      console.log("out", out)
      cb(null, out);
    }).catch(function (e) {
      cb(e, 'error');
    })
}
exports.deleteuser = function (user_id, cb) {
  console.log('Deleting user (soft delete): ', user_id);
  console.log('ssssssssssssssssssssss', user_id);
  knex('userregistration')
    .where('user_id', user_id)
    .update({ status_id: 3 })

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
exports.updateuser = function (data, cb) {
  const updateData = {};

  // build update object dynamically
  if (data.fullname !== undefined) updateData.fullname = data.fullname;
  if (data.usergroup_id !== undefined) updateData.usergroup_id = data.usergroup_id;
  if (data.password !== undefined) updateData.password = data.password;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phonenumber !== undefined) updateData.phonenumber = data.phonenumber;
  if (data.status_id !== undefined) updateData.status_id = data.status_id;

  //  prevent empty update
  if (Object.keys(updateData).length === 0) {
    return cb(new Error('No fields provided to update'));
  }

  knex('userregistration')
    .where({ user_id: data.user_id })
    .update(updateData)
    .returning('*')
    .then(rows => cb(null, rows[0]))
    .catch(err => cb(err));
};

// exports.updateuser = function (data, cb) {
//   knex('userregistration')
//     .where({ user_id: data.user_id })
//     .update({
//       fullname: data.fullname,
// 	  usergroup_id: data.usergroup_id,
// 	  status_id: data.status_id,
// 	  password: data.password,
// 	  email: data.email,
// 	  phonenumber: data.phonenumber,

//     })
//     .returning('*')
//     .then(rows => cb(null, rows[0]))
//     .catch(err => cb(err, null));
// };


exports.getUserGroup = function (cb) {
  knex('usergroup')
    .select('*')
    .whereNot({ status_id: 3 })
    .orderBy('usergroup_id')
    .then(function (out) {
      console.log('data sending from usergroup db to frontend', out);
      cb(null, out);
    })
    .catch(function (e) {
      cb(e, 'error');
    });
};


///////Attachments model below/////////


// exports.updateAttachment = (userId, fileName) => {
//   return knex('userregistration')
//     .where({ user_id: userId })
//     .update({ attachment_name: fileName });
// };
exports.saveAttachment = (params, cb) => {
  knex('userregistration')
    .where({ user_id: params.user_id })
    .update({
      attachment_name: params.attachment_name
    })
    .returning(['user_id', 'attachment_name'])
    .then(rows => cb(null, rows[0]))
    .catch(err => cb(err));
};

/* ---------- GET ATTACHMENT ---------- */
exports.getAttachment = (userId, cb) => {
  knex('userregistration')
    .select('attachment_name')
    .where({ user_id: userId })
    .then(rows => cb(null, rows))
    .catch(err => cb(err));
};
// backend controller (profile.js)
// router.get('/profile', (req, res) => {
//   knex('userregistration')
//     .select('user_id', 'fullname', 'attachment_name')
//     .where({ user_id: req.session.user.user_id })
//     .first()
//     .then(data => res.json(data));
// });

// exports.updateLastLogin = (userId) => {
//   return knex('userregistration')
//     .where('user_id', userId)
//     .update({ last_project_id: projectId });
// };

// Using .then() it act like promise  its async
exports.updateLastProject = (userId, projectId) => {
  return knex('userregistration')
    .where('user_id', userId)
    .update({ last_project_id: projectId })
    .then(result => {
      console.log('Rows updated:', result);
      return result;
    })
    .catch(err => {
      console.error('Update failed:', err);
    });
};


exports.getLastProject = (userId) => {
  return knex('userregistration')
    .where('user_id', userId)
    .select('last_project_id')
    .first();
};

exports.updatePassword = (userId, password) => {

  return knex('userregistration')
    .where('user_id', userId)
    .update({ password: password })
    .then(result => {
      console.log('Rows updated:', result);
      return result;
    })
    .catch(err => {
      console.error('Update failed:', err);
      throw err;
    });

};