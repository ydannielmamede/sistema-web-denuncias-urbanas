// ═══════════════════════════════════════════════════
//                      DATA
// ═══════════════════════════════════════════════════
const reports = [
  { id:"#801", titulo:"Poste apagado",       cat:"Iluminação",    local:"Centro",     data:"12/04", status:"Pendente",    sc:"yellow", prio:"Alta",     prioColor:"#f97316" },
  { id:"#802", titulo:"Vazamento de água",   cat:"Água",          local:"Bairro X",   data:"11/04", status:"Em andamento",sc:"blue",   prio:"Crítica",  prioColor:"#ef4444" },
  { id:"#803", titulo:"Árvore caída",        cat:"Infraestrutura",local:"Av. Central",data:"10/04", status:"Resolvido",   sc:"green",  prio:"Alta",     prioColor:"#f97316" },
  { id:"#804", titulo:"Semáforo quebrado",   cat:"Trânsito",      local:"Cruzamento A",data:"09/04",status:"Resolvido",   sc:"green",  prio:"Média",    prioColor:"#ffc300" },
  { id:"#805", titulo:"Buraco na rua",       cat:"Infraestrutura",local:"Bairro Y",   data:"08/04", status:"Pendente",    sc:"yellow", prio:"Alta",     prioColor:"#f97316" },
  { id:"#806", titulo:"Lixo acumulado",      cat:"Limpeza",       local:"Centro",     data:"07/04", status:"Em andamento",sc:"blue",   prio:"Média",    prioColor:"#ffc300" },
  { id:"#807", titulo:"Calçada danificada",  cat:"Infraestrutura",local:"Bairro Z",   data:"06/04", status:"Resolvido",   sc:"green",  prio:"Baixa",    prioColor:"#22c55e" },
  { id:"#808", titulo:"Esgoto transbordando",cat:"Saneamento",    local:"Vila Nova",  data:"05/04", status:"Pendente",    sc:"yellow", prio:"Crítica",  prioColor:"#ef4444" },
];

const accounts = [
  { name:"Melissa",  email:"melissa@administracao.com", role:"Admin",    status:"Ativo",  joined:"Jan 2024", av:"S", color:"#ffc300", tc:"#212529" },
  { name:"Yanna",    email:"yanna@administracao.com",      role:"Analista", status:"Ativo",  joined:"Mar 2024", av:"A", color:"#3b82f6", tc:"#fff" },
  { name:"Daniel",   email:"daniel@administracao.com",   role:"Operador", status:"Ativo",  joined:"Abr 2024", av:"C", color:"#9333ea", tc:"#fff" },
  { name:"João",    email:"joao@administracao.com",   role:"Analista", status:"Inativo",joined:"Jun 2024", av:"B", color:"#16a34a", tc:"#fff" },
  { name:"Romulo",    email:"romulo@administracao.com",    role:"Operador", status:"Ativo",  joined:"Jul 2024", av:"D", color:"#ea580c", tc:"#fff" },
];

const updatesData = [
  { type:"success", title:"Sistema atualizado",       desc:"Versão 2.3.1 instalada com sucesso.",                       time:"Agora",    sc:"green"  },
  { type:"info",    title:"Nova denúncia recebida",   desc:"Denúncia #808 - Esgoto transbordando na Vila Nova.",       time:"5 min",    sc:"blue"   },
  { type:"warning", title:"Alta demanda detectada",   desc:"Taxa de denúncias 35% acima da média.",                    time:"22 min",   sc:"yellow" },
  { type:"success", title:"Denúncia #803 resolvida",  desc:"Árvore caída na Av. Central foi removida.",                time:"1h",       sc:"green"  },
  { type:"info",    title:"Relatório automático",     desc:"Relatório mensal de abril disponível para download.",      time:"3h",       sc:"purple" },
  { type:"info",    title:"Manutenção agendada",      desc:"Manutenção preventiva em 17/04 às 02:00.",                 time:"1 dia",    sc:"blue"   },
  { type:"success", title:"Backup concluído",         desc:"Backup dos dados realizado com sucesso.",                  time:"2 dias",   sc:"green"  },
];

