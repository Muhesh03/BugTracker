
exports.saveUserGroup = async function (data, cb) {
    try {
        console.log('usergroup in model=============data to save', data);

        //Check existing (case-insensitive)
        const existing = await knex('usergroup')
            .whereRaw('LOWER(usergroupname) = LOWER(?)', [data.usergroupname])
            .first();

        // Already exists and ACTIVE
        if (existing && existing.status_id !== 3) {
            return cb({ code: '23505' }, null); // trigger duplicate error
        }

        //Exists but DELETED → Reactivate
        if (existing && existing.status_id === 3) {
            const updated = await knex('usergroup')
                .where('usergroup_id', existing.usergroup_id)
                .update({
                    status_id: 1,
                    created_on: new Date()
                })
                .returning('*');

            return cb(null, updated[0]);
        }

        //Completely new → Insert
        const rows = await knex('usergroup')
            .insert(data)
            .returning('*');

        return cb(null, rows[0]);

    } catch (err) {
        console.error('Model error:', err);
        return cb(err, null);
    }
};

exports.getUserGroup = function (cb) {
    knex('usergroup')
        .select('*')
        .whereNot({ status_id: 3 })
.orderBy(knex.raw('LOWER(usergroupname)'), 'asc')   
        .then(function (out) {
            cb(null, out);
        })
        .catch(function (e) {
            cb(e, 'error');
        });
};

// exports.deleteUsergroup = function (usergroup_id, callback) {
//     knex('usergroup')
//         .where({ usergroup_id: usergroup_id })
//         .update({ status_id: 3 })
//         .then(result => {    
//             console.log('Delete usergroup result:', result);
//             callback(null, result);
//         })
//         .catch(err => {                                                                                                                              
//             callback(err);   
//         });
// };


exports.deleteUsergroup = function (usergroup_id, callback) {
    console.log("delete usergroup called with id:", usergroup_id);

    // 1 Check if users are assigned to this usergroup
    knex('userregistration')   // users table
        .where({ usergroup_id })
        .select('user_id', 'fullname')
        .then(users => {

            //  Block delete if users exist
            if (users.length > 0) {
                const userNames = users.map(u => u.fullname).join(', ');
                console.log('User names string:', userNames);

                return callback(null, {
                    success: false,
                    message: `Cannot delete: user group is in use`
                });
            }

            // No users → SAFE to delete (soft delete)
            return knex('usergroup')
                .where({ usergroup_id })
                .update({ status_id: 3 })
                .then(() => {
                    callback(null, {
                        success: true,
                        message: 'UserGroup deleted successfully'
                    });
                });

        })
        .catch(err => {
            console.error('Delete usergroup error:', err);
            callback(err);
        });
};


exports.updateUserGroup = (usergroup_id, data, cb) => {
    knex('usergroup')
        .where({ usergroup_id })
        .update({
            usergroupname: data.usergroupname,
            status_id: 1,
            updated_on: new Date(),

        })
        .then(() => cb(null))
        .catch(err => cb(err));
};


exports.savePermissions = function (data, cb) {

    if (!data.usergroup_id || !Array.isArray(data.permissions)) {
        return cb(new Error('Invalid payload'));
    }

    knex.transaction(async trx => {

        for (const perm of data.permissions) {

            const page = await trx('page')
                .whereRaw('LOWER(page_name) = LOWER(?)', [perm.page_name])
                .first();

            if (!page) {
                console.warn('Page not found:', perm.page_name);
                continue;
            }

            await trx('usergrouppermission')
                .insert({
                    usergroup_id: data.usergroup_id,
                    page_id: page.page_id,
                    permission: !!perm.permission
                })
                .onConflict(['usergroup_id', 'page_id'])
                .merge({
                    permission: !!perm.permission,
                    updated_on: trx.fn.now()
                });
        }

    })
        .then(() => cb(null))
        .catch(err => cb(err));

};
// exports.getPermissions = async function (usergroup_id) {
//   if (!usergroup_id) {
//      return Promise.resolve([]);
//   }

//   knex('usergrouppermission as ugp')
//     .join('page as p', 'p.page_id', 'ugp.page_id')
//     .select('p.page_name', 'ugp.permission')
//     .where('ugp.usergroup_id', usergroup_id)
// }
exports.getPermissions = function (usergroup_id) {
    return knex('page as p')
        .leftJoin('usergrouppermission as ugp', function () {
            this.on('p.page_id', '=', 'ugp.page_id')
                .andOn('ugp.usergroup_id', '=', knex.raw('?', [usergroup_id]));
        })
        .select(
            'p.page_name',
            knex.raw('COALESCE(ugp.permission, false) as permission')
        )
        .orderBy('p.page_id')
};
