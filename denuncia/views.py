from decimal import Decimal, InvalidOperation
import hashlib
import threading

from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.cache import cache
from django.core.paginator import Paginator
from django.core.mail import EmailMessage
from django.shortcuts import get_object_or_404, redirect, render

from categoria.models import Categoria
from orgao_alvo.models import OrgaoAlvo

from .models import Denuncia


def _get_categorias_com_orgao():
    categorias = list(Categoria.objects.all().order_by('nome_categoria'))
    orgaos_alvo = OrgaoAlvo.objects.select_related('categoria').all()
    orgaos_por_categoria = {
        orgao.categoria.id_categoria: orgao
        for orgao in orgaos_alvo
    }
    for categoria in categorias:
        setattr(categoria, 'orgao_alvo', orgaos_por_categoria.get(categoria.id_categoria))
    return categorias


def denuncia_page(request, server_message=None, server_message_class=''):
    categorias = _get_categorias_com_orgao()
    return render(request, 'denuncia/denuncia.html', {
        'categorias': categorias,
        'server_message': server_message,
        'server_message_class': server_message_class,
    })


def listar_denuncias(request):
    categoria_id = request.GET.get('categoria', '').strip()
    categorias = Categoria.objects.all().order_by('nome_categoria')
    filtro_categoria = {}
    if categoria_id.isdigit() and categorias.filter(id_categoria=categoria_id).exists():
        filtro_categoria['id_categoria_id'] = categoria_id

    todas_denuncias = (
        Denuncia.objects
        .select_related('id_categoria', 'id_orgao_alvo', 'id_usuario')
        .filter(**filtro_categoria)
        .order_by('-data_hora')
    )
    todas_page = Paginator(todas_denuncias, 9).get_page(request.GET.get('todas_page'))
    denuncias_mapa = [
        {
            'lat': float(denuncia.latitude),
            'lng': float(denuncia.longitude),
            'categoria': denuncia.id_categoria.nome_categoria,
            'icone': denuncia.id_categoria.icone or '📍',
            'cor': denuncia.id_categoria.cor or '#F8C146',
            'status': Denuncia.Status(denuncia.status).label,
            'localizacao': denuncia.localizacao or '',
            'mensagem': denuncia.mensagem,
        }
        for denuncia in todas_denuncias
        if denuncia.latitude is not None and denuncia.longitude is not None
    ]

    minhas_page = None
    if request.user.is_authenticated:
        minhas_denuncias = (
            Denuncia.objects
            .select_related('id_categoria', 'id_orgao_alvo', 'id_usuario')
            .filter(id_usuario=request.user, anonimo=False, **filtro_categoria)
            .order_by('-data_hora')
        )
        minhas_page = Paginator(minhas_denuncias, 9).get_page(request.GET.get('minhas_page'))

    return render(request, 'denuncia/listar_denuncias.html', {
        'todas_denuncias': todas_page,
        'minhas_denuncias': minhas_page,
        'categorias': categorias,
        'categoria_selecionada': categoria_id,
        'categoria_query': f'&categoria={categoria_id}' if filtro_categoria else '',
        'denuncias_mapa': denuncias_mapa,
    })


@login_required(login_url='usuario:login')
def criar_denuncia(request):
    if request.method != 'POST':
        return redirect('denuncia:denuncia')

    categoria_id = request.POST.get('categoria', '').strip()
    mensagem = request.POST.get('mensagem', '').strip()
    localizacao = request.POST.get('localManual', '').strip()
    latitude = request.POST.get('latitude') or None
    longitude = request.POST.get('longitude') or None
    anonimo = request.POST.get('anonimo') == 'on'

    categorias = _get_categorias_com_orgao()
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

    try:
        latitude = Decimal(latitude) if latitude else None
        longitude = Decimal(longitude) if longitude else None
    except InvalidOperation:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Selecione uma localização válida no mapa.',
            'server_message_class': 'error',
        })

    if latitude is not None and not Decimal('-90') <= latitude <= Decimal('90'):
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Selecione uma latitude válida no mapa.',
            'server_message_class': 'error',
        })

    if longitude is not None and not Decimal('-180') <= longitude <= Decimal('180'):
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Selecione uma longitude válida no mapa.',
            'server_message_class': 'error',
        })

    orgao_alvo = OrgaoAlvo.objects.filter(categoria=categoria).first()
    if not orgao_alvo:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Nenhum órgão alvo cadastrado para a categoria selecionada.',
            'server_message_class': 'error',
        })

    fotos = request.FILES.getlist('midia')
    if len(fotos) > 5:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Envie no máximo 5 fotos.',
            'server_message_class': 'error',
        })
    if any(not arquivo.content_type.startswith('image/') for arquivo in fotos):
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Envie apenas fotos.',
            'server_message_class': 'error',
        })

    chave_deduplicacao = hashlib.sha256(
        '|'.join((
            str(request.user.pk),
            categoria_id,
            mensagem,
            localizacao,
            str(latitude),
            str(longitude),
            str(anonimo),
        )).encode()
    ).hexdigest()
    if not cache.add(f'denuncia:{chave_deduplicacao}', True, timeout=60):
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Esta denúncia já está sendo registrada.',
            'server_message_class': 'error',
        })

    fotos = (fotos + [None] * 5)[:5]

    Denuncia.objects.create(
        mensagem=mensagem,
        foto_1=fotos[0],
        foto_2=fotos[1],
        foto_3=fotos[2],
        foto_4=fotos[3],
        foto_5=fotos[4],
        anonimo=anonimo,
        localizacao=localizacao,
        latitude=latitude,
        longitude=longitude,
        id_categoria=categoria,
        id_orgao_alvo=orgao_alvo,
        id_usuario=None if anonimo else request.user,
    )
    email = EmailMessage(
        subject=f'Nova denúncia: {categoria.nome_categoria}',
        body=f'Uma nova denúncia foi registrada.\n\nMensagem: {mensagem}\nLocal: {localizacao}',
        from_email=None,  # usa o DEFAULT_FROM_EMAIL
        to=[orgao_alvo.email_orgao],
    )

    for arquivo in (a for a in fotos if a):
        arquivo.seek(0)
        email.attach(arquivo.name, arquivo.read(), arquivo.content_type)

    if not orgao_alvo.email_orgao:
        return render(request, 'denuncia/denuncia.html', {
            'categorias': categorias,
            'server_message': 'Categoria sem e-mail de órgão cadastrado.',
            'server_message_class': 'error',
        })

    def enviar_email_denuncia():
        try:
            email.send(fail_silently=False)
        except Exception as exc:
            import logging
            logging.getLogger(__name__).exception('Falha ao enviar e-mail: %s', exc)

    threading.Thread(target=enviar_email_denuncia, daemon=True).start()

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
    return user.is_authenticated and (user.is_staff or user.is_superuser)


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_pendente(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:listar_denuncias')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.PENDENTE)
    return redirect('denuncia:listar_denuncias')


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_em_analise(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:listar_denuncias')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.EM_ANALISE)
    return redirect('denuncia:listar_denuncias')


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_resolvida(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:listar_denuncias')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.RESOLVIDA)
    return redirect('denuncia:listar_denuncias')
