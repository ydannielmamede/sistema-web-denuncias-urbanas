# Sistema-Web-de-Denuncias-Urbanas
Projeto do Curso de Desenvolvedor Ful Stack do Senac

Modificações

Possíveis TypeError:
Linha 398 -     document.getElementById('meuFormulario').addEventListener('submit', function(e) {
    Uncaught TypeError: can't access property "addEventListener", document.getElementById(...) is null
    GET
http://127.0.0.1:5500/favicon.ico
[HTTP/1.1 404 Not Found 0ms]
====================================================================================================================================
Relatórios_Dashboards - Versão 1:

<!DOCTYPE html>
<html lang="pt-br">

<head>
	
  <link rel="stylesheet" href="/CSS/Rel_dash.css">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Admnistração</title>

</head>

<body>
 
<!-- ==================================================
            	    Sidebar - Navegação 
======================================================= -->

  <aside id="sidebar">
	<h3>Logistica</h3>
	<nav>
  	<ul>
		<p><a href="#">Painel</a></li>
    	<p><a href="#">Relatório</a></li>
    	<p><a href="#">Contas</a></li>
    	<p><a href="#">Atualizações</a></li>
    	<p><a href="#">Analises</a></li>
    	<p><a href="#">Configuração</a></li>
  	</ul>
	</nav>
  </aside>
 
<!-- ==================================================
            	    Área Principal 
======================================================= -->
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





