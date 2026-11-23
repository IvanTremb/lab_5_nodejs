const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return day + '.' + month + '.' + date.getFullYear() + ' ' + hours + ':' + minutes;
}

const logsFolder = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsFolder)) {
    fs.mkdirSync(logsFolder);
}

const logFile = fs.createWriteStream(path.join(logsFolder, 'requests.log'), { flags: 'a' });

morgan.token('datetime', function () {
    return formatDate(new Date());
});

const consoleLogger = morgan('dev');
const fileLogger = morgan(':method :url | :status | :response-time[0] ms | :datetime', { stream: logFile });

function logAdminAction(req, action, objectType, id) {
    const email = req.session.user.email;
    const text = action + ' ' + objectType.toUpperCase();
    console.log(`ADMIN ACTION | ${email} | ${text} | ${objectType} ID: ${id} | ${formatDate(new Date())}`);
}

module.exports = {
    consoleLogger,
    fileLogger,
    logAdminAction
};
