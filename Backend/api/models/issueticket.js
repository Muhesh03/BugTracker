
exports.saveIssueTicket = function (data, cb) {
  console.log('Issue Ticket table data', data);
  if (!data.user_id) {
    data.user_id = null;
  }


  knex('issueticket')
    // Check if the record exists
    .insert(data)
    .returning('*')

    .then(function (rows) {

      cb(null, rows[0]);
    })
    .catch(function (err) {
      console.error('Insert issue ticket error:', err);
      cb(err, null);
    });
};

exports.getFilter = function (filters, cb) {
  const {
    projectId,
    filterValuePriority,
    filterValueStatus,
    filterValueType,
    filterValueTag,
    filterValueDate,
    fromDate,
    toDate
  } = filters;

  const tags = [].concat(filterValueTag || []);

  // Helper: only returns number if valid and not 0
  const toInt = (val) => {
    const num = Number(val);
    return val && val !== '0' && !isNaN(num) ? num : null;
  };

  const priorityId = toInt(filterValuePriority);
  const statusId = toInt(filterValueStatus);
  const typeId = toInt(filterValueType);

  knex('issueticket as it')
    .leftJoin('ticketpriority as p', 'it.priority_id', 'p.priority_id')
    .leftJoin('ticketstatus as t', 'it.ticketstatus_id', 't.ticketstatus_id')
    .leftJoin('tickettype as tt', 'it.tickettype_id', 'tt.tickettype_id')
    .leftJoin('userregistration as u', 'it.user_id', 'u.user_id')
    .leftJoin('userregistration as ur', 'it.created_by', 'ur.user_id')


    .joinRaw('LEFT JOIN tickettag tg ON tg.tickettag_id = ANY(it.ticket_tag)')

    .select(
      'it.issueticket_id',
      'it.summary',
      'it.description',
      'it.ticketstatus_id',
      'u.user_id',
      'u.fullname',
      'ur.user_id as creator_user_id',
      'ur.fullname as created_by_name',
      'it.priority_id',
      'p.priority',
      'p.icon',
      't.statusname',
      't.color',
      'tt.name',
      'it.tickettype_id',
      'it.ticket_number',
      'it.created_at',
      knex.raw('array_agg(tg.tickettag) as tag_names'),
      knex.raw('array_agg(tg.tickettag_id) as tag_ids')
    )
    .whereNot('it.status_id', 3)
    .where(function () {

      //reject "null" string and NaN
      if (projectId && projectId !== '0' && projectId !== 'null' && !isNaN(Number(projectId))) {
        this.where('it.project_id', Number(projectId));
      }

      //  use toInt() result — no NaN reaches the DB
      if (priorityId) this.where('it.priority_id', priorityId);
      if (statusId) this.where('it.ticketstatus_id', statusId);
      if (typeId) this.where('it.tickettype_id', typeId);

      if (filterValueDate === 'Between' && fromDate && toDate) {
        const from = new Date(fromDate).toISOString().split('T')[0];
        const to = new Date(toDate).toISOString().split('T')[0];
        this.whereRaw('DATE(it.created_at) BETWEEN ? AND ?', [from, to]);
      }

      if (filterValueDate === 'Yesterday') {
        this.whereRaw("DATE(it.created_at) = CURRENT_DATE - INTERVAL '1 day'");
      }

      //convert JS array to PostgreSQL array literal {1,2}
      if (tags.length > 0) {
        this.whereRaw('it.ticket_tag @> ?::int[]', ['{' + tags.join(',') + '}']);
      }
    })
    .groupBy(
      'it.issueticket_id',
      'it.summary',
      'it.description',
      'it.ticketstatus_id',
      'u.user_id',
      'u.fullname',
      'ur.user_id',
      'ur.fullname',
      'it.priority_id',
      'p.priority',
      'p.icon',
      't.statusname',
      't.color', 'tt.name',
      'it.tickettype_id',
      'it.ticket_number',
      'it.created_at'
    )
    .orderBy('it.issueticket_id', 'asc')
    .then(out => cb(null, out))
    .catch(err => {
      console.error('Error in getFilter:', err);
      cb(err, 'error');
    });
};

