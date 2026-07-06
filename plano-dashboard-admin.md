# Plano — Travar tamanho da tabela de denúncias (Dashboard)

## Contexto
A tabela de denúncias na página Dashboard (`templates/denuncia/dashboard.html:503-539`) tem o comportamento clássico de "tudo flui": sem `table-layout: fixed`, o browser recalcula a largura de cada coluna a cada render (paginação, filtro, mudança de status). Isso faz o container dançar horizontalmente quando o conteúdo varia entre páginas (ex.: "Iluminação Pública" vs "Buraco na Rua"), e verticalmente quando o número de linhas muda.

O backend já envia linhas de tamanho consistente (5 por página, `mensagem` truncada em 40 chars, `categoria` e `local` são strings curtas, `data_hora` é `dd/mm`), então o reflow é puramente visual — basta cravar as dimensões no CSS e replicar a estrutura de colunas via `<colgroup>`.

A tabela é renderizada de duas formas — pelo Django no primeiro load e por `buildTableRow` no JS — e ambas precisam respeitar as mesmas larguras. A solução com `<colgroup>` resolve isso: `<colgroup>` mora dentro do `<table>` (que não é destruído pelo `tbody.innerHTML = ""` no JS), então vale para os dois caminhos.

## Arquivos a modificar
- `templates/denuncia/dashboard.html` (apenas a `<table>`)
- `static/css/relatorios-dashboard.css` (regras da tabela + card wrapper)

Nenhuma view, URL ou JS precisa ser alterado.

## Implementação

### 1. `<colgroup>` no template
Logo após `<table>` (linha 503), adicionar:

```html
<colgroup>
  <col style="width: 64px" />   <!-- ID -->
  <col />                        <!-- Título (absorve a folga) -->
  <col style="width: 140px" />  <!-- Categoria -->
  <col style="width: 160px" />  <!-- Local -->
  <col style="width: 72px" />   <!-- Data -->
  <col style="width: 132px" />  <!-- Status -->
  <col style="width: 28px" />   <!-- Ações (coluna vazia) -->
</colgroup>
```

Por que funciona no JS: `renderTableRows` só faz `tbody.innerHTML = ""` e `pagination.innerHTML = ""`. O `<colgroup>` está dentro do `<table>` mas **fora** do `<tbody>`, então sobrevive a re-renderizações.

A coluna sem `width` definido (Título) recebe `width: auto` → ocupa o espaço restante sem brigar com as demais.

### 2. CSS — `table-layout: fixed` e altura de linha

Em `static/css/relatorios-dashboard.css:760-790`, ajustar `table`, `tbody tr`, `tbody td`:

```css
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;     /* <- novo: respeita o <colgroup> */
}

thead th {
  text-align: left;
  padding: 10px 18px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;     /* <- novo: cabeçalho nunca quebra */
}

tbody tr {
  border-bottom: 1px solid var(--border);
  height: 46px;            /* <- novo: trava altura da linha */
  transition: background 0.12s;
}

tbody td {
  padding: 12px 18px;
  font-size: 13px;
  white-space: nowrap;            /* <- novo */
  overflow: hidden;               /* <- novo */
  text-overflow: ellipsis;         /* <- novo */
  vertical-align: middle;          /* <- novo */
}
```

Aplicar a regra de elipse também em `.td-title` e `.td-muted` (que são as classes mais usadas em conteúdo variável) — o seletor `tbody td` já cobre, mas como essas classes sobrescrevem `font-size` etc., mantenho como está.

### 3. CSS — `min-height` no card da tabela

A `.card` que envolve a tabela não tem `min-height` hoje, então quando há 0 linhas (estado vazio) a card colapsa. A view hoje raramente devolve 0 linhas (sempre há pelo menos 1 linha com `denuncias_page|length >= 1` em produção), mas vale prevenir.

Adicionar uma regra nova escopada apenas para a tabela de denúncias do dashboard. Vou usar um seletor que já existe: o `<table>` direto dentro de `.card`. Hoje existe uma tabela de denúncias no Dashboard e uma tabela vazia de Relatórios (`page-reports`, sem `<tbody>` populado) — para não afetar a de Relatórios, escopo pela `.page` ativa.

```css
#page-dashboard .card > table {
  min-height: 230px;        /* 5 linhas × 46px */
}
```

Isso é "min-height" e não "height", então se a tabela crescer (ex.: paginação com 5 linhas + estado vazio) ela continua fluindo, mas o card **não encolhe** quando há 0 ou 1 linha.

### 4. `<td>` vazia de ações
A última `<td></td>` no template e no JS é a coluna de ações. Com `width: 28px` no `<col>`, ela fica com largura fixa e o conteúdo vazio não a expande.

## Funções/recursos reutilizados
- A largura de coluna via `<colgroup>` é uma feature HTML nativa; nenhum JS novo é necessário.
- `table-layout: fixed` é a primitiva CSS que faz `<col>` valer.
- O `tbody.innerHTML = ""` em `relatorios-dashboard.js:144` já preserva o `<colgroup>` por estar fora do `<tbody>`.

## Verificação (manual)
1. `python manage.py runserver` e abrir `/denuncia/dashboard/` como admin.
2. Conferir que a tabela tem 7 colunas com larguras fixas (64, flex, 140, 160, 72, 132, 28).
3. Paginar 1 → 2 → 3 e voltar: largura das colunas e altura da card não mudam entre páginas.
4. Trocar o filtro "Pendente" / "Em andamento" / "Resolvido": card e colunas continuam estáveis; linhas com "—" no local não causam reflow.
5. Trocar status de uma denúncia em qualquer página: card, colunas e paginação permanecem na mesma posição; só o badge da linha atualiza a cor.
6. Conferir que mensagens longas na coluna Título mostram "…" (elipse) em vez de esticar a coluna.
7. Conferir visualmente que a tabela de Relatórios (`#page-reports`) — que está em outro `.card` e outro `#page` — **não foi afetada**.
