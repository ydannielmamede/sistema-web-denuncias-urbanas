# Plano: Backend do Dashboard de Relatórios

> Plano completo para a primeira fase (tela **Dashboard**). Demais abas do `relatorios-dashboard.html` (Relatórios, Contas, Atualizações, Análises, Configurações) ficam como placeholders e ganham rotas dedicadas em fases posteriores.

---

## 1. Contexto

### 1.1 Situação atual

A página `relatorios-dashboard.html` (na raiz do projeto) é um protótipo estático de um painel administrativo. Sua sidebar lista seis seções:

- **Dashboard** ← alvo desta entrega
- Relatórios
- Contas
- Atualizações
- Análises
- Configuração

Hoje **todos os dados estão hardcoded** em `javaScript/relatorios-dashboard.js`:

| Bloco visual | Fonte mock |
| --- | --- |
| 4 cards de stats (Total / Pendentes / Resolvidos / Em andamento) | constantes literais (`1.240`, `320`, `780`, `140`) |
| Donut "Status Geral" | `780 + 320 + 140` |
| Gráfico de área "Visão Geral Anual" | array `data` literal com 12 meses |
| Tabela "Todas" (5 linhas) | array `reports` (8 itens, slice 5) |
| Lista "Atividades Recentes" | array `updatesData` |
| Cards "Contas" (5 usuários) | array `accounts` |
| Gráfico "Denúncias por Categoria" | array `cats` |

### 1.2 Estado do backend

O projeto é **Django 6.0.5** com os seguintes apps registrados em `config/settings.py:65`:

```python
INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.sites",
    "django.contrib.contenttypes", "django.contrib.sessions",
    "django.contrib.messages", "django.contrib.staticfiles",
    "allauth", "allauth.account", "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "denuncia", "categoria", "orgao_alvo", "usuario",
]
```

Modelo `Denuncia` (`denuncia/models.py:6`) já tem:

- `id_denuncia` (PK), `mensagem`, 5 campos de foto, `data_hora` (auto_now_add), `anonimo`
- `localizacao`, `latitude`, `longitude`
- FKs: `id_categoria`, `id_orgao_alvo`, `id_usuario` (SET_NULL)
- `status` com `Status(TextChoices)`: `PENDENTE='P'`, `EM_ANALISE='A'`, `RESOLVIDA='R'`

Modelos de apoio:

- `categoria/models.py:4` — `Categoria(nome_categoria, descricao_categoria, icone, cor)`
- `orgao_alvo/models.py:4` — `OrgaoAlvo(descricao, email_orgao, telefone, FK categoria)`
- `usuario/models.py:5` — `Usuario(AbstractUser)` com `cpf`, `nascimento`, `genero`, `telefone`

### 1.3 Lacunas identificadas

1. **Sem campo `prioridade`** no model `Denuncia`, mas o front exibe "Alta / Média / Baixa / Crítica" na tabela.
2. **Sem rota de dashboard** — não existe `denuncia/urls.py:path('dashboard/', ...)`.
3. **Sem view de dashboard** — `denuncia/views.py` tem `denuncia_page`, `listar_denuncias`, `criar_denuncia`, e três `marcar_status_*`; nenhum agrega dados para o painel.
4. **Sem redirect staff em `/`** — `config/views.py:index` renderiza a home pública mesmo para usuários logados como staff.

### 1.4 Objetivo

Substituir a página estática por uma página Django **server-rendered** que:

- Renderiza a casca (sidebar + topbar) e **somente** o conteúdo da aba Dashboard com dados reais do banco.
- Expõe um endpoint JSON de agregados para o JS client-side pintar os gráficos SVG.
- Restringe o acesso a `is_staff`/`is_superuser` logados.
- Redireciona `/` → `/denuncia/dashboard/` quando o usuário autenticado é staff.

---

## 2. Decisões de arquitetura