// ═══════════════════════════════════════════════════
//                   NAVIGATION
// ═══════════════════════════════════════════════════
const navItems = document.querySelectorAll('.nav-item');
const pages    = document.querySelectorAll('.page');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.page;
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('page-' + target).classList.add('active');
  });
});

// ═══════════════════════════════════════════════════
//                   SIDEBAR TOGGLE
// ═══════════════════════════════════════════════════
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
});

// ═══════════════════════════════════════════════════
//                   THEME
// ═══════════════════════════════════════════════════
let isDark = true;
function syncThemeToggle() {
  const st = document.getElementById('settingsThemeToggle');
  if (st) { isDark ? st.classList.add('on') : st.classList.remove('on'); }
}
function applyTheme(dark) {
  isDark = dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  // update icon
  const ic = document.getElementById('themeIcon');
  ic.innerHTML = dark
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  syncThemeToggle();
}
document.getElementById('themeToggle').addEventListener('click', () => applyTheme(!isDark));
document.getElementById('settingsThemeToggle').addEventListener('click', function() {
  this.classList.toggle('on');
  applyTheme(!isDark);
});

// ═══════════════════════════════════════════════════
//                   TABLE HELPERS
// ═══════════════════════════════════════════════════
const badgeIcons = {
  yellow: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  blue:   '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>',
  green:  '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
};

function renderRow(r, showPrio) {
  const moreBtn = `<button class="icon-btn" style="width:26px;height:26px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>`;
  const prioCell = showPrio ? `<td class="td-muted" style="color:${r.prioColor};font-weight:600">${r.prio}</td>` : '';
  return `<tr>
    <td class="td-id">${r.id}</td>
    <td class="td-title">${r.titulo}</td>
    <td class="td-muted">${r.cat}</td>
    <td class="td-muted">${r.local}</td>
    <td class="td-muted">${r.data}</td>
    ${prioCell}
    <td><span class="badge badge-${r.sc}">${badgeIcons[r.sc]}${r.status}</span></td>
    <td>${moreBtn}</td>
  </tr>`;
}

// ═══════════════════════════════════════════════════
//            DASHBOARD TABLE + FILTER
// ═══════════════════════════════════════════════════
let activeFilter = 'Todos';

function renderDashTable() {
  const filtered = activeFilter === 'Todos' ? reports.slice(0,5)
    : reports.filter(r => r.status === activeFilter);
  document.getElementById('dashTableBody').innerHTML = filtered.map(r => renderRow(r, false)).join('');
  document.getElementById('dashTableInfo').textContent = `Mostrando ${filtered.length} de ${reports.length} resultados`;
}

document.getElementById('dashFilterTabs').addEventListener('click', e => {
  const tab = e.target.closest('.filter-tab');
  if (!tab) return;
  activeFilter = tab.dataset.filter;
  document.querySelectorAll('#dashFilterTabs .filter-tab').forEach(t => t.classList.toggle('active', t === tab));
  renderDashTable();
});
renderDashTable();

// ═══════════════════════════════════════════════════
//              REPORTS TABLE + SEARCH
// ═══════════════════════════════════════════════════
function renderReportsTable(q) {
  const list = q ? reports.filter(r => r.titulo.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q) || r.local.toLowerCase().includes(q)) : reports;
  document.getElementById('reportsTableBody').innerHTML = list.map(r => renderRow(r, true)).join('');
  document.getElementById('reportsCount').textContent = list.length + ' resultados';
}
document.getElementById('reportsSearch').addEventListener('input', e => renderReportsTable(e.target.value.toLowerCase()));
renderReportsTable('');

