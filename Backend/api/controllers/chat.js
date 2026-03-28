
const express = require('express');
const router = express.Router();

const chatModel = require('../models/chat.js');

// SEND MESSAGE
// router.post('/send', async (req, res) => {
//      console.log("==========Controller chat==========",req.body)
//   try {
//      console.log("==========Controller try chat==========",req.body)
//     const { sender_id, receiver_id, message } = req.body;

//     if (!sender_id || !receiver_id || !message) {
//       return res.status(400).json({ error: 'Missing fields' });
//     }

//     const data = await chatModel.sendMessage(
//       sender_id,
//       receiver_id,
//       message
//     );

//     res.json(data);

//   } catch (err) {
//     console.error("SEND ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

router.post('/send', async (req, res) => {

  console.log("REQUEST BODY:", req.body);

  const { sender_id, receiver_id, message, chattype_id } = req.body;
  try {
    if (!sender_id || !receiver_id || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const data = await chatModel.sendMessage(
      sender_id,
      receiver_id,
      message,
      chattype_id
    );

    res.json(data);
  }
  catch (err) {
    console.error("SEND ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// // GET CHAT HISTORY
// router.get('/history/:user1/:user2', async (req, res) => {
//      console.log("==========Controller  getchat==========",req.body)
//   try {
//      console.log("==========Controller try getchat==========",req.body)
//     const { user1, user2 } = req.params;

//     console.log("CHAT HIT:", user1, user2); // debug

//     const data = await chatModel.getMessages(user1, user2);

//     res.json(data);

//   } catch (err) {
//     console.error("GET ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
router.get('/history/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    console.log("CHAT HIT:", user1, user2);

    const messages = await chatModel.getMessages(user1, user2);

    res.json(messages);

  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/group', async (req, res) => {
  console.log(" GET GROUP HIT", req.body);
  const { sender_id, message, chattype_id } = req.body;
  try {

    // if (!sender_id || !message) {
    //   return res.status(400).json({ error: "Missing fields" });
    // }

    const data = await chatModel.getGroupMessages(
      sender_id,
      message,
      chattype_id
    );

    res.json(data);

  } catch (err) {
    console.error("GROUP SEND ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/group/send', async (req, res) => {
  try {
    console.log(" POST GROUP HIT +++++++++++send", req.body);
    const { sender_id, message, chattype_id } = req.body;

    if (!sender_id || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const data = await chatModel.sendGroupMessage(sender_id,
      message, chattype_id);

    res.json(data);

  } catch (err) {
    console.error("GROUP GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


router.put('/read', async (req, res) => {
  console.log('---------read controller---------', req.body);
  const { currentUserId, selectedUserId } = req.body;

  await chatModel.markAsRead(currentUserId, selectedUserId);

  res.json({ success: true });
});

router.get('/unread/:userId', async (req, res) => {
  try {
    console.log("------unread controller---------", req.params.userId)
    const data = await chatModel.getUnreadCounts(req.params.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports.router = router;