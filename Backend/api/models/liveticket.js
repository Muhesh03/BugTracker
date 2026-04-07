


exports.saveLiveTicket = function (data, cb) {
  console.log('live Ticket table data', data);

  knex('livetickets')
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



exports.markAsConverted = function (liveticket_id, cb) {
    knex('livetickets')
        .where({ liveticket_id: liveticket_id })
        .update({ is_converted: true,ticketstatus_id: 3 })
        .then(function () {
            cb(null, true);
        })
        .catch(function (err) {
            console.error('Error marking as converted:', err);
            cb(err, null);
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



exports.getTicketStatus = function (cb) {
  knex('ticketstatus')
    .select('*')
    .whereNot({ "status_id": 3 })
    .then(function (out) {
      console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmm', out);
      cb(null, out);

    }).catch(function (e) {

      cb(e, 'error');
    })
}


// exports.getLiveTicket = function (projectParams, cb) {
//   console.log("Fetching live tickets...");

//   knex('livetickets as it')
//     .leftJoin('ticketpriority as p', 'it.priority_id', 'p.priority_id')
//     .leftJoin('tickettype as tt', 'it.tickettype_id', 'tt.tickettype_id')
//     .leftJoin('userregistration as ur', 'it.created_by', 'ur.user_id')
//     // .leftJoin('userregistration as u', 'it.user_id', 'u.user_id')
//     .leftJoin('liveticket_status as ts', 'it.ticketstatus_id', 'ts.id')

//     .leftJoin('tickettag as tg', function () {
//       this.on(knex.raw('tg.tickettag_id = ANY(COALESCE(it.ticket_tag, ARRAY[]::int[]))'));
//     })
//     .select(
//       'it.liveticket_id as liveticket_id',
//       'it.ticket_number',
//       'it.summary',
//       'it.description',
//       'it.instance',
//       'it.unit',
//       'it.tickettype_id',
//       'tt.name as ticket_type_name',
//       'ts.statusname',
//       'it.priority_id',
//       'p.priority',
//       'p.icon',
//       'it.ticketstatus_id',             // your table column
//       // 'it.user_id as assigned_user_id',
//       // 'u.fullname as assigned_to_name',
//       'it.created_by',
//       'ur.fullname as created_by_name',
//       'it.image_path',
//       'it.steps_to_reproduce',
//       knex.raw('array_agg(tg.tickettag) as tag_names'),
//       knex.raw('array_agg(tg.tickettag_id) as tag_ids'),
//       'it.created_at',
//       'it.updated_on',
//       'it.updated_by',
//       'it.is_converted' 
//     )
//     .modify(function(qb) {
//       // if (projectParams.userid) {
//       //   qb.where('it.created_by', projectParams.userid);
//       // }
//       if (projectParams.projectid) {
//         qb.where('it.project_id', projectParams.projectid);
//       }
//     })
//     .groupBy(
//       'it.liveticket_id',
//       'it.ticket_number',
//       'it.summary',
//       'it.description',
//       'it.instance',
//       'it.unit',
//       'it.tickettype_id',
//       'ts.statusname',
//       'tt.name',
//       'it.priority_id',
//       'p.priority',
//       'p.icon',
//       'it.ticketstatus_id',
//       // 'it.user_id',
//       // 'u.fullname',
//       'it.created_by',
//       'ur.fullname',
//       'it.image_path',
//       'it.steps_to_reproduce',
//       'it.created_at',
//       'it.updated_on',
//       'it.updated_by',
//       'it.is_converted' 
//     )
//     .orderBy('it.liveticket_id', 'asc')
//     .then(out => cb(null, out))
//     .catch(e => {
//       console.error('Database query error:', e);
//       cb(e, 'error');
//     });
// };




exports.getLiveTicket = function (projectParams, cb) {
  console.log("Fetching live tickets...");

  knex('livetickets as it')
    .leftJoin('ticketpriority as p', 'it.priority_id', 'p.priority_id')
    .leftJoin('tickettype as tt', 'it.tickettype_id', 'tt.tickettype_id')
    .leftJoin('userregistration as ur', 'it.created_by', 'ur.user_id')
    .leftJoin('liveticket_statuses as ts', 'it.ticketstatus_id', 'ts.id') 

    .leftJoin('tickettag as tg', function () {
      this.on(knex.raw('tg.tickettag_id = ANY(COALESCE(it.ticket_tag, ARRAY[]::int[]))'));
    })
    .select(
      'it.liveticket_id as liveticket_id',
      'it.ticket_number',
      'it.summary',
      'it.description',
      'it.instance',
      'it.unit',
      'it.tickettype_id',
      'tt.name as ticket_type_name',
      'ts.label as statusname',  
      'ts.color as status_color', 
      'it.priority_id',
      'p.priority',
      'p.icon',
      'it.ticketstatus_id',
      'it.created_by',
      'ur.fullname as created_by_name',
      'it.image_path',
      'it.steps_to_reproduce',
      knex.raw('array_agg(tg.tickettag) as tag_names'),
      knex.raw('array_agg(tg.tickettag_id) as tag_ids'),
      'it.created_at',
      'it.updated_on',
      'it.updated_by',
      'it.is_converted'
    )
    .modify(function(qb) {
      if (projectParams.projectid) {
        qb.where('it.project_id', projectParams.projectid);
      }
    })
    .groupBy(
      'it.liveticket_id',
      'it.ticket_number',
      'it.summary',
      'it.description',
      'it.instance',
      'it.unit',
      'it.tickettype_id',
      'ts.label',       
      'ts.color',      
      'tt.name',
      'it.priority_id',
      'p.priority',
      'p.icon',
      'it.ticketstatus_id',
      'it.created_by',
      'ur.fullname',
      'it.image_path',
      'it.steps_to_reproduce',
      'it.created_at',
      'it.updated_on',
      'it.updated_by',
      'it.is_converted'
    )
    .orderBy('it.liveticket_id', 'asc')
    .then(out => cb(null, out))
    .catch(e => {
      console.error('Database query error:', e);
      cb(e, 'error');
    });
};

exports.getFilter = function (filters, cb) {

  const {
    filterValuePriority,
    filterValueDate,
    fromDate,
    toDate
  } = filters;

  knex('livetickets as it')          // ← replace with your actual table name
    .leftJoin('ticketpriority as p', 'it.priority_id', 'p.priority_id')

    .select(
      'it.liveticket_id',
      'it.summary',
      'it.description',
      'it.ticketstatus_id',
      'it.priority_id',
      'p.priority',
      'it.ticket_number',
      'it.created_at',
      'it.instance',
      'it.unit'
    )

    .where(function () {

      // ===== PRIORITY FILTER =====
      if (filterValuePriority && filterValuePriority !== '0') {
        this.where('it.priority_id', Number(filterValuePriority));
      }

      // ===== DATE FILTER =====
      if (filterValueDate === 'Yesterday') {
        this.whereRaw(
          "DATE(it.created_at) = CURRENT_DATE - INTERVAL '1 day'"
        );
      }

      if (filterValueDate === 'Between' && fromDate && toDate) {
        const from = new Date(fromDate).toISOString().split('T')[0];
        const to   = new Date(toDate).toISOString().split('T')[0];
        this.whereRaw(
          'DATE(it.created_at) BETWEEN ? AND ?',
          [from, to]
        );
      }

    })

    .orderBy('it.liveticket_id', 'asc')

    .then(out => cb(null, out))
    .catch(err => {
      console.error('Error in getFilter:', err);
      cb(err, 'error');
    });

};

exports.getLiveticketStatuses = function (cb) {
  knex('liveticket_statuses')
    .select('id', 'key', 'label', 'color')
    .orderBy('sort_order', 'asc')
    .then(function (out) {
      console.log('Liveticket statuses data:', out);
      cb(null, out);
    })
    .catch(function (e) {
      console.error('Error fetching liveticket statuses:', e);
      cb(e, 'error');
    });
};