| # | Decisão | Justificativa |
| --- | --- | --- |
| 1 | **Server-rendered Django template** (não SPA React/Vue) | Coerente com o resto do projeto (`denuncia.html`, `listar_denuncias.html`, `index.html` são todos templates Django). |
| 2 | **Conversão parcial do HTML**: o `relatorios-dashboard.html` (raiz) vira `templates/denuncia/dashboard.html`; as outras cinco abas permanecem como blocos HTML escondidos por enquanto (não renderizam dados reais nesta fase). | Mantém navegação funcional sem reescrever a casca. |
| 3 | **Namespace `denuncia` para a rota `/denuncia/dashboard/`** | O app já concentra o modelo e as regras de status. Evita criar um app `dashboard` novo só para uma view. |
| 4 | **Proteção com `_is_staff_or_admin`** (helper já existente em `denuncia/views.py:252`) | Reaproveita código testado; mesmo padrão dos endpoints `marcar_status_*`. |
| 5 | **Endpoint JSON para gráficos** | Os gráficos SVG (área, donut, categorias) já são desenhados client-side pelo JS atual; trocar os arrays literais por `fetch()` minimiza refatoração no JS e mantém o render server-side para o resto. |
| 6 | **Default `MEDIA` na nova coluna `prioridade`** | Sem `default` + `NOT NULL` causaria `IntegrityError` ao aplicar a migration em denúncias existentes. |
| 7 | **Static files servidos pelo `whitenoise`** (já configurado) | Mover `css/` e `javaScript/` da raiz para `static/` alinha com `STATICFILES_DIRS = [BASE_DIR / "static"]` em `config/settings.py:200`. |
| 8 | **Não usar SPA/hot-reload** | Fora do escopo; o painel é um CRUD-leve de administração. |

---

## 3. O que precisa mudar

### 3.1 Model `denuncia/models.py` — campo `prioridade`

Acrescentar uma `TextChoices` e o campo. Default `MEDIA` para não quebrar registros existentes.

```python
# denuncia/models.py (adicionar após `class Status`)

class Prioridade(models.TextChoices):
    BAIXA   = 'B', 'Baixa'
    MEDIA   = 'M', 'Média'
    ALTA    = 'A', 'Alta'
    CRITICA = 'C', 'Crítica'

prioridade = models.CharField(
    max_length=1,
    choices=Prioridade.choices,
    default=Prioridade.MEDIA,
    db_column='Prioridade',
    null=False,
    blank=False,
)
```

Migration gerada:

```bash
python manage.py makemigrations denuncia
python manage.py migrate
```

> **Cuidado**: o `db_column='Prioridade'` segue o padrão snake_case-in-PascalCase do projeto (ex.: `db_column='Mensagem'`, `db_column='Data_hora'`). Não renomear colunas já existentes.

### 3.2 View `denuncia/views.py` — `dashboard`

```python
# denuncia/views.py
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.http import JsonResponse
from django.utils.timesince import timesince
from usuario.models import Usuario  # se ainda não importado
# (Status/Paginator/get_object_or_404/redirect/render já importados)

@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def dashboard(request):
    qs = Denuncia.objects.all()
    total      = qs.count()
    pendentes  = qs.filter(status=Denuncia.Status.PENDENTE).count()
    em_analise = qs.filter(status=Denuncia.Status.EM_ANALISE).count()
    resolvidas = qs.filter(status=Denuncia.Status.RESOLVIDA).count()

    denuncias_5 = (
        qs.select_related('id_categoria', 'id_orgao_alvo', 'id_usuario')
          .order_by('-data_hora')[:5]
    )

    # Atividades recentes — derivamos das últimas 4 denúncias alteradas
    atividades = []
    for d in qs.select_related('id_categoria', 'id_usuario').order_by('-data_hora')[:4]:
        autor = d.id_usuario.username if d.id_usuario else 'Anônimo'
        atividades.append({
            'avatar_inicial': (autor[0] or 'A').upper(),
            'cor': '#3b82f6' if d.id_usuario else '#a855f7',
            'nome': autor,
            'desc': f'Nova denúncia - {d.id_categoria.nome_categoria}',
            'tempo': f'{timesince(d.data_hora)} atrás',
        })

    return render(request, 'denuncia/dashboard.html', {
        'total': total,
        'pendentes': pendentes,
        'em_analise': em_analise,
        'resolvidas': resolvidas,
        'denuncias_5': denuncias_5,
        'atividades': atividades,
    })
```

### 3.3 Endpoint JSON `dashboard_dados`

