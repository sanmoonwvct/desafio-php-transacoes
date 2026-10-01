<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Gestão de Transações</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body>

    <!-- LOGIN -->
    <div id="login-screen" class="login-screen">

        <div class="login-card">

            <div class="login-logo">Q</div>

            <h1>Entrar</h1>

            <p>Acesse sua conta para continuar</p>

            <form id="login-form">

                <div class="form-group">
                    <label for="email">E-mail</label>

                    <input
                        type="email"
                        id="email"
                        placeholder="Digite seu e-mail"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="password">Senha</label>

                    <input
                        type="password"
                        id="password"
                        placeholder="Digite sua senha"
                        required
                    >
                </div>

                <button type="submit" class="login-button">
                    Entrar
                </button>

                <p id="login-error" class="login-error"></p>

            </form>

        </div>

    </div>


    <!-- SISTEMA -->
    <div id="dashboard" class="dashboard">

        <!-- TOPO -->
        <header class="topbar">

            <div class="logo">Q</div>

            <button
                id="create-button"
                class="btn-criar"
            >
                Criar Transação
            </button>

            <button
                id="logout-button"
                class="logout-button"
            >
                Sair
            </button>

        </header>


        <!-- MENU LATERAL -->
        <aside class="sidebar">

            <div class="sidebar-item">
                Transação
            </div>

        </aside>


        <!-- CONTEÚDO -->
        <main class="content">

            <h1>Transações</h1>

            <section class="transactions-card">

                <div class="search-box">

                    <input
                        type="text"
                        id="search"
                        placeholder="Buscar..."
                    >

                    <span>⌕</span>

                </div>

                <div
                    id="transactions-list"
                    class="transactions-list"
                ></div>

            </section>

        </main>

    </div>


    <!-- MODAL CRIAR / EDITAR -->
    <div id="transaction-modal" class="modal">

        <div class="modal-content">

            <button
                class="modal-close"
                id="modal-close"
            >
                ×
            </button>

            <h2 id="modal-title">
                Criar Transação
            </h2>

            <form id="transaction-form">

                <input
                    type="hidden"
                    id="transaction-id"
                >

                <div class="form-group">

                    <label for="amount">
                        Valor
                    </label>

                    <input
                        type="number"
                        id="amount"
                        step="0.01"
                        min="0"
                        placeholder="Ex.: 350.00"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="cpf">
                        CPF
                    </label>

                    <input
                        type="text"
                        id="cpf"
                        maxlength="11"
                        placeholder="Somente números"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="status">
                        Status
                    </label>

                    <select id="status" required>

                        <option value="Em processamento">
                            Em processamento
                        </option>

                        <option value="Aprovada">
                            Aprovada
                        </option>

                        <option value="Negada">
                            Negada
                        </option>

                    </select>

                </div>


                <div
                    class="form-group"
                    id="document-group"
                >

                    <label for="document">
                        Documento
                    </label>

                    <input
                        type="file"
                        id="document"
                        accept=".pdf,.jpg,.jpeg,.png"
                    >

                    <small>
                        PDF, JPG, JPEG ou PNG — máximo 5 MB
                    </small>

                </div>


                <p
                    id="transaction-error"
                    class="form-error"
                ></p>


                <button
                    type="submit"
                    class="submit-button"
                >
                    Salvar Transação
                </button>

            </form>

        </div>

    </div>


    <!-- MODAL VISUALIZAÇÃO -->
    <div id="view-modal" class="modal">

        <div class="modal-content">

            <button
                class="modal-close"
                id="view-modal-close"
            >
                ×
            </button>

            <h2>Detalhes da Transação</h2>

            <div id="transaction-details"></div>

        </div>

    </div>


    <!-- MENU DE AÇÕES -->
    <div
        id="action-menu"
        class="action-menu"
    >
        <button id="view-action">
            👁 Ver
        </button>

        <button id="edit-action">
            ✏ Editar
        </button>

        <button id="delete-action">
            🗑 Excluir
        </button>
    </div>

</body>
</html>