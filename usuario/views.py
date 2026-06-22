from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .models import Usuario


def cadastrar_usuario(request):
    # Verifica se o método da requisição é POST
    if request.method == "POST":
        # Obtém os dados do formulário
        nome = request.POST.get("nome", "").strip()
        email = request.POST.get("email", "").strip().lower()
        cpf = request.POST.get("cpf", "").strip()
        telefone = request.POST.get("telefone", "").strip()
        nascimento = request.POST.get("nascimento", "").strip()
        genero = request.POST.get("genero", "").strip()
        senha = request.POST.get("senha", "")
        repetir_senha = request.POST.get("repetir_senha", "")
        termos = request.POST.get("termos")

        # Cria um contexto com os dados do formulário
        contexto = {
            "nome": nome,
            "email": email,
            "cpf": cpf,
            "telefone": telefone,
            "nascimento": nascimento,
            "genero": genero,
        }

        # Validações locais
        # Verifica se todos os campos obrigatórios foram preenchidos
        if not all([nome, email, cpf, telefone, nascimento, senha]):
            messages.error(request, "Preencha todos os campos.")
            return render(request, "usuario/cadastro.html", contexto)

        # Verifica se o usuário aceitou os termos
        if not termos:
            messages.error(request, "Você precisa aceitar os termos.")
            return render(request, "usuario/cadastro.html", contexto)

        # Verifica se as senhas coincidem
        if senha != repetir_senha:
            messages.error(request, "As senhas não coincidem.")
            return render(request, "usuario/cadastro.html", contexto)

        # Validações no banco
        # Verifica se o email já está cadastrado
        if Usuario.objects.filter(email=email).exists():
            messages.error(request, "Email já cadastrado.")
            return render(request, "usuario/cadastro.html", contexto)

        # Verifica se o CPF já está cadastrado
        if Usuario.objects.filter(cpf=cpf).exists():
            messages.error(request, "CPF já cadastrado.")
            return render(request, "usuario/cadastro.html", contexto)

        # Cria o usuário com hash de senha automático
        Usuario.objects.create_user(
            username=email,  # usa email como username
            email=email,
            password=senha,  # já faz o hash automaticamente
            first_name=nome,
            cpf=cpf,
            telefone=telefone,
            nascimento=nascimento,
            genero=genero,
        )

        # Exibe mensagem de sucesso e redireciona para a página de login
        messages.success(request, "Cadastro realizado com sucesso!")
        return redirect("usuario:login")

    # Renderiza a página de cadastro
    return render(request, "usuario/cadastro.html")


def login_usuario(request):
    # Verifica se o método da requisição é POST
    if request.method == "POST":
        # Obtém os dados do formulário
        email = request.POST.get("email", "").strip().lower()
        senha = request.POST.get("senha", "")

        # Verifica se todos os campos obrigatórios foram preenchidos
        if not all([email, senha]):
            messages.error(request, "Preencha todos os campos.")
            return render(request, "usuario/login.html")

        # Autentica o usuário
        # username=email porque cadastramos assim
        user = authenticate(request, username=email, password=senha)

        # Verifica se o usuário foi autenticado com sucesso
        if user:
            login(request, user)
            return redirect("index")

        # Exibe mensagem de erro se o email ou senha for inválido
        messages.error(request, "Email ou senha inválidos.")

    # Renderiza a página de login
    return render(request, "usuario/login.html")


def logout_usuario(request):
    # Limpa a sessão corretamente
    logout(request)
    # Redireciona para a página inicial
    return redirect("index")