```python
@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def dashboard_dados(request):
    """Agregados mensais e por categoria para os gráficos SVG."""
    qs = Denuncia.objects.all()

    monthly = (
        qs.annotate(mes=TruncMonth('data_hora'))
          .values('mes')
          .annotate(
              abertas=Count('id_denuncia'),
              resolvidas=Count('id_denuncia',
                  filter=Q(status=Denuncia.Status.RESOLVIDA)),
          )
          .order_by('mes')
    )

    por_categoria = (
        qs.values('id_categoria__nome_categoria')
          .annotate(total=Count('id_denuncia'))
          .order_by('-total')
    )

    return JsonResponse({
        'mensal': [
            {'mes': m['mes'].strftime('%Y-%m'),
             'abertas': m['abertas'],
             'resolvidas': m['resolvidas']}
            for m in monthly
        ],
        'por_categoria': list(por_categoria),
        'status': {
            'P': qs.filter(status=Denuncia.Status.PENDENTE).count(),
            'A': qs.filter(status=Denuncia.Status.EM_ANALISE).count(),
            'R': qs.filter(status=Denuncia.Status.RESOLVIDA).count(),
        },
    })
```

> **Performance**: anotar com `TruncMonth` é aceitável enquanto a base de denúncias ficar na casa dos milhares. Se passar de ~100k, considerar cachear com `cache.get_or_set` por 5 min, ou pré-agregar em tabela de relatórios.

### 3.4 URLs `denuncia/urls.py`

Adicionar ao array `urlpatterns`:

```python
from .views import (
    # ... imports existentes ...
    dashboard, dashboard_dados,
)

urlpatterns = [
    # ... rotas existentes ...
    path('dashboard/', dashboard, name='dashboard'),
    path('dashboard/dados/', dashboard_dados, name='dashboard_dados'),
]
```

### 3.5 Redirect de staff em `config/views.py`

Alterar `index` para mandar staff logado ao dashboard:

```python
from django.shortcuts import redirect, render

def index(request):
    if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
        return redirect('denuncia:dashboard')

    # renderização pública existente (não mexer)
    denuncias_recentes = Denuncia.objects.select_related('id_categoria').order_by('-data_hora')[:5]
    total_denuncias = Denuncia.objects.count()
    # ... resto do código atual ...
```

### 3.6 Template `templates/denuncia/dashboard.html`

- Reaproveita o `<aside>`/`<header>`/`<div id="content">` do `relatorios-dashboard.html`.
- Remove as 5 abas além do Dashboard ou as deixa com `{% if False %}` (visíveis no DOM, mas JS de navegação segue trocando `.active`).
- Substitui os valores estáticos dos cards por `{{ total }}`, `{{ pendentes }}`, `{{ resolvidas }}`, `{{ em_analise }}`.
- Substitui a tabela de "Todas":

```django
<tbody id="dashTableBody">
{% for d in denuncias_5 %}
  <tr>
    <td class="td-id">#{{ d.id_denuncia }}</td>
    <td class="td-title">{{ d.mensagem|truncatechars:40 }}</td>
    <td class="td-muted">{{ d.id_categoria.nome_categoria }}</td>
    <td class="td-muted">{{ d.localizacao|default:"—" }}</td>
    <td class="td-muted">{{ d.data_hora|date:"d/m" }}</td>
    <td>
      {% if d.status == 'P' %}<span class="badge badge-yellow">Pendente</span>
      {% elif d.status == 'A' %}<span class="badge badge-blue">Em andamento</span>
      {% else %}<span class="badge badge-green">Resolvido</span>{% endif %}
    </td>
    <td><!-- botão de ação --></td>
  </tr>
{% endfor %}
</tbody>
```

- Substitui a lista de "Atividades Recentes":

```django
{% for a in atividades %}
  <div class="activity-item">
    <div class="act-avatar" style="background: {{ a.cor }}">{{ a.avatar_inicial }}</div>
    <div>
      <div class="act-name">{{ a.nome }}</div>
      <div class="act-desc">{{ a.desc }}</div>
    </div>
    <span class="act-time">{{ a.tempo }}</span>
  </div>
{% endfor %}
```

