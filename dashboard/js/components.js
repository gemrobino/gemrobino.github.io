function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
}

function openGroupForm(name) {
    let modalId = 'createGroupForm'
    openModal(modalId)
    document.getElementById('parent').value = name;
}

function toggleShowPassword(inputName, passwordIcon) {
    var passwordField = document.getElementById(inputName);
    var icon = document.getElementById(passwordIcon);

    // Toggle the type attribute
    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    }
};