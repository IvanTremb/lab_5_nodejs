const sequelize = require('../config/database');
const Teacher = require('./Teacher');
const Course = require('./Course');
const User = require('./User');

Teacher.hasMany(Course, {
    foreignKey: 'teacherId'
});

Course.belongsTo(Teacher, {
    foreignKey: 'teacherId'
});

async function addStartData() {
    const teachersCount = await Teacher.count();
    const coursesCount = await Course.count();

    if (teachersCount > 0 || coursesCount > 0) {
        return;
    }

    const ivanov = await Teacher.create({
        name: 'Ivan Ivanov',
        email: 'ivanov@example.com',
        department: 'Informatics',
        academicDegree: 'Doctor'
    });
    const popescu = await Teacher.create({
        name: 'Maria Popescu',
        email: 'popescu@example.com',
        department: 'Informatics',
        academicDegree: 'Master'
    });
    const rusu = await Teacher.create({
        name: 'Andrei Rusu',
        email: 'rusu@example.com',
        department: 'Software Engineering',
        academicDegree: 'Doctor'
    });
    await Teacher.create({
        name: 'Elena Ciobanu',
        email: 'ciobanu@example.com',
        department: 'Computer Networks',
        academicDegree: 'Master'
    });

    await Course.create({
        title: 'Server-side Programming',
        credits: 5,
        semester: 1,
        description: 'Разработка серверных приложений с использованием Node.js и Express.',
        teacherId: ivanov.id
    });
    await Course.create({
        title: 'Database Management Systems',
        credits: 6,
        semester: 2,
        description: 'Проектирование баз данных и написание SQL-запросов.',
        teacherId: popescu.id
    });
    await Course.create({
        title: 'Web Development',
        credits: 5,
        semester: 1,
        description: 'Создание веб-страниц с помощью HTML, CSS и JavaScript.',
        teacherId: rusu.id
    });
    await Course.create({
        title: 'Data Structures and Algorithms',
        credits: 6,
        semester: 3,
        description: 'Изучение структур данных, алгоритмов поиска и сортировки.',
        teacherId: ivanov.id
    });
    await Course.create({
        title: 'Node.js Advanced',
        credits: 4,
        semester: 4,
        description: 'Работа с базами данных, Sequelize и PostgreSQL в Node.js.',
        teacherId: ivanov.id
    });

    console.log('Добавлены начальные данные');
}

module.exports = {
    sequelize,
    Teacher,
    Course,
    User,
    addStartData
};
