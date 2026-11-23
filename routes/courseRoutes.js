const express = require('express');
const router = express.Router();
const controller = require('../controllers/courseController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { courseRules } = require('../middleware/validation');

router.get('/', controller.redirectToCourses);
router.get('/statistics', isAuthenticated, controller.getStatistics);
router.get('/courses', controller.getCourses);
router.get('/courses/new', isAdmin, controller.showCreateForm);
router.post('/courses', isAdmin, courseRules, controller.addCourse);
router.get('/courses/:id', controller.findCourse, controller.getCourse);
router.get('/courses/:id/edit', isAdmin, controller.findCourse, controller.showEditForm);
router.post('/courses/:id/edit', isAdmin, controller.findCourse, courseRules, controller.updateCourse);
router.post('/courses/:id/delete', isAdmin, controller.findCourse, controller.deleteCourse);

module.exports = router;
