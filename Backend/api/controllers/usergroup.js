const express = require('express');
const userdb = require('../models/usergroup.js');
const router = express.Router();

/**
 * ================= CREATE USER GROUP =================
 */
router.post('/usergroup/save_data', (req, res) => {

    console.log('Create usergroup:', req.body);

    const params = {
        usergroupname: req.body.usergroupname,
        status_id: 1,
        created_on: new Date()
    };

    userdb.saveUserGroup(params, (err, output) => {

        if (err) {
            console.error('Create error:', err);

            // DUPLICATE HANDLING
            if (err.code === '23505') {
                return res.status(409).send({
                    message: 'User group already exists'
                });
            }

            return res.status(500).send({
                message: 'Something went wrong'
            });
        }

        return res.status(201).send({
            message: 'User group created',
            data: output
        });
    });
});

router.get('/usergroup/list', (req, res) => {


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


router.post('/usergroup/delete/:usergroup_id', (req, res) => {

  const usergroup_id = Number(req.params.usergroup_id);
  console.log('Deleting usergroup:', usergroup_id);

  userdb.deleteUsergroup(usergroup_id, (err, output) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Delete failed'
      });
    }

    //  DO NOT override success
    return res.status(200).json(output);
  });
});


router.post('/usergroup/update/:usergroup_id', (req, res) => {

    const usergroup_id = Number(req.params.usergroup_id);
    console.log('Updating usergroup:', usergroup_id, req.body);

    userdb.updateUserGroup(usergroup_id, req.body, (err, output) => {

        if (err) {
            console.error('Update error:', err);

            // DUPLICATE HANDLING
            if (err.code === '23505') {
                return res.status(409).send({
                    message: 'User group already exists'
                });
            }

            return res.status(500).send({
                message: 'Update failed'
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Usergroup updated',
            data: output
        });
    });
});

/**
 * ================= USER GROUP PERMISSIONS =================
 */
router.post('/usergroup/permissions/:usergroup_id', (req, res) => {
    const usergroup_id = Number(req.params.usergroup_id);

    const payload = {
        usergroup_id: usergroup_id,
        permissions: req.body.permissions
    };

    console.log('Save permissions payload:', payload);

    if (!usergroup_id || !Array.isArray(payload.permissions)) {
        return res.status(400).json({
            message: 'Invalid permission payload'
        });
    }

    userdb.savePermissions(payload, (err) => {

        if (err) {
            console.error('Permission save error:', err);
            return res.status(500).json({
                message: 'Permission save failed'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Permissions saved successfully'
        });
    });
});


// Get permissions
// router.get('/permissions/:usergroup_id', (req, res) => {
//     // console.log('++++++++++++++++++++++',req.body);
//     const usergroup_id = Number(req.params.usergroup_id);
//     console.log('Fetching permissions for usergroup:', usergroup_id);
//     if (!usergroup_id) {
//         return res.status(400).json({
//             message: 'Invalid usergroup id'
//         });
//     }



//     userdb.getPermissions(usergroup_id, (err, data) => {

//         if (err) {
//             console.error('Permission fetch error:', err);
//             return res.status(500).json({
//                 message: 'Failed to fetch permissions'
//             });
//         }

//         return res.status(200).json(data);
//     });

// });


router.get('/usergroup/permissions/:usergroup_id', async (req, res) => {
    console.log("&&&&&&&&&&&&&&&7&&&&&&&&&&&&&&", req.body);
    try {
        const usergroup_id = Number(req.params.usergroup_id);
        console.log('Fetching permissions for usergroup:', usergroup_id);

        if (!usergroup_id) {
            return res.status(400).json({ message: 'Invalid usergroup id' });
        }

        const data = await userdb.getPermissions(usergroup_id);

        return res.status(200).json(data || []); 
    } catch (err) {
        console.error('Permission fetch error:', err);
        return res.status(500).json({ message: 'Failed to fetch permissions' });
    }
});


module.exports.router = router;
