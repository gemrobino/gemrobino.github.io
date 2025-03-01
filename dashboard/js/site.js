// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
function toggleDropdown() {
    var dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu.style.display === "none") {
        dropdownMenu.style.display = "block";
    } else {
        dropdownMenu.style.display = "none";
    }
}

function setCookie(cookieName, cookieValue, expirationDays) {
    var expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);

    var cookie = encodeURIComponent(cookieName) + "=" + encodeURIComponent(cookieValue) + "; expires=" + expirationDate.toUTCString() + "; path=/";
    document.cookie = cookie;
}

function getCookie(cookieName) {
    // Split document.cookie into individual cookies
    var cookies = document.cookie.split(';');

    // Iterate over the cookies to find the one with the specified name
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Check if the cookie starts with the specified name
        if (cookie.startsWith(cookieName + '=')) {
            // Extract and return the cookie value
            return cookie.substring(cookieName.length + 1);
        }
    }
    // Return null if the cookie with the specified name is not found
    return null;
}

function isNullOrEmpty(str) {
    return (str === null || str === undefined || str === '');
}

function showToast(message, duration = 3000) {
    // Create a toast container element
    var toastContainer = document.createElement('div');
    toastContainer.classList.add('toast-container');

    // Create a toast element
    var toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Append the container to the document body
    document.body.appendChild(toastContainer);

    // Set timeout to remove the toast after specified duration
    setTimeout(function () {
        // Remove the toast container
        toastContainer.parentNode.removeChild(toastContainer);
    }, duration);
}

function performFetch(url, requestBody, handleResponse, customHeaders = {}, fetchMethod = 'POST') {
    // Encode the request body
    const encodedBody = encodeURIComponent(JSON.stringify(requestBody));

    fetch(url, {
        method: fetchMethod,
        headers: {
            'Content-Type': 'application/json', // Default content type
            ...customHeaders // Spread any custom headers provided
        },
        body: encodedBody
    })
    .then(response => {
        // Call the provided lambda function to handle the response
        handleResponse(response);
    })
    .catch(error => {
        // Handle errors here
        console.error('Error:', error);
    });
}

function performFormSubmitByUrl(name, actionUrl) {
    // Create a form element
    var form = document.createElement('form');
    form.method = 'POST'; // Set the method to POST
    form.action = actionUrl + encodeURIComponent(name); // Set the action URL

    // Append the form to the document body
    document.body.appendChild(form);

    // Submit the form
    form.submit();
}

function performFormSubmitByUrl(name, actionUrl, params) {
    // Create a form element
    var form = document.createElement('form');
    form.method = 'POST'; // Set the method to POST
    form.action = actionUrl + encodeURIComponent(name); // Set the action URL

    // Add the parameters as hidden input fields
    if (params) {
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = key;
                hiddenField.value = params[key];
                form.appendChild(hiddenField);
            }
        }
    }

    // Append the form to the document body
    document.body.appendChild(form);

    // Submit the form
    form.submit();
}