exports.getIssueTicket = function (projectParams, cb) {
  console.log("Fetching issue tickets...");
  knex('issueticket as it')
    .leftJoin('ticketpriority as p', 'it.priority_id', 'p.priority_id')
    .leftJoin('ticketstatus as t', 'it.ticketstatus_id', 't.ticketstatus_id')
    .leftJoin('tickettype as tt', 'it.tickettype_id', 'tt.tickettype_id')
    .leftJoin('userregistration as ur', 'it.created_by', 'ur.user_id')
    .leftJoin('userregistration as u', 'it.user_id', 'u.user_id')
    .leftJoin('projects as pr', 'it.project_id', 'pr.project_id')
    .select(
      'it.issueticket_id',
      'it.summary',
      'it.description',
      'it.ticketstatus_id',
      'u.user_id as assigned_user_id',
      'u.fullname as assigned_to_name',
      'it.priority_id',
      'p.priority',
      'pr.projectname',
      'it.project_id',
      'p.icon',
      't.statusname',
      't.color',
      'tt.name as ticket_type_name',
      'it.tickettype_id',
      'it.ticket_number',
      'it.steps_to_reproduce',
      'it.created_at',
      'it.image_path',
      'it.created_by',
      'ur.user_id as creator_user_id',
      'ur.fullname as created_by_name',
      knex.raw('array_agg(tg.tickettag) as tag_names'),
      knex.raw('array_agg(tg.tickettag_id) as tag_ids'))
    .joinRaw('JOIN tickettag tg ON tg.tickettag_id = ANY(it.ticket_tag)')
    .whereNot('it.status_id', 3)
    .modify(function (queryBuilder) {
      if (projectParams.projectid) {
        this.where('it.project_id', projectParams.projectid);
      }
      if (projectParams.userid) {
        this.where('it.created_by', projectParams.userid);
      }
    })
    .groupBy(
      'it.issueticket_id',
      'it.summary',
      'it.description',
      'it.ticketstatus_id',
      'u.user_id',
      'u.fullname',
      'it.priority_id',
      'p.priority',
      'pr.projectname',
      'it.project_id',
      'p.icon',
      't.statusname',
      't.color',
      'tt.name',
      'it.tickettype_id',
      'it.ticket_number',
      'it.steps_to_reproduce',
      'it.created_at',
      'it.image_path',
      'it.created_by',
      'ur.user_id',
      'ur.fullname',
    )
    .orderBy('it.issueticket_id', 'desc')
    .then(
      function (out) {
        cb(null, out);
      })
    .catch(function (e) {
      console.error('Database query error:', e);
      cb(e, 'error');
    });
};

exports.deleteIssueTicket = function (issueticket_id, callback) {

  knex('issueticket')
    .where({ issueticket_id: issueticket_id })
    .update({ status_id: 3 })
    .then(result => {
      console.log('Delete projects result:', result);
      callback(null, result);
    })
    .catch(err => {
      callback(err);
    });
};





// exports.updateIssueTicket = (issueticket_id, data, cb) => {
//   knex('issueticket')
//     .where({ issueticket_id })
//     .update({
//       summary: data.summary,
//       description: data.description,
//       ticketstatus_id: data.ticketstatus_id,
//       priority_id: data.priority_id,
//       ticket_tag: data.ticket_tag,
//       updated_at: new Date(),

//       updated_by: loggedInUserId // Assuming you have the logged-in user's ID available
//     })
//     .then(result => {
//       console.log('Priority updated, rows affected:', result);
//       cb(null, result);
//     })
//     .catch(err => cb(err));
// };




exports.updateIssueTicket = (issueticket_id, data, cb) => {
  knex('issueticket')
    .where({ issueticket_id })
    .update({
      summary: data.summary,
      description: data.description,
      ticketstatus_id: data.ticketstatus_id,
      priority_id: data.priority_id,
      ticket_tag: data.ticket_tag,
      image_path: data.image_path,
      updated_at: knex.fn.now(),
      updated_by: data.user_id



    })
    .then(result => {
      console.log('Priority updated, rows affected:', result);
      cb(null, result);
    })
    .catch(err => cb(err));
};




