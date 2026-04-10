
// exports.saveProjects = function (data, cb) {
//   console.log('projects table data', data);

//   knex('projects')
//     .insert(data)
//     .then(function (rows) {
//       cb(null, rows);
//     })
//     .catch(err => cb(err));
// };



exports.saveProjects = function (data, cb) {
  console.log('table data', data);

  knex('projects')
    .insert(data)
    .returning('*')
    .then(rows => {
      console.log('Inserted row:', rows[0]);
      cb(null, rows[0]);
    })
    .catch(err => {
      console.error('Insert error:', err);
      cb(err);
    });
};

exports.getProjects = function (cb) {
  knex('projects')
    .select('*')
    .whereNot({ status_id: 3 })
    
    .orderBy('project_id','desc')
    .then(function (out) {
      console.log('projects DATA SENDED', out);
      cb(null, out);
    })
    .catch(function (e) {
      cb(e, 'error');
    });
};
exports.deleteProjects = function (project_id, callback) {
    console.log("delete project called with id:", project_id);

    knex('issueticket')   
        .where({ project_id })
        .select('issueticket_id')
        .then(projects => {

            if (projects.length > 0) {
                return callback(null, {
                    success: false,
                    message: 'Cannot delete: project is in use'
                });
            }

            return knex('projects')
                .where({ project_id })
                .update({ status_id: 3 })
                .then(() => {
                    callback(null, {
                        success: true,
                        message: 'Project deleted successfully'
                    });
                });

        })
        .catch(err => {
            console.error('Delete project error:', err);
            callback(err);
        });
};

exports.updateProjects = (id, data, cb) => {
  knex('projects')
    .where({ project_id: id })
    .update({
      projectname: data.projectname,
      remarks: data.remarks,
      status_id: data.status_id,
      updated_on: new Date()

    })
    .then(() => cb(null))
    .catch(err => cb(err));
};


//SAVE PROJECT TEAM

exports.saveProjectTeam = async (project_id, users) => {
  console.log('Saving project team in model:', project_id, users);
  for (const u of users) {
    await knex('projectteam')
      .insert({
        project_id,
        user_id: u.user_id,
        is_active: u.is_active
      })
      .onConflict(['project_id', 'user_id'])
      .merge({ is_active: u.is_active });
  }
};


// used in dropdown
exports.getProjectsByUser = (userId) => {
  return knex('projects as p')
    .join('projectteam as pt', 'pt.project_id', 'p.project_id')
    .where('pt.user_id', userId)
    .where('pt.is_active', true)
    .whereNot('p.status_id', 3)
    .andWhereNot({'p.status_id': 2 })
    .select('p.project_id', 'p.projectname')
    .distinct()
    .orderBy('p.project_id', 'asc');

};


exports.getProjectTeam = function (cb) {
  knex('projectteam')
    .select('*')
    .then(function (out) {
      console.log("this daaaaaaaaata", out)
      cb(null, out);
    })
    .catch(function (e) {
      cb(e, 'error');
    });
};


exports.getProjectTeam = function (project_id) {
  return knex('projectteam as pt')
    .join('userregistration as u', 'u.user_id', 'pt.user_id')
    .select(
      'u.user_id',
      'u.fullname',
      knex.raw('COALESCE(pt.is_active, false) as is_active')
    )
    .where('pt.project_id', project_id);
};