- Carrega o CSS/JS de UI via `{% load static %}`:

```django
{% load static %}
<link rel="stylesheet" href="{% static 'css/relatorios-dashboard.css' %}">
...
<script src="{% static 'javaScript/relatorios-dashboard.js' %}"></script>
```

### 3.7 JS client-side — `static/javaScript/relatorios-dashboard.js`

- Remover os arrays literais `reports`, `accounts`, `updatesData`, `cats`.
- No `DOMContentLoaded`, fazer:

```js
fetch('/denuncia/dashboard/dados/', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(dados => {
    // renderiza areaChart, donut, categorias
    renderAreaChart(dados.mensal);
    renderDonut(dados.status);
    renderCategorias(dados.por_categoria);
  });
```

- Manter a função `renderRow(r, showPrio)` (chamada por `renderDashTable`/`renderReportsTable`), porém agora `r` vem do servidor em vez de `reports`. Para isso, o **JSON do dashboard deve incluir também** a lista de 5 denúncias. Alternativa mais simples: deixar o template Django renderizar as linhas e remover o `renderDashTable` JS (apenas o filtro client-side dos botões, que apenas esconde `<tr>` por status).

**Recomendação**: Django renderiza as 5 linhas (caminho acima), JS só controla visibilidade dos botões de filtro.

### 3.8 Estático — mover assets

Mover (não copiar; usar `git mv` se for commit):

| De | Para |
| --- | --- |
| `css/relatorios-dashboard.css` | `static/css/relatorios-dashboard.css` |
| `javaScript/relatorios-dashboard.js` | `static/javaScript/relatorios-dashboard.js` |

O `whitenoise.storage.CompressedManifestStaticFilesStorage` (em `config/settings.py:201`) gera manifest com hash; após mover, rodar `python manage.py collectstatic --clear` para o dev local não pegar arquivo obsoleto. A flag `WHITENOISE_MANIFEST_STRICT = False` (linha 202) impede 404 em assets não listados no manifest.

### 3.9 Admin `denuncia/admin.py`

Acrescentar `prioridade` ao `list_display` e `list_filter`:

```python
list_display = ('id_denuncia', 'mensagem', 'id_categoria', 'status', 'prioridade', 'data_hora')
list_filter  = ('status', 'prioridade', 'id_categoria')
```

> Tweak pequeno, mas é onde staff/operador vão definir a prioridade das denúncias que chegam como `MEDIA`.

---

## 4. Arquivos críticos (resumo)

| Caminho | Ação |
| --- | --- |
| `denuncia/models.py` | Adicionar `Prioridade` + campo `prioridade` |
| `denuncia/migrations/0008_denuncia_prioridade.py` | **Nova**, gerada por `makemigrations` |
| `denuncia/views.py` | Adicionar `dashboard` e `dashboard_dados` |
| `denuncia/urls.py` | Duas rotas novas |
| `denuncia/admin.py` | Expor `prioridade` em `list_display`/`list_filter` |
| `config/views.py` | Redirect staff em `index` |
| `config/urls.py` | Sem mudança (já inclui `denuncia.urls`) |
| `templates/denuncia/dashboard.html` | **Novo** — derivado de `relatorios-dashboard.html` |
| `static/css/relatorios-dashboard.css` | Mover de `css/` |
| `static/javaScript/relatorios-dashboard.js` | Mover de `javaScript/`, remover arrays hardcoded |
| `relatorios-dashboard.html` (raiz) | **Obsoleto** após migração; pode ser removido em fase posterior |

---

## 5. Reutilização (código que já existe)

- `denuncia/views.py:252` → `_is_staff_or_admin(user)` — usar com `@user_passes_test`.
- `denuncia/models.py:29` → `Denuncia.Status.{PENDENTE,EM_ANALISE,RESOLVIDA}` — bate com "Pendente"/"Em andamento"/"Resolvido" do front.
- `denuncia/views.py:47` → padrão `select_related('id_categoria', 'id_orgao_alvo', 'id_usuario')` para evitar N+1 nas 5 denúncias.
- `config/settings.py:200` → `STATICFILES_DIRS = [BASE_DIR / "static"]` para carregar `static/`.
- `config/settings.py:201-202` → whitenoise já cuida do serving em produção.
- `django.utils.timesince.timesince()` — para "há 2 min" nas atividades recentes (substitui o mock `'2 min'`, `'12 min'`, etc.).
- `django.db.models.functions.TruncMonth`, `Count`, `Q` — stdlib Django, sem dependência nova no `requirements.txt`.

