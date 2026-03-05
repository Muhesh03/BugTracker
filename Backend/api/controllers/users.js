
// const express = require('express');
// const userdb = require('../models/users.js');
// const router = express.Router();

// router.use(function (req, res, next) {
//     router.route('/user/user_data').post(function (req, res, next) {

//         console.log('cccccccccccccccccccccc', req.body);


//         const params = {
//             fullname: req.body.fullname,
//             status: req.body.status,
//             password: req.body.password,
//             email: req.body.email,
//             phonenumber: req.body.phonenumber,
//             usergroup: req.body.usergroup,
//             created_on: new Date(),
//             status_id: 1
//         }

//         userdb.saveuser(params, function (err, output) {
//             if (err) {
//                 return res.status(500).send({ error: 'Something went wrong !' });
//             } else {
//                 var items = {};
//                 items.data = output;
//                 items.actionMessage = " tickettype listed ";
//                 console.log('iiiiiiiiiiiiiiiiiiiii', items);
//                 res.status(200).send(items);
//             }
//         });
//     });

//     console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

//     router.route('/user/get_List').get(function (req, res, next) {

//         // console.log('user controler==============%%%%%%%%%5');
//         userdb.getuser((err, output) => {
//             if (err) {
//                 console.log('user controler error===========', err)
//                 return res.status(500).send({ error: "Something went wrong" });
//             }

//             res.status(200).send({
//                 message: "user list",
//                 data: output
//             });
//         });
//     });
//     router.post('/user/delete', (req, res) => {

//         const user_id = req.body.user_id;

//         console.log('Received /user/delete body:', user_id);
//         console.log('user controler==============%%%%%%%%%5');
//         userdb.deleteuser(user_id, function (err, output) {
//             if (err) {
//                 console.log('user controler error===========', err)
//                 return res.status(500).send({ error: "===>>>>Something went wrong" });
//             }

//             res.status(200).send({
//                 message: "user deleted",
//                 data: output
//             });
//         });

//     });
//     router.post('/user/update', (req, res) => {

//         const { user_id, fullname,usergroup, status, password, email, phonenumber } = req.body;

//         // ================= UPDATE =================
//         if (user_id) {

//             const params = {
//                 user_id,
//                 fullname,
//                 usergroup,
//                 status,
//                 password,
//                 email,
//                 phonenumber
//             };

//             userdb.updateuser(params, (err, result) => {
//                 if (err) {
//                     console.error('Update error:', err);
//                     return res.status(500).send({ error: 'Update failed' });
//                 }

//                 return res.status(200).send({
//                     message: 'User updated successfully',
//                     data: result
//                 });
//             });

//         }


//     });


//     next();
// });
// module.exports.router = router;
















////////////////////////////////////////////////////////////////////////////////



const express = require('express');
const userdb = require('../models/users.js');
const router = express.Router();

/**
 * CREATE USER
 */
router.post('/user/user_data', (req, res) => {

    console.log('CREATE USER BODY:', req.body);

    const params = {
        fullname: req.body.fullname,
        status_id: req.body.status_id,
        password: req.body.password,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        usergroup_id: req.body.usergroup_id,
        // attachment_name: req.body.attachment_name,
        created_on: new Date(),
        status_id: 1
    };

    userdb.saveuser(params, (err, output) => {
        if (err) {
            console.error('Save user error:', err);

            //  DUPLICATE USER HANDLING
            if (err.code === '23505') {
                return res.status(409).send({
                    message: 'User already exists'
                });
            }

            return res.status(500).send({
                message: 'Something went wrong'
            });
        }

        return res.status(201).send({
            user_id: output.user_id,
            message: 'User created successfully',
            data: output
        });
    });
});

/**
 * GET USER LIST
 */
router.get('/user/get_List', (req, res) => {

    userdb.getuser((err, output) => {
        if (err) {
            console.error('Get user error:', err);
            return res.status(500).send({
                message: 'Something went wrong'
            });
        }

        return res.status(200).send({
            message: 'User list',
            data: output
        });
    });
});

/**
 * DELETE USER
 */
router.post('/user/delete', (req, res) => {

    const user_id = req.body.user_id;
    console.log('DELETE USER ID:', user_id);

    userdb.deleteuser(user_id, (err, output) => {
        if (err) {
            console.error('Delete error:', err);
            return res.status(500).send({
                message: 'Something went wrong'
            });
        }

        return res.status(200).send({
            message: 'User deleted successfully',
            data: output
        });
    });
});

/**
 * UPDATE USER
 */
router.post('/user/update', (req, res) => {

    const {
        user_id,
        fullname,
        usergroup_id,
        status_id,
        password,
        email,
        phonenumber
    } = req.body;

    if (!user_id) {
        return res.status(400).send({
            message: 'User ID is required'
        });
    }

    const params = {
        user_id,
        fullname,
        usergroup_id,
        status_id,
        password,
        email,
        phonenumber
    };

    userdb.updateuser(params, (err, result) => {
        if (err) {
            console.error('Update error:', err);

            //  DUPLICATE CHECK DURING UPDATE
            if (err.code === '23505') {
                return res.status(409).send({
                    message: 'User already exists'
                });
            }

            return res.status(500).send({
                message: 'Update failed'
            });
        }

        return res.status(200).send({
            message: 'User updated successfully',
            data: result
        });
    });
});

router.get('/user/usergrouplist', (req, res) => {

    console.log('Fetching usergroup list to user');

    userdb.getUserGroup((err, output) => {

        if (err) {
            return res.status(500).send({
                message: 'Something went wrong'
            });
        }

        return res.status(200).send({
            message: 'Usergroup list',
            data: output
        });
    });
});


// save project
router.post('/user/last-project', async (req, res) => {
    console.log("wwwwwwwwwwwEEEEEEEEE",req.body);

    const { userId, projectId } = req.body;
    try {
        await userdb.updateLastProject(userId, projectId);
        res.json({ message: 'Last project updated' });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// fetch project
router.get('/user/last-project/:userId', async (req, res) => {
  const userId = req.params.userId;

  console.log("USER ID FROM PARAM:", userId);

  try {
    const data = await userdb.getLastProject(userId);

   
    res.status(200).json({
      last_project_id: data && data.last_project_id
        ? data.last_project_id
        : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fetch failed' });
  }
});




module.exports.router = router;