exports.getStatuses = function (cb) {
  knex('ticketstatus')
    .select('ticketstatus_id', 'statusname', 'color')
    .whereNot({ status_id: 3 })
    .orderBy('status_id')
    .then(function (out) {
      console.log('status DATA SENDED', out);
      cb(null, out);
    })
    .catch(function (e) {
      cb(e, 'error');
    });
};


exports.getUsers = function (cb) {
  knex('userregistration')
    .select('user_id', 'fullname')
    .whereNot('status_id', 3)
    .whereNot('status_id', 2)
    .orderBy('user_id', 'asc')
    .then(out => {
      console.log('user DATA SENDED', out);
      cb(null, out);
    })
    .catch(e => {
      console.error('Error fetching users:', e);
      cb(e, 'error');
    });
};

exports.getPriorities = function (cb) {
  knex('ticketpriority')
    .select('priority', 'icon', 'priority_id')
    .whereIn('status_id', [1, 4])
    .orderBy('priority', 'icon')
    .then(function (out) {
      console.log('priority DATA SENDED', out);
      cb(null, out);
    })
    .catch(function (e) {
      cb(e, 'error');
    });
};

exports.getTags = function (cb) {
  knex('tickettag')
    .select('tickettag_id', 'tickettag')
    .whereIn('status_id', [1, 4])
    .orderBy('tickettag_id')
    .then(function (out) {
      console.log('TAG DATA SENDED', out);
      cb(null, out);
    })
    .catch(function (e) {
      cb(e, 'error');
    });
};


exports.gettickettype = function (cb) {
  knex('tickettype')
    .select('*')
    .whereNot({ "status_id": 3 })
    .then(function (out) {
      cb(null, out);

    }).catch(function (e) {

      cb(e, 'error');
    })
}

// exports.getExcelData = function (filters) {
//   return knex('issueticket as it')
//     .leftJoin('ticketpriority as p', 'it.priority_id', 'p.priority_id')
//     .leftJoin('ticketstatus as s', 'it.ticketstatus_id', 's.ticketstatus_id')
//     .leftJoin('userregistration as u', 'it.user_id', 'u.user_id')
//     .select(
//       'it.ticket_id',
//       'it.subject',
//       'p.priority',
//       's.statusname',
//       'u.fullname',
//       'it.created_at'
//     )
//     .where(function () {
//       if (filters.fromDate && filters.toDate) {
//         this.whereBetween('it.created_at', [
//           filters.fromDate,
//           filters.toDate
//         ]);
//       }
//     })
//     .orderBy('it.created_at', 'desc');
// };

