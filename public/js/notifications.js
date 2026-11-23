const socket = io();
const list = document.getElementById('notifications-list');
const emptyText = document.getElementById('notifications-empty');

function updateEmptyText() {
    if (list.children.length === 0) {
        emptyText.style.display = 'block';
    } else {
        emptyText.style.display = 'none';
    }
}

function removeNotification(item) {
    if (item.parentNode) {
        item.remove();
        updateEmptyText();
    }
}

socket.on('courseCreated', function (data) {
    const item = document.createElement('div');
    item.className = 'notification';

    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.title = 'Закрыть';
    closeButton.addEventListener('click', function () {
        removeNotification(item);
    });

    const title = document.createElement('p');
    title.textContent = 'Добавлен новый курс: ' + data.title;

    const teacher = document.createElement('p');
    teacher.textContent = 'Преподаватель: ' + data.teacherName;

    const time = document.createElement('small');
    time.textContent = new Date(data.time).toLocaleString('ru-RU');

    item.appendChild(closeButton);
    item.appendChild(title);
    item.appendChild(teacher);
    item.appendChild(time);
    list.prepend(item);
    updateEmptyText();

    setTimeout(function () {
        removeNotification(item);
    }, 10000);
});
