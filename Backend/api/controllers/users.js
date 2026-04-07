

////////////////////////////////////////////////////////////////////////////////



const express = require('express');
const userdb = require('../models/users.js');
const router = express.Router();

/**
 * CREATE USER
 */
// router.post('/user/user_data', async(req, res) => {

//     console.log('CREATE USER BODY:', req.body);
//     try {
//         const { fullname, password, email, phonenumber, usergroup_id } = req.body;

//         // Step 1: Check if email already exists (even deleted users)
//         const existingUser = await knex('userregistration')
//             .where('email', email)
//             .first();

//         if (existingUser) {

//             // Step 2: If user is deleted (status_id = 3), reactivate and update
//             if (existingUser.status_id === 3) {
//                 const updated = await knex('userregistration')
//                     .where('email', email)
//                     .update({
//                         fullname,
//                         password,
//                         phonenumber,
//                         usergroup_id,
//                         status_id: 1,
//                         created_on: new Date()
//                     })
//                     .returning('*');

//                 return res.status(201).send({
//                     user_id: updated[0].user_id,
//                     message: 'User reactivated successfully',
//                     data: updated[0]
//                 });
//             }

//             // Step 3: If user is active, block it
//             return res.status(409).send({
//                 message: 'User already exists'
//             });
//         }
//         const params = {
//             fullname: req.body.fullname,
//             status_id: req.body.status_id,
//             password: req.body.password,
//             email: req.body.email,
//             phonenumber: req.body.phonenumber,
//             usergroup_id: req.body.usergroup_id,
//             // attachment_name: req.body.attachment_name,
//             created_on: new Date(),
//             status_id: 1
//         };

//         userdb.saveuser(params, (err, output) => {
//             if (err) {
//                 console.error('Save user error:', err);

//                 //  DUPLICATE USER HANDLING
//                 if (err.code === '23505') {
//                     return res.status(409).send({
//                         message: 'User already exists'
//                     });
//                 }

//                 return res.status(500).send({
//                     message: 'Something went wrong'
//                 });
//             }

//             return res.status(201).send({
//                 user_id: output.user_id,
//                 message: 'User created successfully',
//                 data: output
//             });
//         });
//     }
//     catch (err) {
//     console.error('Create user error:', err);
//     res.status(500).send({ message: 'Something went wrong' });
//   }
// });

router.post('/user/user_data', async (req, res) => {
    console.log('CREATE USER BODY:', req.body);

    try {
        const { fullname, password, email, phonenumber, usergroup_id } = req.body;

        // if email already exists
        const existingUser = await knex('userregistration')
            .where('email', email)
            .first();

        if (existingUser) {

            if (existingUser.status_id === 3) {
                const updated = await knex('userregistration')
                    // .where('email', email)
                    .where('user_id', existingUser.user_id)
                    .update({
                        fullname,
                        password,
                        phonenumber,
                        usergroup_id,
                        status_id: 1,
                        is_reactivated: true
                    })
                    .returning('*');

                return res.status(201).send({
                    user_id: updated[0].user_id,
                    message: 'User reactivated successfully',
                    data: updated[0]
                });
            }

            if (existingUser.status_id === 1) {
                return res.status(409).send({
                    message: 'Email already exists'
                });
            }
        }

        // Step 4: Email not found — create new user
        const params = {
            fullname,
            password,
            email,
            phonenumber,
            usergroup_id,
            created_on: new Date(),
            status_id: 1,
            is_reactivated: false
        };

        userdb.saveuser(params, (err, output) => {
            if (err) {
                console.error('Save user error:', err);
                if (err.code === '23505') {
                    return res.status(409).send({
                        message: 'Email already exists'
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

    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).send({ message: 'Something went wrong' });
    }
});

/**
 * GET USER LIST
 */
router.get('/user/get_List', (req, res) => {
    console.log("status changed to 2 check it ", req.body);

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
    console.log("wwwwwwwwwwwEEEEEEEEE", req.body);

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


router.put('/user/update-password', async (req, res) => {

    const { user_id, password } = req.body;

    console.log("USER ID:", user_id);

    try {

        const result = await userdb.updatePassword(user_id, password);

        res.status(200).json({
            message: "Password updated successfully",
            updated: result
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Password update failed"
        });

    }

});

module.exports.router = router;
