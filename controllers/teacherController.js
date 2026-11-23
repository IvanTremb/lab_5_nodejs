const { Op } = require('sequelize');
const { Teacher, Course } = require('../models');
const { logAdminAction } = require('../middleware/logger');

function getTeacherData(body) {
    return {
        name: body.name,
        email: body.email,
        department: body.department,
        academicDegree: body.academicDegree
    };
}

async function getTeachers(req, res, next) {
    try {
        const teachers = await Teacher.findAll({
            include: Course,
            order: [['id', 'ASC']]
        });
        res.render('teachers/index', { teachers: teachers });
    } catch (error) {
        next(error);
    }
}

async function findTeacher(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
        const error = new Error('Некорректный ID преподавателя');
        error.status = 404;
        return next(error);
    }

    try {
        const teacher = await Teacher.findByPk(id, {
            include: Course,
            order: [[Course, 'id', 'ASC']]
        });

        if (!teacher) {
            const error = new Error('Преподаватель не найден');
            error.status = 404;
            return next(error);
        }

        req.teacher = teacher;
        next();
    } catch (error) {
        next(error);
    }
}

function getTeacher(req, res) {
    res.render('teachers/details', { teacher: req.teacher, error: '' });
}

function showCreateForm(req, res) {
    res.render('teachers/create', { teacher: {}, errors: [] });
}

async function addTeacher(req, res, next) {
    const errors = req.errors;
    const data = getTeacherData(req.body);

    if (errors.length > 0) {
        return res.status(400).render('teachers/create', { teacher: data, errors: errors });
    }

    try {
        const sameEmail = await Teacher.findOne({ where: { email: data.email } });
        if (sameEmail) {
            return res.status(409).render('teachers/create', {
                teacher: data,
                errors: ['Преподаватель с таким email уже существует']
            });
        }

        const teacher = await Teacher.create(data);
        logAdminAction(req, 'CREATE', 'Teacher', teacher.id);

        res.redirect('/teachers');
    } catch (error) {
        next(error);
    }
}

function showEditForm(req, res) {
    res.render('teachers/edit', { teacher: req.teacher, errors: [] });
}

async function updateTeacher(req, res, next) {
    const errors = req.errors;
    const data = getTeacherData(req.body);
    data.id = req.teacher.id;

    if (errors.length > 0) {
        return res.status(400).render('teachers/edit', { teacher: data, errors: errors });
    }

    try {
        const sameEmail = await Teacher.findOne({
            where: {
                email: data.email,
                id: { [Op.ne]: req.teacher.id }
            }
        });
        if (sameEmail) {
            return res.status(409).render('teachers/edit', {
                teacher: data,
                errors: ['Этот email уже использует другой преподаватель']
            });
        }

        await req.teacher.update({
            name: data.name,
            email: data.email,
            department: data.department,
            academicDegree: data.academicDegree
        });
        logAdminAction(req, 'UPDATE', 'Teacher', req.teacher.id);

        res.redirect('/teachers/' + req.teacher.id);
    } catch (error) {
        next(error);
    }
}

async function deleteTeacher(req, res, next) {
    try {
        const coursesCount = await Course.count({ where: { teacherId: req.teacher.id } });

        if (coursesCount > 0) {
            return res.status(400).render('teachers/details', {
                teacher: req.teacher,
                error: 'Невозможно удалить преподавателя, у которого есть курсы'
            });
        }

        const id = req.teacher.id;
        await req.teacher.destroy();
        logAdminAction(req, 'DELETE', 'Teacher', id);

        res.redirect('/teachers');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTeachers,
    findTeacher,
    getTeacher,
    showCreateForm,
    addTeacher,
    showEditForm,
    updateTeacher,
    deleteTeacher
};
