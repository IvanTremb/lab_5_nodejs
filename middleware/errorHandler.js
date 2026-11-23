function errorHandler(err, req, res, next) {
    let status = err.status || 500;
    let message = err.message;

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeForeignKeyConstraintError') {
        status = 400;
        message = 'Некорректные данные, запись не сохранена';
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        status = 409;
        message = 'Запись с таким email уже существует';
    }

    if (status >= 500) {
        console.log('Ошибка сервера: ' + err.name + ' - ' + err.message);
        message = 'Не удалось обработать запрос. Попробуйте ещё раз позже.';
        if (err.name && err.name.indexOf('Connection') !== -1) {
            message = 'Нет подключения к базе данных.';
        }
    }

    if (res.headersSent) {
        return next(err);
    }

    if (status === 404) {
        return res.status(404).render('404', { message: message, url: req.originalUrl });
    }

    if (status === 403) {
        return res.status(403).render('403', { message: message });
    }

    res.status(status).render('error', { status: status, message: message });
}

module.exports = errorHandler;
