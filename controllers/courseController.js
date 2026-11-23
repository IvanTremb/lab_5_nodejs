const { Op } = require('sequelize');
const { sequelize, Teacher, Course } = require('../models');
const { logAdminAction } = require('../middleware/logger');

function redirectToCourses(req, res) {
    res.redirect('/courses');
}

async function getAllTeachers() {
    const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });
    return teachers;
}

function getCourseData(body) {
    return {
        title: body.title,
        credits: body.credits,
        semester: body.semester,
        description: body.description,
        teacherId: body.teacherId
    };
}

async function getCourses(req, res, next) {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const teacherId = typeof req.query.teacherId === 'string' ? req.query.teacherId : '';
    const semester = typeof req.query.semester === 'string' ? req.query.semester : '';

    const where = {};

    if (search !== '') {
        where.title = { [Op.iLike]: '%' + search + '%' };
    }

    const teacherNumber = Number(teacherId);
    if (teacherId !== '' && Number.isInteger(teacherNumber) && teacherNumber > 0 && teacherNumber <= 2147483647) {
        where.teacherId = teacherNumber;
    }

    const semesterNumber = Number(semester);
    if (semester !== '' && Number.isInteger(semesterNumber) && semesterNumber >= 1 && semesterNumber <= 8) {
        where.semester = semesterNumber;
    }

    try {
        const courses = await Course.findAll({
            where: where,
            include: Teacher,
            order: [['id', 'ASC']]
        });
        const teachers = await getAllTeachers();

        res.render('courses/index', {
            courses: courses,
            teachers: teachers,
            search: search,
            teacherId: teacherId,
            semester: semester
        });
    } catch (error) {
        next(error);
    }
}

async function findCourse(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
        const error = new Error('Некорректный ID курса');
        error.status = 404;
        return next(error);
    }

    try {
        const course = await Course.findByPk(id, { include: Teacher });

        if (!course) {
            const error = new Error('Курс не найден');
            error.status = 404;
            return next(error);
        }

        req.course = course;
        next();
    } catch (error) {
        next(error);
    }
}

function getCourse(req, res) {
    res.render('courses/details', { course: req.course });
}

async function showCreateForm(req, res, next) {
    try {
        const teachers = await getAllTeachers();
        res.render('courses/create', { course: {}, teachers: teachers, errors: [] });
    } catch (error) {
        next(error);
    }
}

async function addCourse(req, res, next) {
    const errors = req.errors;
    const data = getCourseData(req.body);

    try {
        let techer = null;
        if (errors.length === 0) {
            techer = await Teacher.findByPk(data.teacherId);
            if (!techer) {
                errors.push('Выбранный преподаватель не существует');
            }
        }

        if (errors.length > 0) {
            const teachers = await getAllTeachers();
            return res.status(400).render('courses/create', {
                course: data,
                teachers: teachers,
                errors: errors
            });
        }

        const course = await Course.create(data);
        logAdminAction(req, 'CREATE', 'Course', course.id);

        const io = req.app.get('io');
        io.emit('courseCreated', {
            title: course.title,
            teacherName: techer.name,
            time: course.createdAt
        });

        res.redirect('/courses');
    } catch (error) {
        next(error);
    }
}

async function showEditForm(req, res, next) {
    try {
        const teachers = await getAllTeachers();
        res.render('courses/edit', { course: req.course, teachers: teachers, errors: [] });
    } catch (error) {
        next(error);
    }
}

async function updateCourse(req, res, next) {
    const errors = req.errors;
    const data = getCourseData(req.body);
    data.id = req.course.id;

    try {
        if (errors.length === 0) {
            const techer = await Teacher.findByPk(data.teacherId);
            if (!techer) {
                errors.push('Выбранный преподаватель не существует');
            }
        }

        if (errors.length > 0) {
            const teachers = await getAllTeachers();
            return res.status(400).render('courses/edit', {
                course: data,
                teachers: teachers,
                errors: errors
            });
        }

        await req.course.update({
            title: data.title,
            credits: data.credits,
            semester: data.semester,
            description: data.description,
            teacherId: data.teacherId
        });
        logAdminAction(req, 'UPDATE', 'Course', req.course.id);

        res.redirect('/courses/' + req.course.id);
    } catch (error) {
        next(error);
    }
}

async function deleteCourse(req, res, next) {
    try {
        const id = req.course.id;
        await req.course.destroy();
        logAdminAction(req, 'DELETE', 'Course', id);

        res.redirect('/courses');
    } catch (error) {
        next(error);
    }
}

async function getStatistics(req, res, next) {
    try {
        const teachersCount = await Teacher.count();
        const coursesCount = await Course.count();

        const semesterRows = await Course.findAll({
            attributes: ['semester', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['semester'],
            raw: true
        });

        const bySemester = [];
        for (let i = 1; i <= 8; i++) {
            let count = 0;
            for (let j = 0; j < semesterRows.length; j++) {
                if (Number(semesterRows[j].semester) === i) {
                    count = Number(semesterRows[j].count);
                }
            }
            bySemester.push({ semester: i, count: count });
        }

        const teachers = await Teacher.findAll({
            include: Course,
            order: [['name', 'ASC']]
        });

        const byTeacher = [];
        let bestTeacher = null;
        let maxCount = 0;

        for (let i = 0; i < teachers.length; i++) {
            const count = teachers[i].Courses.length;
            byTeacher.push({ id: teachers[i].id, name: teachers[i].name, count: count });

            if (count > maxCount) {
                maxCount = count;
                bestTeacher = teachers[i];
            }
        }

        res.render('statistics', {
            teachersCount: teachersCount,
            coursesCount: coursesCount,
            bySemester: bySemester,
            byTeacher: byTeacher,
            bestTeacher: bestTeacher,
            maxCount: maxCount
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    redirectToCourses,
    getCourses,
    findCourse,
    getCourse,
    showCreateForm,
    addCourse,
    showEditForm,
    updateCourse,
    deleteCourse,
    getStatistics
};
