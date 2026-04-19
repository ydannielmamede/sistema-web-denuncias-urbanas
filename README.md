# Sistema Web de Denúncias Urbanas

Projeto do Curso de Desenvolvedor Full Stack do Senac

## 1. Nome do Projeto
Sistema Web de Denúncias Urbanas

## 2. Problema
Muitos problemas urbanos como buracos nas ruas, acúmulo de lixo, iluminação pública quebrada e alagamentos não são reportados de forma eficiente pela população. Em muitos casos, os cidadãos não sabem qual órgão público é responsável ou o processo de denúncia é burocrático.

Usuários tentam reportar problemas por canais não oficiais, como comentários em buscas ou redes sociais, o que reduz a efetividade do atendimento e dificulta o rastreamento das ocorrências.

Isso faz com que diversos problemas permaneçam sem solução por muito tempo, prejudicando a mobilidade, a segurança e a qualidade de vida nas cidades.

### 2.1 Tentativas de denúncia
As imagens abaixo ilustram exemplos reais de tentativas de denúncia realizadas em canais informais, como comentários em buscas ou postagens de redes sociais.

![Tentativa de denúncia na seção de comentários do Google](img/2026-04-18-201559_hyprshot.png)

![Tentativa de denúncia na seção de comentários do Instagram](img/2026-04-18-201647_hyprshot.png)

![Exemplo de denúncia feita em área de comentários de rede social](img/2026-04-18-204204_hyprshot.png)

![Tentativa de relatório de problema urbano por postagem social](img/2026-04-18-204613_hyprshot.png)

## 3. Objetivo do Projeto
Desenvolver uma aplicação web full stack que permita que cidadãos registrem ocorrências urbanas de forma simples, rápida e organizada, enviando evidências como fotos e vídeos junto com a localização do problema.

O sistema permitirá que essas ocorrências sejam direcionadas aos órgãos públicos responsáveis, facilitando a comunicação entre população e administração pública.

## 4. Público-Alvo
- Cidadãos que desejam reportar problemas urbanos
- Prefeituras e órgãos municipais
- Secretarias de infraestrutura urbana
- Órgãos responsáveis por limpeza, iluminação e manutenção urbana

## 5. Funcionalidades Principais
- Criar conta de usuário
- Enviar denúncia ou ocorrência urbana
- Adicionar fotos ou vídeos do problema
- Capturar geolocalização do local da ocorrência
- Escolher categoria do problema (lixo, buraco, iluminação, alagamento, etc)
- Enviar denúncia de forma anônima ou identificada
- Acompanhar o status da ocorrência

## 6. Requisitos

### 6.1 Requisitos Funcionais
1. **RF001** O sistema deve permitir que o usuário registre uma denúncia urbana com descrição e localização.
2. **RF002** O sistema deve permitir escolher uma categoria para a denúncia, como lixo, buraco, iluminação ou alagamento.
3. **RF003** O sistema deve capturar automaticamente a geolocalização do local da ocorrência.
4. **RF004** O sistema deve permitir anexar fotos ou vídeos à denúncia.
5. **RF005** O sistema deve permitir enviar denúncias de forma anônima ou identificada.
6. **RF006** O sistema deve permitir acompanhar o status da ocorrência após o envio.
7. **RF007** O sistema deve permitir autenticação de usuário e gerenciamento de conta.

### 6.2 Requisitos Não Funcionais
1. **RNF001** A interface deve ser responsiva e acessível em dispositivos móveis e desktops.
2. **RNF002** O tempo de carregamento das páginas principais deve ser inferior a 2 segundos em conexões móveis médias.
3. **RNF003** Os dados do usuário e das denúncias devem ser armazenados de forma segura.
4. **RNF004** O sistema deve oferecer disponibilidade contínua para consultas e envios durante horário de atendimento municipal.

