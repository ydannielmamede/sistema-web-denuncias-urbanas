# Plano: Cadastro/Login pelo Google na tela de login

**Branch:** `daniel-google-auth`
**Objetivo:** Fazer o botão "Google" do template `usuario/templates/usuario/login.html` autenticar e cadastrar usuários reais via OAuth, usando `django-allauth` (já instalado no `.venv` na versão `65.18.0`).

---

## Diagnóstico (estado atual)

| Camada | Status | Observação |
| --- | --- | --- |
| `django-allauth` no venv | ✅ | `65.18.0`, **mas ausente em `requirements.txt`** |
| `requirements.txt` | ❌ | Não fixa `django-allauth` |
| `INSTALLED_APPS` (`config/settings.py`) | ❌ | Sem `sites`, `allauth`, `allauth.account`, `allauth.socialaccount` |
| `MIDDLEWARE` | ❌ | Sem `allauth.account.middleware.AccountMiddleware` |
| `SITE_ID`, `AUTHENTICATION_BACKENDS`, `SOCIALACCOUNT_PROVIDERS` | ❌ | Inexistentes no `settings.py` |
| `config/urls.py` | ❌ | Sem `path("accounts/", include("allauth.urls"))` |
| `usuario/adapter.py` | ❌ | Não existe — necessário para `cpf`/`telefone` (ainda `null=False`) |
| Botões Google/GitHub no `login.html` | ⚠️ | `<button>` estático, sem `href`/`formaction` |
| `.env` | ⚠️ | Tem `GOOGLE_CLIENT_ID`/`SECRET`, mas `.env.example` está desatualizado |
| Banco (MySQL/SQLite) | ❌ | Sem tabelas `account_*`, `socialaccount_*`, `django_site` |
| `LOGIN_URL` no `settings.py` | ⚠️ | Define `"login"` (string simples) — não `"usuario:login"`; revisar ao plugar allauth |

**Conclusão:** o template engana — visualmente há botões Google/GitHub, mas nenhum deles dispara OAuth. O pacote está no venv mas não foi conectado. Tudo abaixo é para fechar esse gap.

---

## Arquivos que serão tocados

```
requirements.txt
.env.example
config/settings.py
config/urls.py
usuario/adapter.py                                (novo)
usuario/templates/usuario/login.html
templates/socialaccount/authentication_error.html  (novo — opcional)
```

---

## Etapas

### 1. Fixar dependência

**`requirements.txt`** — adicionar em ordem alfabética:
```
django-allauth==65.18.0
```
Depois rodar `pip install -r requirements.txt` (ou `uv pip sync`) no venv local.

---

### 2. Atualizar `.env.example`

Adicionar (o `.env` real já tem):
```
# Login social (django-allauth). Preencha com as chaves obtidas no Google Cloud Console.
# Redirect URI a cadastrar no console do Google (dev): http://localhost:8000/accounts/google/login/callback/
# Em produção: https://<seu-dominio>/accounts/google/login/callback/
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# SITE_DOMAIN é usado pelo allauth para montar URLs absolutas em callbacks.
SITE_DOMAIN=localhost:8000
```

> Deixar `GITHUB_*` de fora por enquanto — escopo deste plano é só Google.

---

### 3. `config/settings.py`

#### 3.1 `INSTALLED_APPS` (atual)
Adicionar (em qualquer posição, mas convencionalmente após `django.contrib.auth`):
```python
"django.contrib.sites",
"allauth",
"allauth.account",
"allauth.socialaccount",
```

#### 3.2 `MIDDLEWARE` (atual)
Adicionar (após `SessionMiddleware`):
```python
"allauth.account.middleware.AccountMiddleware",
```

#### 3.3 Bloco novo de configuração allauth (sugiro colocar logo após `AUTH_USER_MODEL`)