// ═══════════════════════════════════════════════════
//              ACCOUNTS LIST
// ═══════════════════════════════════════════════════
function renderAccounts(q) {
  const list = q ? accounts.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)) : accounts;
  document.getElementById('accountsList').innerHTML = list.map(a => `
    <div class="account-row">
      <div class="avatar" style="background:${a.color};color:${a.tc};width:34px;height:34px">${a.av}</div>
      <div class="acct-info">
        <div class="acct-name">${a.name}</div>
        <div class="acct-email">${a.email}</div>
      </div>
      <span class="role-badge">${a.role}</span>
      <span class="acct-joined">${a.joined}</span>
      <span class="badge ${a.status === 'Ativo' ? 'badge-green' : ''}" style="${a.status !== 'Ativo' ? 'background:var(--bg-hover);color:var(--text-muted);border:none' : ''}">${a.status}</span>
      <button class="icon-btn" style="width:26px;height:26px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
    </div>`).join('');
}
document.getElementById('accountsSearch').addEventListener('input', e => renderAccounts(e.target.value.toLowerCase()));
renderAccounts('');

// ═══════════════════════════════════════════════════
//              UPDATES LIST
// ═══════════════════════════════════════════════════
const updColors = { green:"#22c55e", blue:"#3b82f6", yellow:"#ffc300", purple:"#a855f7" };
const updBg     = { green:"rgba(34,197,94,.12)",blue:"rgba(59,130,246,.12)",yellow:"rgba(255,195,0,.12)",purple:"rgba(168,85,247,.12)" };
const updIcons  = {
  green:  '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  blue:   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  yellow: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  purple: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
};
document.getElementById('updatesList').innerHTML = updatesData.map(u => `
  <div class="update-card">
    <div class="upd-icon" style="background:${updBg[u.sc]};border-color:${updColors[u.sc]}33">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${updColors[u.sc]}" stroke-width="2">${updIcons[u.sc]}</svg>
    </div>
    <div style="flex:1;min-width:0">
      <div class="upd-title">${u.title}</div>
      <div class="upd-desc">${u.desc}</div>
    </div>
    <span class="upd-time">${u.time}</span>
  </div>`).join('');

// ═══════════════════════════════════════════════════
//         CATEGORIES PROGRESS BARS (ANALYTICS)
// ═══════════════════════════════════════════════════
const cats = [
  { cat:"Infraestrutura", total:380, pct:31 },
  { cat:"Iluminação",     total:245, pct:20 },
  { cat:"Água",           total:198, pct:16 },
  { cat:"Limpeza",        total:167, pct:13 },
  { cat:"Trânsito",       total:142, pct:11 },
  { cat:"Saneamento",     total:108, pct:9  },
];
document.getElementById('categoriesChart').innerHTML = cats.map(c => `
  <div class="progress-bar-wrap">
    <span class="progress-label">${c.cat}</span>
    <div class="progress-track"><div class="progress-fill" style="width:${c.pct}%"></div></div>
    <span class="progress-num">${c.total}</span>
    <span class="progress-pct">${c.pct}%</span>
  </div>`).join('');

// ═══════════════════════════════════════════════════
//              SVG CHARTS
// ═══════════════════════════════════════════════════

// Helpers
function lerp(a, b, t) { return a + (b - a) * t; }
function scaleY(v, min, max, h) { return h - ((v - min) / (max - min)) * h; }

