from pyexpat.errors import messages

from django.shortcuts import render, redirect
from .models import Usuario

def cadastrar_usuario(request):
    if request.method == 'POST':
        # 🔹 Pegando dados do formulário
        nome = request.POST.get('nome')
        email = request.POST.get('email')
        cpf = request.POST.get('cpf')
        telefone = request.POST.get('telefone')
        nascimento = request.POST.get('nascimento')
        genero = request.POST.get('genero')
        senha = request.POST.get('senha')
        repetir_senha = request.POST.get('repetir_senha')
        termos = request.POST.get('termos')

        # 🔹 Validação básica
        if not all([nome, email, cpf, telefone, nascimento, senha]):
            return render(request, 'cadastro.html', {
              messages.error(request, 'Preencha todos os campos obrigatórios.') 
                # 'erro': 'Preencha todos os campos obrigatórios.'
            })

        if not termos:
            return render(request, 'cadastro.html', {
                'erro': 'Você precisa aceitar os termos.'
            })

        # 🔹 Verifica se já existe usuário
        if Usuario.objects.filter(email=email).exists():
            return render(request, 'cadastro.html', {
                'erro': 'Email já cadastrado.'
            })

        if Usuario.objects.filter(cpf=cpf).exists():
            return render(request, 'cadastro.html', {
                'erro': 'CPF já cadastrado.'
            })
        if senha != repetir_senha:
            return render(request, 'cadastro.html', {
                'erro': 'As senhas não coincidem.'
         })

        # 🔹 Criando o usuário
        Usuario.objects.create(
            nome=nome,
            email=email,
            cpf=cpf,
            telefone=telefone,
            nascimento=nascimento,
            genero=genero,
            senha=senha,
            perfil_id_id=1  # ⚠️ Ajuste conforme seu banco
        )

        # 🔹 Redireciona para login
        return redirect('login')

    # 🔹 Se for GET (abrir página)
    return render(request, 'cadastro.html')