// Get Excel Data with Filters
exports.getExcelData = async (filters) => {
  return knex('issueticket as it')

    // ---------- JOINS ----------
    .leftJoin('ticketpriority as p', 'it.priority_id', 'p.priority_id')
    .leftJoin('ticketstatus as s', 'it.ticketstatus_id', 's.ticketstatus_id')
    .leftJoin('tickettype as tt', 'it.tickettype_id', 'tt.tickettype_id')
    .leftJoin('projects as pr', 'it.project_id', 'pr.project_id')
    .leftJoin('userregistration as ua', 'it.user_id', 'ua.user_id')        // assigned to
    .leftJoin('userregistration as ur', 'it.created_by', 'ur.user_id')    // reported by
    .leftJoin(
      knex.raw('tickettag tg ON tg.tickettag_id =  ANY(COALESCE(it.ticket_tag, ARRAY[]::integer[]))'))

    // ---------- SELECT ----------
    .select(
      'it.issueticket_id',
      'it.summary',
      'it.description',
      'p.priority',
      's.statusname',
      'it.created_at',
      'ua.fullname as assigned_to',
      'ur.fullname as reported_by_name',
      'tt.name as tickettype_name',
      'pr.projectname',
      knex.raw(
        'COALESCE(array_agg(DISTINCT tg.tickettag), ARRAY[]::text[]) as tag_names'
      )
    )


    // ---------- FILTERS ----------
    .modify((qb) => {
      if (filters.project_id) {
        console.log("Project ID filter:", filters.project_id);
        qb.where('it.project_id', parseInt(filters.project_id));
      }
      if (filters.filterValuePriority) {
        qb.where('it.priority_id', filters.filterValuePriority);
      }

      if (filters.filterValueStatus) {
        qb.where('it.ticketstatus_id', filters.filterValueStatus);
      }

      if (filters.filterValueType) {
        qb.where('it.tickettype_id', filters.filterValueType);
      }

      if (filters.filterValueTag) {
        const tags = filters.filterValueTag.split(',').map(Number);
        qb.whereRaw('it.ticket_tag && ?', [tags]);
      }

      if (filters.fromDate && filters.toDate) {
        qb.whereBetween('it.created_at', [
          new Date(filters.fromDate),
          new Date(filters.toDate)
        ]);
      }

      if (filters.searchtext) {
        qb.where(function () {
          this.whereILike('it.summary', `%${filters.searchtext}%`)
            .orWhereILike('it.description', `%${filters.searchtext}%`);
        });
      }
    })

    // ---------- GROUP BY ----------

    .groupBy(
      'it.issueticket_id',
      'it.summary',
      'it.description',
      'it.created_at',
      'p.priority',
      's.statusname',
      'ua.fullname',
      'ur.fullname',
      'tt.name',
      'pr.projectname',

    )

    .orderBy('it.created_at', 'desc');
};

exports.getTicketById = async (issueticket_id) => {
  return knex('issueticket')
    .where({ issueticket_id })
    .first();
};

/**
 * Update ticket fields
 */
// exports.updateTicket = async (issueticket_id, data) => {
//   return knex('issueticket')
//     .where({ issueticket_id })
//     .update({
//       status: data.status,
//       assigned_to: data.assigned_to,
//       updated_at: knex.fn.now()
//     });
// };

// exports.updateTicket = async (issueticket_id, data,cb) => {
//   console.log('Updating issue ticket with ID+++++++++++++++++++++:', issueticket_id);
//   console.log('Data to update+++++++++++++++++++++++++++:', data);
//   return knex('issueticket')

//     .where({ issueticket_id })
//     .update(data)
//     .then(result => {
//       console.log('Issue ticket updated, rows affected+++++++++++++++++++++:', result);
//       cb(null, result);
//     })
//     .catch(err => cb(err));
// };


exports.updateTicket = async (issueticket_id, data, cb) => {
  try {
    const updateData = {
      ticketstatus_id: data.ticketstatus_id,
      priority_id: data.priority_id,
      tickettype_id: data.tickettype,
      summary: data.summary,
      description: data.description,
      user_id: data.user_id,
      image_path: data.image_path,
      steps_to_reproduce: data.steps_to_reproduce,
      ticket_tag: data.ticket_tag,
      updated_at: knex.fn.now(),
      updated_by: data.updated_by
    };

    await knex('issueticket')
      .where({ issueticket_id })
      .update(updateData);

    cb(null, { success: true });
  } catch (err) {
    console.error('Update failed:', err);
    cb(err);
  }
};


// db/issueticketdb.js

exports.updateIssueTicket = async (issueticket_id, data) => {
  console.log('Updating issue ticket with ID +++++++++++model+++++++:', issueticket_id);
  console.log('Data to update+++++++++++++model++++++++++:', data);
  const updateData = {};

  if (data.ticketstatus_id !== undefined) {
    updateData.ticketstatus_id = data.ticketstatus_id;
  }

  if (data.assigned_to !== undefined) {
    updateData.user_id = data.assigned_to;
  }
  if (data.updated_by !== undefined) {
    updateData.updated_by = data.updated_by;
  }


  updateData.updated_at = knex.fn.now();

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields provided for update');
  }

  const result = await knex('issueticket')
    .where({ issueticket_id })
    .update(updateData)
    .returning('*');

  return result[0];
};