// ── AREA CHART (Dashboard)
(function() {
  const data = [
    { m:"Jan", d:42, r:35 }, { m:"Fev", d:58, r:48 }, { m:"Mar", d:67, r:60 },
    { m:"Abr", d:52, r:44 }, { m:"Mai", d:80, r:71 }, { m:"Jun", d:93, r:82 },
    { m:"Jul", d:75, r:68 }, { m:"Ago",d:110, r:95 }, { m:"Set", d:98, r:89 },
    { m:"Out",d:120,r:107 }, { m:"Nov",d:107, r:95 }, { m:"Dez",d:134,r:120 },
  ];
  const W=700,H=150,PL=10,PR=10,PT=8,PB=22;
  const cW=W-PL-PR, cH=H-PT-PB;
  const n=data.length;
  const allVals=data.flatMap(d=>[d.d,d.r]);
  const minV=0, maxV=Math.ceil(Math.max(...allVals)/20)*20;
  const px=i=>PL + (i/(n-1))*cW;
  const py=v=>PT + scaleY(v,minV,maxV,cH);

  // Grid lines
  let grid='';
  for(let g=0;g<=4;g++){
    const y=PT+g*(cH/4);
    const label=Math.round(maxV-(g/4)*maxV);
    grid+=`<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`;
    grid+=`<text x="2" y="${y+4}" fill="rgba(255,255,255,.3)" font-size="9" font-family="Inter">${label}</text>`;
  }

  // Paths
  const makePath=key=>{
    let d='M';
    data.forEach((p,i)=>{
      const x=px(i),y=py(p[key]);
      if(i===0)d+=`${x},${y}`;
      else{const cx=(px(i)+px(i-1))/2;d+=` C${cx},${py(data[i-1][key])} ${cx},${y} ${x},${y}`;}
    });
    return d;
  };
  const makeArea=key=>{
    const p=makePath(key);
    return p+` L${px(n-1)},${H-PB} L${px(0)},${H-PB} Z`;
  };

  // Month labels
  let labels='';
  data.forEach((p,i)=>{
    labels+=`<text x="${px(i)}" y="${H-4}" text-anchor="middle" fill="rgba(255,255,255,.3)" font-size="9" font-family="Inter">${p.m}</text>`;
  });

  const uid=Date.now();
  document.getElementById('areaChart').innerHTML=`
    <defs>
      <linearGradient id="gD${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffc300" stop-opacity=".25"/>
        <stop offset="100%" stop-color="#ffc300" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gR${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#22c55e" stop-opacity=".2"/>
        <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${makeArea('d')}" fill="url(#gD${uid})" stroke="none"/>
    <path d="${makeArea('r')}" fill="url(#gR${uid})" stroke="none"/>
    <path d="${makePath('d')}" fill="none" stroke="#ffc300" stroke-width="2" stroke-linecap="round"/>
    <path d="${makePath('r')}" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    ${labels}`;
})();

// ── DONUT (Dashboard)
(function() {
  const total=780+320+140;
  const circ=2*Math.PI*32;
  const vals=[
    { id:'donut-green', v:780, c:'#22c55e' },
    { id:'donut-yellow',v:320, c:'#ffc300' },
    { id:'donut-blue',  v:140, c:'#3b82f6' },
  ];
  let offset=0;
  vals.forEach(({id,v,c})=>{
    const arc=(v/total)*circ;
    const gap=circ-arc;
    const el=document.getElementById(id);
    el.setAttribute('stroke-dasharray',`${arc} ${gap}`);
    el.setAttribute('stroke-dashoffset',-offset);
    offset+=arc;
  });
})();

// ── BAR CHART (Analytics)
(function() {
  const data=[
    {m:'Jan',d:42,r:35},{m:'Fev',d:58,r:48},{m:'Mar',d:67,r:60},
    {m:'Abr',d:52,r:44},{m:'Mai',d:80,r:71},{m:'Jun',d:93,r:82},
  ];
  const W=600,H=200,PL=12,PR=10,PT=10,PB=24;
  const cW=W-PL-PR,cH=H-PT-PB;
  const maxV=120,n=data.length;
  const gw=cW/n,bw=gw*0.35;

  let bars='',labels='',grid='';
  for(let g=0;g<=3;g++){
    const y=PT+g*(cH/3);
    grid+=`<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`;
    grid+=`<text x="2" y="${y+4}" fill="rgba(255,255,255,.25)" font-size="8" font-family="Inter">${Math.round(maxV-(g/3)*maxV)}</text>`;
  }
  data.forEach((p,i)=>{
    const cx=PL+(i+0.5)*gw;
    const dH=(p.d/maxV)*cH, rH=(p.r/maxV)*cH;
    bars+=`<rect x="${cx-bw-2}" y="${PT+cH-dH}" width="${bw}" height="${dH}" fill="#ffc300" rx="3"/>`;
    bars+=`<rect x="${cx+2}" y="${PT+cH-rH}" width="${bw}" height="${rH}" fill="#22c55e" rx="3"/>`;
    labels+=`<text x="${cx}" y="${H-5}" text-anchor="middle" fill="rgba(255,255,255,.3)" font-size="9" font-family="Inter">${p.m}</text>`;
  });
  document.getElementById('barChart').innerHTML=grid+bars+labels;
})();

