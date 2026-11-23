const { body, validationResult } = require('express-validator');

function saveErrors(req, res, next) {
    const result = validationResult(req);
    req.errors = result.array({ onlyFirstError: true }).map(function (error) {
        return error.msg;
    });
    next();
}

const registerRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Введите имя')
        .bail()
        .isLength({ min: 2 }).withMessage('Имя должно содержать минимум два символа'),
    body('email')
        .trim()
        .notEmpty().withMessage('Введите email')
        .bail()
        .isEmail().withMessage('Email имеет некоректный формат')
        .bail()
        .toLowerCase(),
    body('password')
        .notEmpty().withMessage('Введите пароль')
        .bail()
        .isLength({ min: 6 }).withMessage('Пароль должен содержать минимум шесть символов'),
    body('confirmPassword')
        .notEmpty().withMessage('Подтвердите пароль')
        .bail()
        .custom(function (value, { req }) {
            return value === req.body.password;
        }).withMessage('Пароли не совпадают'),
    saveErrors
];

const loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Введите email')
        .bail()
        .isEmail().withMessage('Email имеет некоректный формат')
        .bail()
        .toLowerCase(),
    body('password')
        .notEmpty().withMessage('Введите пароль'),
    saveErrors
];

const teacherRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Введите имя преподавателя')
        .bail()
        .isLength({ min: 2 }).withMessage('Имя преподавателя должно содержать минимум два символа'),
    body('email')
        .trim()
        .notEmpty().withMessage('Введите email')
        .bail()
        .isEmail().withMessage('Email имеет некоректный формат')
        .bail()
        .toLowerCase(),
    body('department')
        .trim()
        .notEmpty().withMessage('Укажите кафедру'),
    body('academicDegree')
        .trim()
        .notEmpty().withMessage('Укажите учёную степень'),
    saveErrors
];

const courseRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Введите название курса'),
    body('credits')
        .trim()
        .notEmpty().withMessage('Введите количество кредитов')
        .bail()
        .isInt({ min: 1, max: 30 }).withMessage('Количество кредитов должно быть целым числом от 1 до 30')
        .bail()
        .toInt(),
    body('semester')
        .trim()
        .notEmpty().withMessage('Введите семестр')
        .bail()
        .isInt({ min: 1, max: 8 }).withMessage('Семестр должен быть от 1 до 8')
        .bail()
        .toInt(),
    body('description')
        .trim()
        .notEmpty().withMessage('Введите описание курса'),
    body('teacherId')
        .trim()
        .notEmpty().withMessage('Выберите преподавателя из списка')
        .bail()
        .isInt({ min: 1, max: 2147483647 }).withMessage('Выберите преподавателя из списка')
        .bail()
        .toInt(),
    saveErrors
];

module.exports = {
    registerRules,
    loginRules,
    teacherRules,
    courseRules
};