## 7. Tecnologias (Stack)
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** #
  <main>
	<header class="has-image">
  	<button onclick="toggleSidebar()">☰</button>
  	<h2>Dashboard/Painel</h2>
  	<button id="darkModeToggle" onclick="toggleDarkMode()">🌙</button>
	</header>

<!-- ==================================================
            	    Cards  
======================================================= -->
<main class="main">
	
<header class="topbar">
        <!-- search + icons -->
      </header>
      <section class="dashboard"> 
		  <section class="cards">
			  <div class="card">Usuários Ativos<br><strong>3</strong></div>
			  <div class="card">Quantidade de Usuários<br><strong>1</strong></div>
			  <div class="card">Relatórios<br><strong>8</strong></div>
			  <div class="card">Taxa de resposta<br><strong>99.7%</strong></div>
			</section>
		</section>
</main>

<!-- ==================================================
            		    Gráficos 
======================================================= -->
	<section>
		<div class="card">
			<h3>Visão Geral</h3>
			<svg></svg>

		</div>

		 <div class="card">
			<h4></h4>
			<ul class="">

			</ul>
	</section>
  </main>
 
<!-- ==================================================
            	    Funcionalidade 
======================================================= -->
  <script src="/JavaScript/Rel_Dash.js"></script>
 
</body>
</html>


CSS:

	* { 
        box-sizing: 
        border-box; 
        margin: 0; 
        font-family: system-ui, -apple-system, sans-serif; 
    }

	html { 
        transition: background 0.3s, color 0.3s; 
    }
	body { 
        display: flex; 
        min-height: 100vh; 
        background: #f2f3f5; 
        overflow-x: hidden; 
    }
 
/* ====================================================
                        Sidebar 
======================================================= */

	aside {
     width: 240px; 
     background: #ffffff; 
     border-right: 1px solid #e1e1e1; 
     transition: transform .3s; 
    }
	aside.collapsed { 
        transform: translateX(-100%); 
    }
 
/* ====================================================
                    Conteúdo Principal 
=======================================================*/

	main { 
        flex: 1; 
        display: flex; 
        flex-direction: column; 
    }
 
/* ====================================================
                        Header 
=======================================================*/

	header { 
        display: flex; 
        align-items: center; 
        gap: 16px; 
        padding: 16px 24px; 
        position: sticky; 
        top: 0; 
    }

	header.has-image { 
        background: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url('header-image.jpg'); 
        color: #fff; 
    }
 
/* ====================================================
                    Painel dos Cards 
=======================================================*/

	.cards { 
        display: grid; 
        grid-template-columns: repeat(4,1fr); 
        gap: 16px; 
        padding: 24px; 
    }

	.card,.panel {
        background: #fff; 
        border: 1px solid #e4e4e4; 
        padding: 16px; 
        border-radius: 8px; 
    }
 
/* ====================================================
                    Modo Escuro 
=======================================================*/

	.dark body { 
        background: #121212; 
        color: #fff; 
    }
	.dark aside,.dark .card,.dark .panel { 
        background: #1e1e1e; 
        border-color: #333; 
    }
 
/* =======================================================
                    Responsividade 
=======================================================*/

	@media(max-width:1199px){ 
        .cards{
            grid-template-columns:repeat(2,1fr)
        } }

	@media(max-width:767px){ 
        aside{position:fixed;height:100%
        }
        .cards{grid-template-columns:1fr
        } }


JAVASCRIPT:

	function toggleSidebar(){ 
        document.getElementById('sidebar').classList.toggle('collapsed'); 
    }
// ==================================================
//             	Modo Escuro - Navegação 
// ==================================================
	const root=document.documentElement;
	const btn=document.getElementById('darkModeToggle');
	const saved=localStorage.getItem('theme');
	if(saved==='dark'){ 
        root.classList.add('dark'); btn.textContent='☀️'; 
    }
	function toggleDarkMode(){ 
        const isDark=root.classList.toggle('dark'); 
        localStorage.setItem('theme',isDark?'dark':'light'); 
        btn.textContent=isDark?'☀️':'🌙'; 
    }