// ── LINE CHART (Analytics)
(function() {
  const data=[
    {m:'Jan',v:3.2},{m:'Fev',v:2.9},{m:'Mar',v:2.7},
    {m:'Abr',v:3.1},{m:'Mai',v:2.5},{m:'Jun',v:2.3},
  ];
  const W=300,H=200,PL=20,PR=10,PT=10,PB=24;
  const cW=W-PL-PR,cH=H-PT-PB;
  const minV=2.0,maxV=3.5,n=data.length;
  const px=i=>PL+(i/(n-1))*cW;
  const py=v=>PT+scaleY(v,minV,maxV,cH);

  let grid='',labels='';
  for(let g=0;g<=3;g++){
    const y=PT+g*(cH/3);
    const lv=(maxV-(g/3)*(maxV-minV)).toFixed(1);
    grid+=`<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`;
    grid+=`<text x="2" y="${y+4}" fill="rgba(255,255,255,.25)" font-size="8" font-family="Inter">${lv}</text>`;
  }
  let path='M';
  data.forEach((p,i)=>{
    const x=px(i),y=py(p.v);
    if(i===0)path+=`${x},${y}`;
    else{const cx=(px(i)+px(i-1))/2;path+=` C${cx},${py(data[i-1].v)} ${cx},${y} ${x},${y}`;}
    labels+=`<text x="${x}" y="${H-5}" text-anchor="middle" fill="rgba(255,255,255,.3)" font-size="9" font-family="Inter">${p.m}</text>`;
  });
  const uid2=Date.now()+'l';
  const area=path+` L${px(n-1)},${H-PB} L${px(0)},${H-PB} Z`;
  data.forEach((p,i)=>{
    grid+=`<circle cx="${px(i)}" cy="${py(p.v)}" r="3.5" fill="#3b82f6"/>`;
    grid+=`<circle cx="${px(i)}" cy="${py(p.v)}" r="6" fill="#3b82f6" opacity=".15"/>`;
  });
  document.getElementById('lineChart').innerHTML=`
    <defs>
      <linearGradient id="gL${uid2}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity=".2"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${area}" fill="url(#gL${uid2})" stroke="none"/>
    <path d="${path}" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
    ${labels}`;
})();

// Função para abrir o modal
    function abrirModal() {
      document.getElementById('modalFormulario').style.display = 'flex';
    }

    // Função para fechar o modal
    function fecharModal() {
      document.getElementById('modalFormulario').style.display = 'none';
    }

    // Fechar modal ao clicar fora dele
    window.onclick = function(event) {
      const modal = document.getElementById('modalFormulario');
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    }

    // Inicializar contador ao carregar a página
    function inicializarContador() {
      if (!localStorage.getItem('formulariosEnviados')) {
        localStorage.setItem('formulariosEnviados', '0');
      }
      atualizarContador();
    }

    // Função para atualizar o contador
    function atualizarContador() {
      const contador = localStorage.getItem('formulariosEnviados') || '0';
      document.getElementById('contador').textContent = contador;
    }

    // Escutar o envio do formulário
    document.getElementById('meuFormulario').addEventListener('submit', function(e) {
      e.preventDefault();

      // Obter o contador atual
      let contador = parseInt(localStorage.getItem('formulariosEnviados')) || 0;

      // Incrementar o contador
      contador++;

      // Salvar no localStorage
      localStorage.setItem('formulariosEnviados', contador);

      // Limpar o formulário
      this.reset();

      // Atualizar contador na página
      atualizarContador();

      // Mostrar mensagem de sucesso
      const mensagem = document.getElementById('mensagemSucesso');
      mensagem.textContent = `✓ Denúncia registrada com sucesso! (Total: ${contador})`;
      mensagem.className = 'success';

      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        mensagem.textContent = '';
        fecharModal();
      }, 3000);
    });

    // Inicializar ao carregar
    inicializarContador();

    // Atualizar em tempo real (a cada 500ms) se estiver em abas diferentes
    setInterval(atualizarContador, 500);

    