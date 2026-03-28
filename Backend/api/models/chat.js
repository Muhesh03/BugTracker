

exports.sendMessage = async (sender_id, receiver_id, message, chattype_id) => {

  console.log("MODEL DATA:", sender_id, receiver_id, message, chattype_id);

  const rows = await knex('messages')
    .insert({
      sender_id,
      receiver_id,
      message,
      chattype_id
    })
    .returning('*');

  return rows[0];
};


// exports.getMessages = async (user1, user2) => {
//   console.log('Get messages:', user1, user2);

//   try {
//     const rows = await knex('messages')
//       .where('chattype_id', 1)
//       .andwhere(function () {
//         this.where({ sender_id: user1, receiver_id: user2 })
//           .orWhere({ sender_id: user2, receiver_id: user1 });
//       })
//       .orderBy('created_at', 'asc');

//     return rows;

//   } catch (err) {
//     console.error('Get messages error:', err);
//     throw err;
//   }
// };

exports.getMessages = async (user1, user2) => {
  try {
    const rows = await knex('messages as m')
      .join('userregistration as u', 'm.sender_id', 'u.user_id')
      .select('m.*', 'u.fullname as sender_name')
      .where('m.chattype_id', 1)
      .andWhere(function () {
        this.where({ 'm.sender_id': user1, 'm.receiver_id': user2 })
            .orWhere({ 'm.sender_id': user2, 'm.receiver_id': user1 });
      })
      .orderBy('m.created_at', 'asc');

    return rows;

  } catch (err) {
    console.error('Get messages error:', err);
    throw err;
  }
};

exports.sendGroupMessage = async (sender_id, message,chattype_id) => {
   console.log(" SEND MODEL GROUP HIT",sender_id,message,chattype_id);

  const rows = await knex('messages')
  .insert({
    sender_id,
    message,
    chattype_id
  })
  .returning('*');
 
  return rows[0];
};

// ======================
// GET GROUP
// ======================
exports.getGroupMessages = async () => {
  try {
       console.log(" GET MODEL GROUP HIT");
    const rows = await knex('messages as m')
      .join('userregistration as u', 'm.sender_id', 'u.user_id')
      .select('m.*', 'u.fullname as sender_name')
      .where('m.chattype_id', 2)
      .orderBy('m.created_at', 'asc');

    return rows;

  } catch (err) {
    console.error('Get group messages error:', err);
    throw err;
  }
};

exports.markAsRead = async (user1, user2) => {
  console.log(" ==========read Model=======",user1,user2)
  return await knex('messages')
    .where({
      sender_id: user2,
      receiver_id: user1,
      is_read: false
    })
    .update({ is_read: true });
};

 exports.getUnreadCounts = async (userId) => {
  console.log(" MODEL HIT:", userId);

  try {
    const rows = await knex('messages')
      .select('sender_id')
      .count('* as unread_count')
      .where({
        receiver_id: userId,
        is_read: false,
        chattype_id: 1
      })
      .groupBy('sender_id');

    console.log(" MODEL RESULT:", rows);  // 👈 IMPORTANT

    return rows;

  } catch (err) {
    console.error("MODEL ERROR:", err);
    throw err;
  }
};
// exports.getUnreadCounts = async (user1) => {
//   console.log(" MODEL HIT:", user1);

//   try {
//     const rows = await knex('messages')
//       // .select('sender_id')
//       .count('* as unread_count')
//       .where('receiver_id', user1)
//       .andWhere('chattype_id', 1)
//       .andWhere('is_read', true)   // 👈 safer
//       // .groupBy('sender_id');

//     console.log(" MODEL RESULT:", rows);

//     return rows;

//   } catch (err) {
//     console.error("MODEL ERROR:", err);
//     throw err;
//   }
// };
