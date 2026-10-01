import './account.js';
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginError = document.getElementById('login-error');

const transactionsList = document.getElementById('transactions-list');
const searchInput = document.getElementById('search');

const createButton = document.getElementById('create-button');
const logoutButton = document.getElementById('logout-button');

const transactionModal = document.getElementById('transaction-modal');
const modalClose = document.getElementById('modal-close');

const transactionForm = document.getElementById('transaction-form');
const modalTitle = document.getElementById('modal-title');

const transactionId = document.getElementById('transaction-id');
const amountInput = document.getElementById('amount');
const cpfInput = document.getElementById('cpf');
const statusInput = document.getElementById('status');
const documentInput = document.getElementById('document');

const transactionError = document.getElementById('transaction-error');

const viewModal = document.getElementById('view-modal');
const viewModalClose = document.getElementById('view-modal-close');
const transactionDetails = document.getElementById('transaction-details');

const actionMenu = document.getElementById('action-menu');
const viewAction = document.getElementById('view-action');
const editAction = document.getElementById('edit-action');
const deleteAction = document.getElementById('delete-action');

let transactions = [];
let selectedTransaction = null;


/* =========================
   LOGIN
   ========================= */

loginForm.addEventListener('submit', async function (event) {

    event.preventDefault();

    loginError.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {

        const response = await fetch('/api/login', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginError.textContent =
                data.message || 'E-mail ou senha inválidos.';

            return;
        }

        localStorage.setItem('token', data.token);

        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';

        await loadTransactions();

    } catch (error) {

        console.error(error);

        loginError.textContent =
            'Não foi possível conectar ao servidor.';
    }
});


/* =========================
   CARREGAR TRANSAÇÕES
   ========================= */

