
// // exports.saveAttachment = (data) => {
// //   return knex('ticket_attachment').insert(data);
// // };

// // exports.getAttachmentsByTicket = (ticketId) => {
// //   return knex('ticket_attachment')
// //     .select(
// //       'attachment_id',
// //       'file_name',
// //       'file_type',
// //       'file_size',
// //       'uploaded_at'
// //     )
// //     .where('ticket_id', ticketId);
// // };

// // exports.downloadAttachment = (id) => {
// //   return knex('ticket_attachment')
// //     .where('attachment_id', id)
// //     .first();
// // };


// // const knex = require('../../db/knex'); // adjust path if needed

// // SAVE attachment
// exports.saveAttachment = function (data, cb) {
//   console.log('attachment model data =======', data);

//   knex('attachment')
//     .insert({
//       ticket_id: data.ticket_id,
//       file_name: data.file_name,
//       file_type: data.file_type,
//       file_size: data.file_size,
//       file_data: data.file_data   // BYTEA
//     })
//     .returning('*')
//     .then(rows => cb(null, rows[0]))
//     .catch(err => cb(err, null));
// };

// // GET attachments by ticket
// exports.getAttachmentsByTicket = function (ticketId, cb) {
//   knex('attachment')
//     .select(
//       'attachment_id',
//       'ticket_id',
//       'file_name',
//       'file_type',
//       'file_size',
//       'created_at'
//     )
//     .where({ ticket_id: ticketId })
//     .orderBy('created_at', 'desc')
//     .then(rows => cb(null, rows))
//     .catch(err => cb(err, null));
// };

// // GET attachment by id (for download)
// exports.getAttachmentById = function (id, cb) {
//   knex('attachment')
//     .select('file_name', 'file_type', 'file_data')
//     .where({ attachment_id: id })
//     .first()
//     .then(row => cb(null, row))
//     .catch(err => cb(err, null));
// };
