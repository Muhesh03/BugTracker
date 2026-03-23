console.log('Hello from note model');
exports.getNotesByTicket = async (issueticket_id) => {
  return knex('ticket_history as th')
    .leftJoin('userregistration as u', 'u.user_id', 'th.updated_by')
    .select(
      'th.history_id',
      'th.issueticket_id',
      'th.note',
      'th.attachments',
      'th.updated_at',
      'u.fullname as username'
    )
    .where('th.issueticket_id', issueticket_id)
    .orderBy('th.updated_at', 'desc');
};


/**
 * Add new note
 */
exports.addNotesByTicket = async (data) => {
  return knex('ticket_history')
    .insert({
      issueticket_id: data.issueticket_id,
      note: data.note,
      attachments: JSON.stringify(data.attachments || []), 
      updated_by: data.updated_by,
      updated_at: knex.fn.now()
    });
};


/**
 * Update note (optional – future use)
 */
exports.updateNote = async (history_id, data) => {
  return knex('ticket_history')
    .where({ history_id })
    .update({
      note: data.note,
      attachments: data.attachments || [],

      updated_by: data.updated_by,
      updated_at: knex.fn.now()
    });
};


