// Notification helper functions
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
}
