const express = require('express');
const router = express.Router();
const controller = require('../controllers/teacherController');
const { isAdmin } = require('../middleware/auth');
const { teacherRules } = require('../middleware/validation');

router.get('/teachers', controller.getTeachers);
router.get('/teachers/new', isAdmin, controller.showCreateForm);
router.post('/teachers', isAdmin, teacherRules, controller.addTeacher);
router.get('/teachers/:id', controller.findTeacher, controller.getTeacher);
router.get('/teachers/:id/edit', isAdmin, controller.findTeacher, controller.showEditForm);
router.post('/teachers/:id/edit', isAdmin, controller.findTeacher, teacherRules, controller.updateTeacher);
router.post('/teachers/:id/delete', isAdmin, controller.findTeacher, controller.deleteTeacher);

module.exports = router;
