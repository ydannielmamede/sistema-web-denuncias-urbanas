from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import get_object_or_404, redirect, render

from categoria.models import Categoria
from orgao_alvo.models import OrgaoAlvo

from .models import Denuncia


def denuncia_page(request, server_message=None, server_message_class=''):
    categorias = Categoria.objects.all().order_by('nome_categoria')
    return render(request, 'denuncia/denuncia.html', {
        'categorias': categorias,
        'server_message': server_message,
        'server_message_class': server_message_class,
    })


@login_required(login_url='usuario:login')
def criar_denuncia(request):
    if request.method != 'POST':
        return redirect('denuncia:denuncia')

    categoria_id = request.POST.get('categoria', '').strip()
    mensagem = request.POST.get('mensagem', '').strip()
    localizacao = request.POST.get('localManual', '').strip()
    anonimo = request.POST.get('anonimo') == 'on'

    categorias = Categoria.objects.all().order_by('nome_categoria')
    if not categoria_id:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Selecione uma categoria.',
            'server_message_class': 'error',
        })

    try:
        categoria = Categoria.objects.get(id_categoria=int(categoria_id))
    except (ValueError, Categoria.DoesNotExist):
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Selecione uma categoria válida.',
            'server_message_class': 'error',
        })

    if not mensagem:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Descreva a denúncia.',
            'server_message_class': 'error',
        })

    if not localizacao:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Informe a localização ou preencha o local manual.',
            'server_message_class': 'error',
        })

    orgao_alvo = OrgaoAlvo.objects.filter(categoria=categoria).first()
    if not orgao_alvo:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Nenhum órgão alvo cadastrado para a categoria selecionada.',
            'server_message_class': 'error',
        })

    foto_video = None
    midia_files = request.FILES.getlist('midia')
    if midia_files:
        foto_video = midia_files[0].name

    Denuncia.objects.create(
        mensagem=mensagem,
        foto_video=foto_video,
        anonimo=anonimo,
        localizacao=localizacao,
        id_categoria=categoria,
        id_orgao_alvo=orgao_alvo,
        id_usuario=None if anonimo else request.user,
    )

    return render(request, 'denuncia/denuncia.html', {
        'categorias': categorias,
        'server_message': 'Denúncia registrada com sucesso.',
        'server_message_class': 'success',
    })


def _set_denuncia_status(denuncia, status_code):
    if status_code not in Denuncia.Status.values:
        raise ValueError(f'Status inválido: {status_code}')
    denuncia.status = status_code
    denuncia.save(update_fields=['status'])


def _is_staff_or_admin(user):
    return user.is_authenticated and user.is_staff


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_pendente(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:denuncia')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.PENDENTE)
    return redirect('denuncia:denuncia')


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_em_analise(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:denuncia')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.EM_ANALISE)
    return redirect('denuncia:denuncia')


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_resolvida(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:denuncia')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.RESOLVIDA)
    return redirect('denuncia:denuncia')
