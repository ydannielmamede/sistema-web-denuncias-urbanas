from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .models import Usuario


def cadastrar_usuario(request):
    if request.method == "POST":
        nome = request.POST.get("nome", "").strip()
        email = request.POST.get("email", "").strip().lower()
        cpf = request.POST.get("cpf", "").strip()
        telefone = request.POST.get("telefone", "").strip()
        nascimento = request.POST.get("nascimento", "").strip()
        genero = request.POST.get("genero", "").strip()
        senha = request.POST.get("senha", "")
        repetir_senha = request.POST.get("repetir_senha", "")
        termos = request.POST.get("termos")

        contexto = {
            "nome": nome,
            "email": email,
            "cpf": cpf,
            "telefone": telefone,
            "nascimento": nascimento,
            "genero": genero,
        }

        # Validações locais
        if not all([nome, email, cpf, telefone, nascimento, senha]):
            messages.error(request, "Preencha todos os campos.")
            return render(request, "usuario/cadastro.html", contexto)

        if not termos:
            messages.error(request, "Você precisa aceitar os termos.")
            return render(request, "usuario/cadastro.html", contexto)

        if senha != repetir_senha:
            messages.error(request, "As senhas não coincidem.")
            return render(request, "usuario/cadastro.html", contexto)

        # Validações no banco
        if Usuario.objects.filter(email=email).exists():
            messages.error(request, "Email já cadastrado.")
            return render(request, "usuario/cadastro.html", contexto)

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

        messages.success(request, "Cadastro realizado com sucesso!")
        return redirect("usuario:login")

    return render(request, "usuario/cadastro.html")


def login_usuario(request):
    if request.method == "POST":
        email = request.POST.get("email", "").strip().lower()
        senha = request.POST.get("senha", "")

        if not all([email, senha]):
            messages.error(request, "Preencha todos os campos.")
            return render(request, "usuario/login.html")

        # username=email porque cadastramos assim
        user = authenticate(request, username=email, password=senha)

        if user:
            login(request, user)
            return redirect("index")

        messages.error(request, "Email ou senha inválidos.")

    return render(request, "usuario/login.html")


def logout_usuario(request):
    logout(request)  # limpa a sessão corretamente
    return redirect("index")
