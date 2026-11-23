require('dotenv').config();

const express = require('express');
const path = require('path');
const http = require('http');
const session = require('express-session');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const { consoleLogger, fileLogger } = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { sequelize, addStartData } = require('./models');

if (!process.env.SESSION_SECRET) {
    console.log('В файле .env не указан SESSION_SECRET');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('io', io);

app.use(consoleLogger);
app.use(fileLogger);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true
    }
}));

app.use((req, res, next) => {
    if (!req.body) {
        req.body = {};
    }
    res.locals.currentUser = req.session.user || null;
    res.locals.isAdmin = Boolean(req.session.user && req.session.user.role === 'admin');
    next();
});

app.use(authRoutes);
app.use(courseRoutes);
app.use(teacherRoutes);

app.use(notFound);
app.use(errorHandler);

io.on('connection', socket => {
    console.log('WebSocket: клиент подключился (' + socket.id + ')');

    socket.on('disconnect', () => {
        console.log('WebSocket: клиент отключился (' + socket.id + ')');
    });
});

async function start() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');

        await sequelize.sync();
        await addStartData();
    } catch (err) {
        console.log('Не удалось подключиться к базе данных PostgreSQL');
        console.log('Проверьте что сервер PostgreSQL запущен и данные в файле .env правильные');
        console.log('Текст ошибки: ' + (err.message || err.name));
    }

    server.listen(PORT, () => {
        console.log('Server is running at http://localhost:' + PORT);
    });

    server.on('error', err => {
        console.log('Не удалось запустить сервер: ' + err.message);
    });
}

start();
