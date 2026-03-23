// const authModel = require('../models/login.js');

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await authModel.findByEmail(email);

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     if (user.password !== password) { // use bcrypt in real apps
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     res.json({
//       token: 'JWT_TOKEN_HERE',
//       user: { id: user.id, email: user.email }
//     });

//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const express = require('express');
const router = express.Router();
const userModel = require('../models/users.js');
const userGroupModel = require('../models/usergroup.js');
// const userdb = require('../models/users.js');
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get user
    const user = await userModel.findByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    //  Get usergroup_id
    const usergroupId = user.usergroup_id;
    console.log('USERGROUP ID:', usergroupId);

    if (!user.usergroup_id) {
      return res.status(400).json({ message: 'Usergroup not assigned' });
    }
   const assignedProject = await knex('projectteam')
      .where('user_id',   user.user_id)
      .where('is_active', true)
      .first();

    console.log('Assigned project:', assignedProject);


    if (!assignedProject) {
      return res.status(403).json({ 
        message: 'No project assigned. Please contact your administrator.' 
      });
    }

    //  Get permissions (IMPORTANT)
    const permissions = await userGroupModel.getPermissions(usergroupId);
    console.log('PERMISSIONS:', permissions);

    // Send response
    return res.status(200).json({
      message: 'Login successful',
      token: 'DUMMY_JWT_TOKEN',
      user: {
        id: user.user_id,
        email: user.email,
        fullname: user.fullname,
        // usergroup :user.usergroup,
        attachment_name: user.attachment_name,
        usergroup_id: user.usergroup_id
      },
      permissions
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Permission error' });
  }
});        
// router.get('/profile', (req, res) => {

//   if (!req.session?.user?.user_id) {
//     return res.status(401).send({ message: 'Unauthorized' });
//   }

//   const userId = req.session.user.user_id;

//   userdb.getProfile(userId, (err, output) => {
//     if (err) {
//       console.error('Profile fetch error:', err);
//       return res.status(500).send({ message: 'Fetch failed' });
//     }

//     res.send(output);
//   });
// });


module.exports.router = router;

