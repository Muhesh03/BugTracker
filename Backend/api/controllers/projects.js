const express = require('express');
const projectsdb = require('../models/projects.js');
const router = express.Router();

router.use(function (req, res, next) {

    // SAVE PROJECT
    router.post('/projects/save_data', (req, res) => {

        const params = {
            projectname: req.body.projectname,
            remarks: req.body.remarks,
            status_id: req.body.status_id,
            created_on: new Date()
        };
        // ALTER TABLE projects
        // ADD COLUMN created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        projectsdb.saveProjects(params, (err, output) => {

            if (err) {
                if (err.code === '23505') {
                    return res.status(409).send({ message: 'Project already exists' });
                }
                return res.status(500).send({ message: 'Something went wrong' });
            }

            res.status(201).send({
                data: output,
                actionMessage: 'Project saved successfully'
            });
        });
    });



    // LIST PROJECTS
    router.route('/projects/list').get(function (req, res, next) {
        console.log('Getting projects list from controller', req.body);

        projectsdb.getProjects((err, output) => {
            if (err) {
                return res.status(500).send({ error: "Something went wrong in member controller" });
            }

            res.status(200).send({
                message: "Projects list",
                data: output
            });
        });
    });

   router.post('/projects/delete/:project_id', function (req, res) {
    const project_id = Number(req.params.project_id);
    console.log('Project Delete working, project_id:', project_id);

    projectsdb.deleteProjects(project_id, (err, output) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: err.message || 'Delete failed'
            });
        } else {
            return res.status(200).send(output);
        }
    });
});
    // UPDATE PROJECT
    router.post('/projects/update/:project_id', function (req, res) {

        const project_id = Number(req.params.project_id);

        console.log('project update controller working', project_id, req.body);

        projectsdb.updateProjects(project_id, req.body, (err, output) => {

            if (err) {
                console.error('Update error:', err);

                // DUPLICATE HANDLING
                if (err.code === '23505') {
                    return res.status(409).send({
                        message: 'Project already exists'
                    });
                }

                return res.status(500).send({
                    message: 'Update failed'
                });
            }
            else {
                res.status(200).send({
                    success: true,
                    message: 'Project updated successfully',
                    data: output
                });
            }
        });

    });



    // SAVE PROJECT TEAM

    router.post('/projects/save/project_team', async (req, res) => {
        console.log('Hello from projects controller ---------------------------------', req.body);
        console.log('+++++++++ /save/project_team HIT');
        const { project_id, users } = req.body;
        if (!project_id || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        try {
            await projectsdb.saveProjectTeam(project_id, users);
            res.status(200).json({ success: true });
        } catch (err) {
            console.error('Save team error:', err);
            res.status(500).json({ error: err.message });
        }
    });


    router.get('/projects/assigned/:userId', async (req, res) => {
        console.log("==========con========", req.body)
        try {
            const projects = await projectsdb.getProjectsByUser(req.params.userId);
            res.status(200).json(projects);
            console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", projects)

        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    router.get('/projects/team/:project_id', async (req, res) => {
        console.log("&&&&&&&&&&***************&&&&&&&&&&&", req.body);
        try {
            const project_id = Number(req.params.project_id);
            console.log('Fetching permissions for project:', project_id);
            if (!project_id) {
                return res.status(400).json({ message: 'Invalid project id' });
            }

            const data = await projectsdb.getProjectTeam(project_id);

            return res.status(200).json(data || []);
        } catch (err) {
            console.error('Get project team error:', err);
            return res.status(500).json({ message: 'Failed to fetch project team' });
        }
    });


    next();
});
module.exports.router = router;