---

## 6. Verificação end-to-end

### 6.1 Banco

```bash
python manage.py makemigrations denuncia
python manage.py migrate
python manage.py check
```

Confirmar:

- Coluna `Prioridade CHAR(1) NOT NULL DEFAULT 'M'` criada em `denuncia`.
- `python manage.py check` passa sem warnings.

### 6.2 Servidor

```bash
python manage.py createsuperuser   # se ainda não existir
python manage.py runserver
```

### 6.3 Rotas e permissões

| Passo | Esperado |
| --- | --- |
| `GET /` sem login | Renderiza `index.html` pública (igual hoje). |
| `GET /` logado como staff | Redireciona para `/denuncia/dashboard/`. |
| `GET /denuncia/dashboard/` sem login | Redireciona para `usuario:login`. |
| `GET /denuncia/dashboard/` logado como staff | Renderiza template com dados reais. |
| `GET /denuncia/dashboard/dados/` logado como staff | Retorna JSON com `mensal`, `por_categoria`, `status`. |

### 6.4 Conteúdo do Dashboard

Conferir visualmente que:

- **Cards de stats** mostram `count()` real de `Denuncia`, não os números hardcoded.
- **Donut "Status Geral"** tem arcos nas proporções verde (R) / amarelo (P) / azul (A) corretas.
- **Gráfico de área "Visão Geral Anual"** é desenhado após `fetch('/denuncia/dashboard/dados/')` bem-sucedido (abrir DevTools → Network e confirmar a requisição).
- **Tabela "Todas"** lista as 5 denúncias mais recentes com `#id`, mensagem, categoria, local, data formatada `d/m`, badge de status.
- **Filtros** "Todos / Pendente / Em andamento / Resolvido" escondem/mostram linhas client-side (já que o template renderiza as 5 mais recentes e o filtro atua por CSS `display:none` no `<tr>` cuja classe de status não bate).
- **Atividades Recentes** mostra 4 entradas geradas a partir das últimas denúncias.

### 6.5 Smoke tests manuais extras

- Criar uma denúncia nova pela rota pública (`/denuncia/`) e verificar que ela aparece na tabela do dashboard.
- Marcar status via `marcar_status_resolvida` (`/denuncia/<id>/status/resolvida/`) e conferir que o card "Resolvidos" e o donut mudam.
- Botão "Atualizar" do header recarrega a página (`location.reload()` ou simplesmente re-renderizar via JS).

### 6.6 Critérios de aceitação da fase 1

- [ ] `python manage.py check` limpo.
- [ ] Migration aplicada sem erro.
- [ ] `GET /` redireciona staff.
- [ ] `GET /denuncia/dashboard/` requer login.
- [ ] Todos os 4 cards, donut, área, tabela e atividades usam dados do banco.
- [ ] Nenhum array hardcoded no `relatorios-dashboard.js` (somente constantes de cor/SVG inline).
- [ ] `relatorios-dashboard.html` da raiz removido ou marcado como obsoleto.

---

## 7. Fora de escopo desta fase

A ser endereçado em PRs/fases seguintes:

- Rotas dedicadas para `/denuncia/relatorios/`, `/denuncia/contas/`, `/denuncia/atualizacoes/`, `/denuncia/analises/`, `/denuncia/configuracao/`.
- Paginação e busca server-side na tabela "Relatórios" (hoje o dashboard só mostra top 5).
- Ações em massa (alterar status, atribuir responsável, exportar CSV/PDF).
- WebSocket / SSE para atividades em tempo real.
- Internacionalização (i18n) dos labels do dashboard.
- Cache de agregados (`django.core.cache` com TTL de 5 min) — só vale aplicar quando a base passar de ~50k denúncias.
- Testes automatizados: `denuncia/tests.py` (vazio) deve ganhar `test_dashboard_view`, `test_dashboard_dados_json`, `test_index_redirects_staff`.
