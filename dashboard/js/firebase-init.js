var firebaseConfig = {
    apiKey: "AIzaSyAGfjO26gyrV23CDUG3dfE7uAGyWQCWsok",
    authDomain: "titanpushnotification-a9c5c.firebaseapp.com",
    projectId: "titanpushnotification-a9c5c",
    storageBucket: "titanpushnotification-a9c5c.appspot.com",
    messagingSenderId: "101025538615",
    appId: "1:101025538615:web:752b28dc3da684d7f095b2"
};

var vapidKeyFirebase = "BI7EkofhYZJsvArXqjNFvfWCQ_qZO25YIIQTcxHfHHWLCr3z6ydnPtHugiK6JxdyksCzpmj5yhq9jc7Bp6SgL08";

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

function requestPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            // Retrieve the registration token
            messaging.getToken({ vapidKey: vapidKeyFirebase }).then((currentToken) => {
                if (currentToken) {
                    sendTokenToServer(currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
            });
        } else {
            console.log('Notification permission denied.');
        }
    }).catch((err) => {
        console.error('Error occurred while requesting notification permission:', err);
    });
}

function sendTokenToServer(token) {
    fetch('/Message/SubscribeToTopic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(token) 
    })
        .then(response => response.json())
        .then(data => {
            console.log('Token sent to server and subscribed to topic:', data);
        })
        .catch((error) => {
            console.error('Error sending token to server:', error);
        });
}


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
            requestPermission();
        })
        .catch((err) => {
            console.error('Service Worker registration failed:', err);
        });
} else {
    console.error('Service Workers are not supported in this browser.');
}


messaging.onMessage((payload) => {
    showToast(payload.notification.title, payload.notification.body, 'bi bi-exclamation-circle-fill')
});


function showToast(title, message, iconClass) {
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="width: 300px; padding: 0;">
            <div class="toast-header" style="background-color: #0C8282; color: white; border-bottom: 1px solid #0A9C9C; border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem;">
                <i class="${iconClass}" style="font-size: 1.25rem; margin-right: 0.75rem;"></i>
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body" style="color: black; background-color: #ffffff; border: 1px solid #76CED9; border-top: none; border-bottom-left-radius: 0.25rem; border-bottom-right-radius: 0.25rem;">
                ${message}
            </div>
        </div>
    `;
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; bottom: 40px !important; right: 30px !important; width: 100%; justify-content: end;display: inline-grid';
        document.body.appendChild(toastContainer);
    }
    toastContainer.innerHTML += toastHTML;
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        delay: 5000 
    });
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}


