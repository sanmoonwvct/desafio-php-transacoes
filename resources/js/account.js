const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');

const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');

const profileButton = document.getElementById('profile-button');
const profileModal = document.getElementById('profile-modal');
const profileModalClose = document.getElementById('profile-modal-close');
const profileForm = document.getElementById('profile-form');
const profileError = document.getElementById('profile-error');
const profileSuccess = document.getElementById('profile-success');

const openDeleteModal = document.getElementById('open-delete-modal');
const deleteModal = document.getElementById('delete-account-modal');
const deleteModalClose = document.getElementById('delete-modal-close');
const cancelDelete = document.getElementById('cancel-delete');
const deleteForm = document.getElementById('delete-account-form');
const deleteError = document.getElementById('delete-error');


function getErrorMessage(data, fallback) {

    if (data.errors) {
        const campos = Object.keys(data.errors);
        const primeiro = campos[0];
        return data.errors[primeiro][0];
    }

    if (data.message) {
        return data.message;
    }

    return fallback;
}


function authHeaders() {

    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}


/* =========================
   TROCAR LOGIN <-> CRIAR CONTA
   ========================= */

showRegisterLink.addEventListener('click', function (event) {

    event.preventDefault();

    loginScreen.style.display = 'none';
    registerScreen.style.display = 'flex';

});

showLoginLink.addEventListener('click', function (event) {

    event.preventDefault();

    registerScreen.style.display = 'none';
    loginScreen.style.display = 'flex';

});


/* =========================
   CRIAR CONTA
   ========================= */

registerForm.addEventListener('submit', async function (event) {

    event.preventDefault();

    registerError.textContent = '';

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;

    try {

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirm
            })
        });

        const data = await response.json();

        if (!response.ok) {
            registerError.textContent = getErrorMessage(data, 'Não foi possível criar a conta.');
            return;
        }

        localStorage.setItem('token', data.token);

        window.location.reload();

    } catch (error) {

        console.error(error);

        registerError.textContent = 'Não foi possível conectar ao servidor.';
    }
});


/* =========================
   PERFIL
   ========================= */

profileButton.addEventListener('click', async function () {

    profileError.textContent = '';
    profileSuccess.textContent = '';

    document.getElementById('profile-password').value = '';
    document.getElementById('profile-password-confirm').value = '';

    try {

        const response = await fetch('/api/profile', {
            headers: authHeaders()
        });

        const user = await response.json();

        if (!response.ok) {
            profileError.textContent = 'Não foi possível carregar o perfil.';
        } else {
            document.getElementById('profile-name').value = user.name;
            document.getElementById('profile-email').value = user.email;
        }

        profileModal.style.display = 'flex';

    } catch (error) {

        console.error(error);
    }
});

profileModalClose.addEventListener('click', function () {

    profileModal.style.display = 'none';

});

profileForm.addEventListener('submit', async function (event) {

    event.preventDefault();

    profileError.textContent = '';
    profileSuccess.textContent = '';

    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const password = document.getElementById('profile-password').value;
    const passwordConfirm = document.getElementById('profile-password-confirm').value;

    try {

        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirm
            })
        });

        const data = await response.json();

        if (!response.ok) {
            profileError.textContent = getErrorMessage(data, 'Não foi possível salvar.');
            return;
        }

        profileSuccess.textContent = 'Perfil atualizado com sucesso.';

        document.getElementById('profile-password').value = '';
        document.getElementById('profile-password-confirm').value = '';

    } catch (error) {

        console.error(error);

        profileError.textContent = 'Não foi possível conectar ao servidor.';
    }
});


/* =========================
   EXCLUIR CONTA
   ========================= */

openDeleteModal.addEventListener('click', function () {

    deleteError.textContent = '';
    document.getElementById('delete-password').value = '';

    profileModal.style.display = 'none';
    deleteModal.style.display = 'flex';

});

deleteModalClose.addEventListener('click', function () {

    deleteModal.style.display = 'none';

});

cancelDelete.addEventListener('click', function () {

    deleteModal.style.display = 'none';

});

deleteForm.addEventListener('submit', async function (event) {

    event.preventDefault();

    deleteError.textContent = '';

    const password = document.getElementById('delete-password').value;

    try {

        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: authHeaders(),
            body: JSON.stringify({
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            deleteError.textContent = getErrorMessage(data, 'Não foi possível excluir a conta.');
            return;
        }

        localStorage.removeItem('token');

        window.location.reload();

    } catch (error) {

        console.error(error);

        deleteError.textContent = 'Não foi possível conectar ao servidor.';
    }
});