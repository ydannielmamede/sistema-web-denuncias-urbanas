       function inicializarContador() {
            if (!localStorage.getItem('formulariosEnviados')) {
                localStorage.setItem('formulariosEnviados', '0');
            }
        }

        // Escutar o envio do formulário
        document.getElementById('meuFormulario').addEventListener('submit', function(e) {
            e.preventDefault(); // Evitar recarregar a página

            // Obter o contador atual
            let contador = parseInt(localStorage.getItem('formulariosEnviados')) || 0;

            // Incrementar o contador
            contador++;

            // Salvar no localStorage
            localStorage.setItem('formulariosEnviados', contador);

            // Limpar o formulário
            this.reset();

            // Mostrar mensagem de sucesso
            const mensagem = document.getElementById('mensagem');
            mensagem.textContent = `✓ Formulário enviado com sucesso! (Total: ${contador})`;
            mensagem.className = 'success';

            // Limpar mensagem após 3 segundos
            setTimeout(() => {
                mensagem.textContent = '';
            }, 3000);
        });

        // Inicializar ao carregar
        inicializarContador();