async function loadTransactions() {

    const token = localStorage.getItem('token');

    if (!token) {
        return;
    }

    try {

        const response = await fetch('/api/transactions', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {

            logout();

            return;
        }

        if (!response.ok) {
            throw new Error('Erro ao carregar transações.');
        }

        transactions = await response.json();

        renderTransactions();

    } catch (error) {

        console.error(error);

        transactionsList.innerHTML = `
            <div class="empty-state">
                Não foi possível carregar as transações.
            </div>
        `;
    }
}


/* =========================
   MOSTRAR TRANSAÇÕES
   ========================= */

function renderTransactions() {

    const search = searchInput.value.toLowerCase().trim();

    const filtered = transactions.filter(transaction => {

        return (
            String(transaction.amount).toLowerCase().includes(search) ||
            String(transaction.cpf).includes(search) ||
            String(transaction.status).toLowerCase().includes(search)
        );

    });


    if (filtered.length === 0) {

        transactionsList.innerHTML = `
            <div class="empty-state">
                Nenhuma transação encontrada.
            </div>
        `;

        return;
    }


    transactionsList.innerHTML = filtered.map(transaction => {

        const amount = formatCurrency(transaction.amount);

        const date = formatDate(transaction.created_at);

        const statusClass = getStatusClass(transaction.status);

        return `
            <div class="transaction">

                <div class="transaction-info">

                    <strong>
                        ${amount}
                    </strong>

                    <span class="status ${statusClass}">
                        ${transaction.status}
                    </span>

                    <span>
                        ${date}
                    </span>

                </div>

                <button
                    class="more-button"
                    data-id="${transaction.id}"
                >
                    ⋮
                </button>

            </div>
        `;

    }).join('');


    document
        .querySelectorAll('.more-button')
        .forEach(button => {

            button.addEventListener('click', function (event) {

                event.stopPropagation();

                const id = Number(this.dataset.id);

                selectedTransaction =
                    transactions.find(
                        transaction => transaction.id === id
                    );

                openActionMenu(this);

            });

        });
}


/* =========================
   BUSCA
   ========================= */

searchInput.addEventListener('input', function () {

    renderTransactions();

});


/* =========================
   MENU DE AÇÕES
   ========================= */

function openActionMenu(button) {

    const rect = button.getBoundingClientRect();

    actionMenu.style.display = 'block';

    actionMenu.style.top =
        `${rect.bottom + window.scrollY}px`;

    actionMenu.style.left =
        `${rect.left - 120 + window.scrollX}px`;
}


document.addEventListener('click', function () {

    actionMenu.style.display = 'none';

});


actionMenu.addEventListener('click', function (event) {

    event.stopPropagation();

});


/* =========================
   VISUALIZAR
   ========================= */

viewAction.addEventListener('click', function () {

    actionMenu.style.display = 'none';

    if (!selectedTransaction) {
        return;
    }

    const transaction = selectedTransaction;

    transactionDetails.innerHTML = `

        <div class="detail-row">
            <strong>ID:</strong>
            <span>${transaction.id}</span>
        </div>

        <div class="detail-row">
            <strong>Valor:</strong>
            <span>${formatCurrency(transaction.amount)}</span>
        </div>

        <div class="detail-row">
            <strong>CPF:</strong>
            <span>${formatCPF(transaction.cpf)}</span>
        </div>

        <div class="detail-row">
            <strong>Status:</strong>
            <span>${transaction.status}</span>
        </div>

        <div class="detail-row">
            <strong>Usuário:</strong>
            <span>${transaction.user?.name || '-'}</span>
        </div>

        <div class="detail-row">
            <strong>E-mail:</strong>
            <span>${transaction.user?.email || '-'}</span>
        </div>

        <div class="detail-row">
            <strong>Data:</strong>
            <span>${formatDate(transaction.created_at)}</span>
        </div>

        ${
            transaction.document
                ? `
                    <div class="detail-row">
                        <strong>Documento:</strong>

                        <a
                            href="/storage/${transaction.document}"
                            target="_blank"
                        >
                            Ver documento
                        </a>
                    </div>
                `
                : ''
        }

    `;

    viewModal.style.display = 'flex';

});


/* =========================
   EDITAR
   ========================= */

editAction.addEventListener('click', function () {

    actionMenu.style.display = 'none';

    if (!selectedTransaction) {
        return;
    }

    const transaction = selectedTransaction;

    modalTitle.textContent = 'Editar Transação';

    transactionId.value = transaction.id;

    amountInput.value = transaction.amount;

    cpfInput.value = transaction.cpf;

    statusInput.value = transaction.status;

    documentInput.value = '';

    transactionError.textContent = '';

    transactionModal.style.display = 'flex';

});


/* =========================
   CRIAR
   ========================= */

createButton.addEventListener('click', function () {

    modalTitle.textContent = 'Criar Transação';

    transactionForm.reset();

    transactionId.value = '';

    transactionError.textContent = '';

    transactionModal.style.display = 'flex';

});


/* =========================
   SALVAR TRANSAÇÃO
   ========================= */

transactionForm.addEventListener('submit', async function (event) {

    event.preventDefault();

    transactionError.textContent = '';

    const token = localStorage.getItem('token');

    const id = transactionId.value;

    const isEditing = Boolean(id);


    try {

        let response;


        if (isEditing) {

            response = await fetch(
                `/api/transactions/${id}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        amount: amountInput.value,
                        cpf: cpfInput.value,
                        status: statusInput.value
                    })
                }
            );

        } else {

            const formData = new FormData();

            formData.append(
                'amount',
                amountInput.value
            );

            formData.append(
                'cpf',
                cpfInput.value
            );

            formData.append(
                'status',
                statusInput.value
            );


            if (documentInput.files.length > 0) {

                formData.append(
                    'document',
                    documentInput.files[0]
                );

            }


            response = await fetch(
                '/api/transactions',
                {
                    method: 'POST',

                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },

                    body: formData
                }
            );

        }


        const data = await response.json();


        if (!response.ok) {

            if (data.errors) {

                const firstError =
                    Object.values(data.errors)[0];

                transactionError.textContent =
                    firstError[0];

            } else {

                transactionError.textContent =
                    data.message ||
                    'Não foi possível salvar a transação.';

            }

            return;
        }


        transactionModal.style.display = 'none';

        await loadTransactions();

    } catch (error) {

        console.error(error);

        transactionError.textContent =
            'Erro ao conectar com o servidor.';
    }

});


/* =========================
   EXCLUIR
   ========================= */

deleteAction.addEventListener('click', async function () {

    actionMenu.style.display = 'none';

    if (!selectedTransaction) {
        return;
    }


    const confirmed = confirm(
        'Tem certeza que deseja excluir esta transação?'
    );


    if (!confirmed) {
        return;
    }


    const token = localStorage.getItem('token');


    try {

        const response = await fetch(
            `/api/transactions/${selectedTransaction.id}`,
            {
                method: 'DELETE',

                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                'Não foi possível excluir.'
            );

        }


        await loadTransactions();

    } catch (error) {

        console.error(error);

        alert(
            'Não foi possível excluir a transação.'
        );

    }

});


/* =========================
   FECHAR MODAIS
   ========================= */

modalClose.addEventListener('click', function () {

    transactionModal.style.display = 'none';

});


viewModalClose.addEventListener('click', function () {

    viewModal.style.display = 'none';

});


window.addEventListener('click', function (event) {

    if (event.target === transactionModal) {

        transactionModal.style.display = 'none';

    }

    if (event.target === viewModal) {

        viewModal.style.display = 'none';

    }

});


/* =========================
   LOGOUT
   ========================= */

logoutButton.addEventListener('click', function () {

    logout();

});


function logout() {

    const token = localStorage.getItem('token');

    if (token) {
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    localStorage.removeItem('token');

    transactions = [];

    dashboard.style.display = 'none';

    loginScreen.style.display = 'flex';

    loginForm.reset();

    transactionsList.innerHTML = '';

}

/* =========================
   LOGIN AUTOMÁTICO
   ========================= */

window.addEventListener('DOMContentLoaded', async function () {

    const token = localStorage.getItem('token');

    if (!token) {
        return;
    }

    loginScreen.style.display = 'none';

    dashboard.style.display = 'block';

    await loadTransactions();

});


/* =========================
   FUNÇÕES AUXILIARES
   ========================= */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    ).format(value);

}


function formatDate(date) {

    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleString(
        'pt-BR'
    );

}


function formatCPF(cpf) {

    if (!cpf) {
        return '-';
    }

    const value = String(cpf);

    if (value.length !== 11) {
        return value;
    }

    return value.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );

}


function getStatusClass(status) {

    if (status === 'Aprovada') {
        return 'approved';
    }

    if (status === 'Negada') {
        return 'denied';
    }

    return 'processing';

}