```python
# --- django-allauth ---
SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# Social
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": config("GOOGLE_CLIENT_ID", default=""),
            "secret": config("GOOGLE_CLIENT_SECRET", default=""),
            "key": "",
        },
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
        "VERIFIED_EMAIL": True,  # se o Google já marcou o e-mail como verificado, confia
    },
}

# Account
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_USER_MODEL_USERNAME_FIELD = "username"  # ainda exigimos username no AbstractUser
ACCOUNT_EMAIL_VERIFICATION = "none"            # OAuth: pulamos verificação
ACCOUNT_ADAPTER = "usuario.adapter.CustomAccountAdapter"
SOCIALACCOUNT_ADAPTER = "usuario.adapter.CustomSocialAccountAdapter"

# (já existem)
LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "dashboard"
LOGOUT_REDIRECT_URL = "index"
```

> **Por que `CustomSocialAccountAdapter`:** o model `Usuario` ainda tem `cpf` e `telefone` como `null=False` (apesar da nota na memory). O fluxo `populate_user` do allauth não envia esses campos — sem o adapter, o `save()` vai quebrar com `IntegrityError`. O adapter gera placeholders (`cpf=f"google-{sociallogin.user.pk}"` e `telefone="0000000000"`) só para o insert não falhar. **Atividade 6.2 abaixo** é a definitiva (tornar esses campos opcionais no model).

> **Por que `ACCOUNT_USERNAME_REQUIRED = False`:** allauth ≥0.61 não precisa de username; o nosso model continua aceitando porque `AbstractUser.username` é o campo de auth. Para o fluxo de login com **e-mail/senha tradicional**, a `login_usuario` view passa `username=email` no `authenticate()` — manteremos compatível.

#### 3.4 (opcional, saneamento) `LOGIN_URL`
Hoje: `LOGIN_URL = "login"`. Strings curtas só funcionam com `app_name` registrado no root. Se algum teste der `NoReverseMatch` ao plugar allauth, mudar para:
```python
LOGIN_URL = "usuario:login"
```

---

### 4. `config/urls.py`

Adicionar (em qualquer ponto do `urlpatterns`):
```python
path("accounts/", include("allauth.urls")),
```

> O allauth expõe `/accounts/google/login/`, `/accounts/google/login/callback/`, `/accounts/logout/`, etc. Vamos usar a URL direta no template (`/accounts/google/login/`) — não precisamos de view custom.

---

### 5. `usuario/adapter.py` (novo)

```python
"""
Adapters do django-allauth para o model custom Usuario.

- CustomAccountAdapter: hooks no fluxo de signup por e-mail/senha
  (account/signup). Mantém o que a view cadastrar_usuario já faz,
  mas exposto ao allauth caso ele seja usado no futuro.

- CustomSocialAccountAdapter: no fluxo de login social, popula
  cpf/telefone com placeholders porque o model exige (null=False).
  Os valores podem ser editados depois em um fluxo de "completar
  perfil" (não escopo deste plano).
"""
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):
    pass


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        # username é o email (mesmo padrão do cadastro tradicional)
        if not user.username and user.email:
            user.username = user.email

        # Placeholders — null=False em Usuario.cpf/telefone exige valores
        user.cpf = user.cpf or f"google-{sociallogin.account.uid[:8]}"
        user.telefone = user.telefone or "00000000000"
        return user

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form=form)
        return user
```

> **Sobre `usuario_id` no placeholder do CPF:** se o CPF for `unique=True` e a migration já foi aplicada, dois logins do Google diferentes com mesmo `uid[:8]` colidiriam — improvável (8 hex chars), mas a Etapa 6.2 corrige isso de vez.

---

### 6. Banco de dados

#### 6.1 Rodar migrations
```bash
python manage.py migrate
```
Isso cria as tabelas `account_*`, `socialaccount_socialaccount*`, `socialaccount_socialapp*`, `django_site`.

#### 6.2 (Recomendada) Afrouxar `Usuario.cpf` e `Usuario.telefone` no model

Arquivo `usuario/models.py`:
```python
cpf = models.CharField(max_length=14, null=True, blank=True, unique=True, db_column="Cpf")
telefone = models.CharField(max_length=20, null=True, blank=True, db_column="Telefone")
```
Depois:
```bash
python manage.py makemigrations usuario
python manage.py migrate
```

> Esse é o **passo de saneamento real**. Sem ele, cada login Google que cair em um novo usuário vai depender do adapter gerar um CPF único válido (o que pode falhar em edge cases de retries). A memory do projeto registra essa mesma decisão em 2026-06-30 como pendente — este plano aplica.

