# Desafio PHP — Gestão de Transações (Laravel multi-tenant)

Sistema de gestão de transações financeiras com **multi-tenancy por domínio**. Cada tenant tem o próprio banco de dados, e dentro dele cada usuário enxerga e gerencia somente as próprias transações.

## Funcionalidades

- Criar conta, entrar e sair (logout revoga o token no servidor)
- Perfil do usuário: editar nome, e-mail e senha
- Exclusão de conta, com confirmação por senha
- CRUD de transações (valor, CPF, status e documento anexo em PDF/JPG/PNG de até 5 MB)
- Busca na lista de transações
- Isolamento entre tenants (um banco por tenant) e entre usuários (cada um só acessa as próprias transações)

## Tecnologias

- PHP 8.3+ e Laravel 13
- [stancl/tenancy](https://tenancyforlaravel.com) 3.x (multi-tenancy com banco separado por tenant, identificação por domínio)
- Laravel Sanctum (autenticação por token)
- SQLite
- Vite e Tailwind (front-end em HTML, CSS e JS puro, servido pela view `welcome.blade.php`)

## Requisitos

- PHP 8.3 ou superior (com a extensão `sqlite`/`pdo_sqlite` habilitada)
- Composer
- Node.js e npm

## Como rodar

### 1. Instalar as dependências

```bash
composer install
npm install
```

### 2. Configurar o ambiente

```bash
cp .env.example .env
php artisan key:generate
```

No Windows (PowerShell), no lugar do `cp`:

```powershell
Copy-Item .env.example .env
```

Confira no `.env` que o banco é SQLite:

```
DB_CONNECTION=sqlite
```

### 3. Criar o banco central e rodar as migrations

Crie o arquivo do banco central:

```bash
touch database/database.sqlite
```

No Windows (PowerShell):

```powershell
New-Item database\database.sqlite -ItemType File
```

Depois:

```bash
php artisan migrate
```

### 4. Criar os tenants

O banco de cada tenant é criado e migrado automaticamente quando o tenant é criado. Abra o tinker:

```bash
php artisan tinker
```

E rode:

```php
$tenant1 = App\Models\Tenant::create();
$tenant1->domains()->create(['domain' => 'tenant1.localhost']);

$tenant2 = App\Models\Tenant::create();
$tenant2->domains()->create(['domain' => 'tenant2.localhost']);
```

Saia do tinker com `exit`. Para conferir:

```bash
php artisan tenants:list
```

### 5. Criar o usuário admin de cada tenant (opcional)

O seeder cria um usuário de teste em cada tenant:

```bash
php artisan tenants:seed
```

Os logins ficam assim, onde `XXXX` são os 4 primeiros caracteres do id do tenant (aparece no `tenants:list`):

- E-mail: `admin-XXXX@teste.com`
- Senha: `password`

Se preferir, pule este passo e use a tela **Criar conta**.

### 6. Compilar o front-end e subir o servidor

```bash
npm run build
php artisan serve
```

(Para desenvolvimento, use `npm run dev` em vez de `npm run build`, num terminal separado.)

### 7. Acessar

Abra pelo **domínio do tenant**, e não por `localhost` puro:

- http://tenant1.localhost:8000
- http://tenant2.localhost:8000

> `localhost` e `127.0.0.1` são domínios centrais da aplicação: neles a API fica bloqueada de propósito, e só os domínios dos tenants funcionam. Os navegadores modernos resolvem `*.localhost` para `127.0.0.1` automaticamente. Se o seu não resolver, adicione `127.0.0.1 tenant1.localhost` e `127.0.0.1 tenant2.localhost` ao arquivo `hosts`.

## Como funciona o multi-tenancy

- Cada tenant tem um domínio. O middleware `InitializeTenancyByDomain` identifica o tenant pelo domínio da requisição e troca a conexão para o banco dele.
- Os usuários, as transações e os tokens ficam dentro do banco do tenant (migrations em `database/migrations/tenant`).
- As rotas da aplicação ficam em `routes/tenant.php`, com `PreventAccessFromCentralDomains` para impedir o acesso pelos domínios centrais.
- Uma conta criada no `tenant1` não existe no `tenant2`.

## Endpoints da API

Todas as rotas ficam sob o prefixo `/api` do domínio do tenant.

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/register` | não | Cria a conta e devolve o token |
| POST | `/api/login` | não | Faz login e devolve o token |
| POST | `/api/logout` | sim | Revoga o token atual |
| GET | `/api/profile` | sim | Dados do usuário logado |
| PUT | `/api/profile` | sim | Atualiza nome, e-mail e (opcionalmente) a senha |
| DELETE | `/api/profile` | sim | Exclui a conta (exige a senha) |
| GET | `/api/transactions` | sim | Lista as transações do usuário |
| POST | `/api/transactions` | sim | Cria uma transação |
| GET | `/api/transactions/{id}` | sim | Detalha uma transação |
| PUT | `/api/transactions/{id}` | sim | Atualiza uma transação |
| DELETE | `/api/transactions/{id}` | sim | Exclui uma transação |

As rotas autenticadas usam o header `Authorization: Bearer {token}`.

## Decisões de projeto

- **Autenticação por token (Sanctum):** o front consome a API por `fetch` com token Bearer, sem depender de sessão.
- **Isolamento por usuário:** todas as consultas de transações partem da relação `$request->user()->transactions()`, então um usuário nunca acessa a transação de outro, mesmo mudando o id na URL.
- **Exclusão de conta:** exige a senha do usuário, revoga todos os tokens e apaga a conta. As transações do usuário são removidas junto, pois a chave estrangeira usa `cascadeOnDelete`.
- **Transações com `SoftDeletes`:** excluir uma transação é uma exclusão lógica.

## Observações

- Os arquivos de banco (`database/database.sqlite` e os `database/tenant*`) e o `.env` não são versionados. Cada ambiente cria os seus seguindo os passos acima.
- Os documentos anexados ficam no disco `public`. Para servir os arquivos pelo navegador, rode `php artisan storage:link`.
