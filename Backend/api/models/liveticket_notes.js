console.log('Hello from live ticket note model');


/**
 * Get notes by Live Ticket ID
 */
exports.getNotesByTicket = async (liveticket_id) => {
  return knex('live_ticket_notes as ln')
    .leftJoin('userregistration as u', 'u.user_id', 'ln.created_by')
    .select(
      'ln.id',
      'ln.liveticket_id',
      'ln.note_text',
      'ln.attachments',
      'ln.created_at',
      'u.fullname as username'
    )
    .where('ln.liveticket_id', Number(liveticket_id)) // <-- important!
    .orderBy('ln.created_at', 'desc');
};
/**
 * Add new live ticket note
 */
exports.addNotesByTicket = async (data) => {
  return knex('live_ticket_notes')
    .insert({
      liveticket_id: data.liveticket_id,
      note_text: data.note_text,
      attachments: JSON.stringify(data.attachments || []),
      created_by: data.created_by,
      created_at: knex.fn.now()
    })
    .returning('*');   // IMPORTANT → return inserted row
};



/**
 * Update note (optional future use)
 */
exports.updateNote = async (id, data) => {
  return knex('live_ticket_notes')
    .where({ id })
    .update({
      note_text: data.note_text,
      attachments: JSON.stringify(data.attachments || []),
      created_by: data.created_by,
      created_at: knex.fn.now()
    });
};