> **Atenção:** com `cpf` opcional, a view `cadastrar_usuario` continua exigindo CPF no cadastro tradicional (linha 33 de `views.py`: `if not all([nome, email, cpf, telefone, nascimento, senha])`). Não há regressão. A coluna `unique=True` com `null=True` permite múltiplos `NULL` no MySQL/SQLite (sem `IntegrityError`).

---

### 7. Template `usuario/templates/usuario/login.html`

Substituir o bloco das linhas 99-108:

```html
<div class="social-login">
  <a href="{% url 'socialaccount_begin' 'google' %}" class="social-btn google-btn">
    <span class="social-icon google-icon"></span>
    Google
  </a>
  <button type="button" class="social-btn github-btn" disabled aria-disabled="true" title="Em breve">
    <span class="social-icon github-icon"></span>
    GitHub
  </button>
</div>
```

> O `socialaccount_begin` é a URL name que o allauth expõe via `include("allauth.urls")`. Carrega o template tag no topo do arquivo (junto com `{% load static %}`):
```html
{% load socialaccount %}
```

> O botão GitHub fica `disabled` para não confundir — fora do escopo deste plano.

---

### 8. Configurar SocialApp no admin (após o `migrate`)

Tem **duas** formas — escolha **uma**:

**Opção A (recomendada):** via Django admin
1. `python manage.py createsuperuser` (se não houver)
2. `python manage.py runserver`
3. Acessar `/admin/` → **Sites** → garantir que o `example.com` existente está com `Domain name = localhost:8000` (ou o domínio Railway) e `Display name = Denúncias Urbanas`
4. Acessar `/admin/socialaccount/socialapp/` → **Add social application**:
   - Provider: `Google`
   - Name: `Google`
   - Client id: `GOOGLE_CLIENT_ID`
   - Secret key: `GOOGLE_CLIENT_SECRET`
   - Sites: adicionar o site configurado acima

**Opção B (programática, repetível):** criar management command que popula a `SocialApp` lendo do `.env`. Útil se o ambiente do Railway for efêmero (mas o plano do Railway tem volume persistente, então Opção A serve).

> **Nota Railway:** adicionar as env vars `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no painel do Railway. Atualizar o `SITE_DOMAIN` para o domínio público (`*.railway.app` ou domínio custom).

---

### 9. Configurar credenciais no Google Cloud Console

1. Acessar https://console.cloud.google.com → APIs & Services → Credentials
2. Criar OAuth Client ID (tipo: Web application)
3. **Authorized JavaScript origins:**
   - `http://localhost:8000` (dev)
   - `https://<seu-app>.up.railway.app` (prod)
4. **Authorized redirect URIs:**
   - `http://localhost:8000/accounts/google/login/callback/`
   - `https://<seu-app>.up.railway.app/accounts/google/login/callback/`
5. Habilitar a tela de consentimento (modo "External", scopes: `email`, `profile`, `openid`)
6. Copiar `Client ID` e `Client secret` para o `.env` e para o Railway

---

### 10. Testes manuais

#### Dev
```bash
python manage.py runserver
```
Fluxo de teste:
1. Abrir `http://localhost:8000/usuario/login/`
2. Clicar no botão **Google**
3. Selecionar uma conta no popup do Google
4. **Esperado:** redireciona para o `LOGIN_REDIRECT_URL` (`dashboard`) e o usuário está autenticado
5. Conferir no `/admin/usuario/usuario/` se a conta foi criada (com `username=email`, `cpf` placeholder, `telefone` placeholder)

#### Casos a cobrir
- [ ] Usuário que **nunca** logou → cria `Usuario` + `SocialAccount` + login
- [ ] Usuário com o **mesmo email** já cadastrado pelo fluxo tradicional → allauth vincula automaticamente a conta existente (`email` já é o `username` no projeto, então casa direto)
- [ ] Email **não verificado** pelo Google → com `VERIFIED_EMAIL = True` e `ACCOUNT_EMAIL_VERIFICATION = 'none'`, deve entrar sem pendência
- [ ] Logout → `LOGOUT_REDIRECT_URL = "index"`

#### Produção (Railway)
- [ ] Variáveis `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SITE_DOMAIN` configuradas no painel
- [ ] `DEBUG=False` ativa o ramo que amplia `ALLOWED_HOSTS`/`CSRF_TRUSTED_ORIGINS` (já existe no `settings.py`)
- [ ] `SITE_ID = 1` aponta para o `Site` com o domínio de produção — checar via admin ou criar um data migration

---

## Critérios de pronto (Definition of Done)

- [ ] `pip install -r requirements.txt` instala `django-allauth==65.18.0` sem erro
- [ ] `python manage.py migrate` aplica `account`, `socialaccount`, `sites`
- [ ] `python manage.py check` retorna 0 issues
- [ ] Botão "Google" no `login.html` é um `<a href="/accounts/google/login/">` (ou usa o `url` tag)
- [ ] Clicar no botão redireciona para a tela de consentimento do Google
- [ ] Após consentimento, usuário novo é criado com `username=email`, `email`, `first_name` (se vier no payload) e `cpf`/`telefone` preenchidos
- [ ] Após consentimento, usuário existente (mesmo email) é logado e vinculado via `SocialAccount`
- [ ] Em dev **e** produção (Railway), o fluxo completa sem `400 invalid_grant` / `disallowed_useragent`
- [ ] `.env.example` está consistente com `.env`
- [ ] Logout via `/accounts/logout/` ou `/usuario/logout/` continua funcionando

---

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| `cpf unique=True` quebrando insert em retries do Google OAuth | Etapa 6.2 — tornar `cpf` nullable. Alternativa temporária: gerar placeholder com sufixo único. |
| `LOGIN_URL = "login"` causar `NoReverseMatch` ao plugar allauth | Etapa 3.4 — mudar para `"usuario:login"` |
| CSRF entre domínios (dev ↔ Google) | `allauth.account.middleware.AccountMiddleware` resolve; checar se a lista `CSRF_TRUSTED_ORIGINS` em prod inclui o domínio do Railway |
| `SITE_ID = 1` em produção apontando para `example.com` | Etapa 8, Opção A: editar o `Site` no admin para o domínio real. Ou data migration que corrige o domínio. |
| Usuários OAuth com `cpf`/`telefone` placeholder querem completar perfil depois | Fora do escopo deste plano. Próximo passo: tela "Completar perfil" com edição desses campos. |
| Banco MySQL do Railway não tem permissão para criar tabelas novas | Se `migrate` falhar, contatar suporte Railway ou rodar local e exportar SQL. Em geral, plano atual do Railway dá permissão total. |
| `allauth` forçar `username` em algum fluxo | Manter `username=email` no `populate_user` (Etapa 5) garante consistência. |

---

## Sequência sugerida de execução

1. Atualizar `requirements.txt` → `pip install -r requirements.txt`
2. Atualizar `.env.example`
3. Editar `config/settings.py` (3.1, 3.2, 3.3)
4. Editar `config/urls.py` (Etapa 4)
5. Criar `usuario/adapter.py` (Etapa 5)
6. Afrouxar `Usuario.cpf`/`telefone` no model (Etapa 6.2) + makemigrations + migrate
7. Aplicar migrations do allauth: `python manage.py migrate`
8. Editar `usuario/templates/usuario/login.html` (Etapa 7)
9. Configurar `SocialApp` no admin (Etapa 8) — usando as chaves do `.env`
10. Configurar credenciais no Google Cloud Console (Etapa 9)
11. Rodar smoke test local (Etapa 10)

---

## Próximos passos (fora do escopo)

- **Tela "Completar perfil"** após primeiro login Google — para o usuário preencher `cpf`, `telefone`, `nascimento`, `genero` que vieram vazios.
- **GitHub OAuth** — espelhar o que foi feito para Google; mesmo padrão em `SOCIALACCOUNT_PROVIDERS`.
- **Vincular contas** — se o usuário se cadastrou por e-mail/senha e depois quer associar o Google, o allauth já trata por email, mas vale documentar na UI.
- **Testes automatizados** — `pytest-django` + `responses` para mockar a chamada ao Google.
- **Auditoria de segurança** — checar `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` em produção (Railway HTTPS).
