from decimal import Decimal, InvalidOperation
import hashlib
# import threading  # Reativar junto com o envio de e-mails.

from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.cache import cache
from django.core.paginator import Paginator
# from django.core.mail import EmailMessage  # Reativar junto com o envio de e-mails.
from django.db.models import Count, Q
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme
from django.utils.timesince import timesince

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


@login_required(login_url='usuario:login')
def denuncia_page(request, server_message=None, server_message_class=''):
    categorias = _get_categorias_com_orgao()
    return render(request, 'denuncia/denuncia.html', {
        'categorias': categorias,
        'categoria_selecionada': request.GET.get('categoria', ''),
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
    todas_page = Paginator(todas_denuncias, 6).get_page(request.GET.get('todas_page'))
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
        minhas_page = Paginator(minhas_denuncias, 6).get_page(request.GET.get('minhas_page'))

    return render(request, 'denuncia/listar_denuncias.html', {
        'todas_denuncias': todas_page,
        'minhas_denuncias': minhas_page,
        'categorias': categorias,
        'categoria_selecionada': categoria_id,
        'categoria_query': f'&categoria={categoria_id}' if filtro_categoria else '',
        'denuncias_mapa': denuncias_mapa,
    })


def _paginator_por_painel(request, painel):
    """Resolve a queryset paginada para o painel ('todas' ou 'minhas').

    Reaproveita exatamente a lógica de filtro/categoria/paginação do
    `listar_denuncias`, devolvendo ``(page_obj, categoria_query, empty_message)``.
    """
    categoria_id = request.GET.get('categoria', '').strip()
    categorias = Categoria.objects.all().order_by('nome_categoria')
    filtro_categoria = {}
    if categoria_id.isdigit() and categorias.filter(id_categoria=categoria_id).exists():
        filtro_categoria['id_categoria_id'] = categoria_id
    categoria_query = f'&categoria={categoria_id}' if filtro_categoria else ''

    base_qs = Denuncia.objects.select_related(
        'id_categoria', 'id_orgao_alvo', 'id_usuario',
    ).order_by('-data_hora')

    if painel == 'minhas':
        if not request.user.is_authenticated:
            return None, categoria_query, 'Faça login para ver suas denúncias.'
        qs = base_qs.filter(id_usuario=request.user, anonimo=False, **filtro_categoria)
        page_param = 'minhas_page'
        empty_message = 'Você ainda não registrou denúncias identificadas.'
    else:
        qs = base_qs.filter(**filtro_categoria)
        page_param = 'todas_page'
        empty_message = 'Nenhuma denúncia registrada até o momento.'

    page_obj = Paginator(qs, 6).get_page(request.GET.get('page'))
    return page_obj, categoria_query, empty_message


def listar_denuncias_page(request):
    """Devolve o HTML do painel solicitado para troca de página via AJAX."""
    painel = request.GET.get('painel', 'todas')
    if painel not in {'todas', 'minhas'}:
        return HttpResponseBadRequest('Painel inválido.')

    page_obj, categoria_query, empty_message = _paginator_por_painel(request, painel)
    if page_obj is None:
        return HttpResponseBadRequest('Autenticação necessária.')

    return render(request, 'denuncia/partials/_painel_denuncias.html', {
        'page_obj': page_obj,
        'painel': painel,
        'categoria_query': categoria_query,
        'empty_message': empty_message,
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
    # Envio de e-mail desativado.
    # if not orgao_alvo.email_orgao:
    #     return render(request, 'denuncia/denuncia.html', {
    #         'categorias': categorias,
    #         'server_message': 'Categoria sem e-mail de órgão cadastrado.',
    #         'server_message_class': 'error',
    #     })
    #
    # email = EmailMessage(
    #     subject=f'Nova denúncia: {categoria.nome_categoria}',
    #     body=f'Uma nova denúncia foi registrada.\n\nMensagem: {mensagem}\nLocal: {localizacao}',
    #     from_email=None,  # usa o DEFAULT_FROM_EMAIL
    #     to=[orgao_alvo.email_orgao],
    # )
    #
    # for arquivo in (a for a in fotos if a):
    #     arquivo.seek(0)
    #     email.attach(arquivo.name, arquivo.read(), arquivo.content_type)
    #
    # def enviar_email_denuncia():
    #     try:
    #         email.send(fail_silently=False)
    #     except Exception as exc:
    #         import logging
    #         logging.getLogger(__name__).exception('Falha ao enviar e-mail: %s', exc)
    #
    # threading.Thread(target=enviar_email_denuncia, daemon=True).start()

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


def _status_counts(qs):
    return qs.aggregate(
        total=Count('id_denuncia'),
        pendentes=Count('id_denuncia', filter=Q(status=Denuncia.Status.PENDENTE)),
        em_analise=Count('id_denuncia', filter=Q(status=Denuncia.Status.EM_ANALISE)),
        resolvidas=Count('id_denuncia', filter=Q(status=Denuncia.Status.RESOLVIDA)),
    )


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def dashboard(request):
    qs = Denuncia.objects.all()
    counts = _status_counts(qs)
    denuncias_qs = qs.select_related('id_categoria', 'id_orgao_alvo', 'id_usuario').order_by('-data_hora')
    denuncias_page = Paginator(denuncias_qs, 5).get_page(request.GET.get('page'))
    # Garante que a tabela exiba sempre 5 linhas: preenche com placeholders
    # quando a página tem menos denúncias, evitando que as existentes estiquem.
    denuncias_vazias = range(5 - len(denuncias_page))
    atividades = []
    for denuncia in denuncias_qs[:4]:
        autor = denuncia.id_usuario.username if denuncia.id_usuario else 'Anônimo'
        atividades.append({
            'avatar_inicial': (autor[:1] or 'A').upper(),
            'cor': '#3b82f6' if denuncia.id_usuario else '#a855f7',
            'nome': autor,
            'desc': f'Nova denúncia - {denuncia.id_categoria.nome_categoria}',
            'tempo': f'{timesince(denuncia.data_hora)} atrás',
        })

    return render(request, 'denuncia/dashboard.html', {
        **counts,
        'denuncias_page': denuncias_page,
        'denuncias_vazias': denuncias_vazias,
        'atividades': atividades,
    })


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def dashboard_denuncias_page(request):
    """Retorna só as linhas + paginação para atualizar a tabela via fetch."""
    qs = (
        Denuncia.objects
        .select_related('id_categoria', 'id_orgao_alvo', 'id_usuario')
        .order_by('-data_hora')
    )
    status = request.GET.get('status')
    if status in Denuncia.Status.values:
        qs = qs.filter(status=status)

    page = Paginator(qs, 5).get_page(request.GET.get('page'))
    rows = [
        {
            'id': d.id_denuncia,
            'mensagem': d.mensagem,
            'categoria': d.id_categoria.nome_categoria,
            'localizacao': d.localizacao or '—',
            'data': d.data_hora.strftime('%d/%m'),
            'status': d.status,
            'urls': {
                'pendente': reverse('denuncia:marcar_status_pendente', args=[d.id_denuncia]),
                'em_analise': reverse('denuncia:marcar_status_em_analise', args=[d.id_denuncia]),
                'resolvida': reverse('denuncia:marcar_status_resolvida', args=[d.id_denuncia]),
            },
        }
        for d in page
    ]
    pagination = [
        {'num': p, 'active': p == page.number}
        for p in page.paginator.page_range
    ]
    return JsonResponse({
        'rows': rows,
        'pagination': pagination,
        'total': page.paginator.count,
        'showing': len(rows),
        'current': page.number,
    })


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def dashboard_dados(request):
    qs = Denuncia.objects.all()
    year = timezone.localdate().year
    mensal_por_mes = {}
    for data_hora, status in qs.filter(data_hora__year=year).values_list('data_hora', 'status'):
        if data_hora is None:
            continue
        bucket = mensal_por_mes.setdefault(data_hora.month, {'abertas': 0, 'resolvidas': 0})
        bucket['abertas'] += 1
        bucket['resolvidas'] += int(status == Denuncia.Status.RESOLVIDA)
    por_categoria = (
        qs.values('id_categoria__nome_categoria')
        .annotate(total=Count('id_denuncia'))
        .order_by('-total')[:8]
    )
    counts = _status_counts(qs)

    return JsonResponse({
        'counts': counts,
        'mensal': [
            {
                'mes': f'{year}-{month:02d}',
                'abertas': mensal_por_mes.get(month, {}).get('abertas', 0),
                'resolvidas': mensal_por_mes.get(month, {}).get('resolvidas', 0),
            }
            for month in range(1, 13)
        ],
        'por_categoria': list(por_categoria),
        'status': {
            'P': counts['pendentes'],
            'A': counts['em_analise'],
            'R': counts['resolvidas'],
        },
    })


def _status_redirect(request):
    next_url = request.META.get('HTTP_REFERER')
    if next_url and url_has_allowed_host_and_scheme(next_url, {request.get_host()}):
        return redirect(next_url)
    return redirect(reverse('denuncia:dashboard'))


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_pendente(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:dashboard')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.PENDENTE)
    if request.headers.get('X-Requested-With') == 'fetch':
        return _dashboard_status_json()
    return _status_redirect(request)


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_em_analise(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:dashboard')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.EM_ANALISE)
    if request.headers.get('X-Requested-With') == 'fetch':
        return _dashboard_status_json()
    return _status_redirect(request)


@user_passes_test(_is_staff_or_admin, login_url='usuario:login')
def marcar_status_resolvida(request, id_denuncia):
    if request.method != 'POST':
        return redirect('denuncia:dashboard')

    denuncia = get_object_or_404(Denuncia, id_denuncia=id_denuncia)
    _set_denuncia_status(denuncia, Denuncia.Status.RESOLVIDA)
    if request.headers.get('X-Requested-With') == 'fetch':
        return _dashboard_status_json()
    return _status_redirect(request)


def _dashboard_status_json():
    """Devolve contagens e a série mensal (ano atual) para o JS atualizar
    os cards e o chart do dashboard sem reload."""
    qs = Denuncia.objects.all()
    year = timezone.localdate().year
    mensal_por_mes = {}
    for data_hora, status in qs.filter(data_hora__year=year).values_list('data_hora', 'status'):
        if data_hora is None:
            continue
        bucket = mensal_por_mes.setdefault(data_hora.month, {'abertas': 0, 'resolvidas': 0})
        bucket['abertas'] += 1
        bucket['resolvidas'] += int(status == Denuncia.Status.RESOLVIDA)
    counts = _status_counts(qs)
    return JsonResponse({
        'counts': counts,
        'mensal': [
            {
                'mes': f'{year}-{month:02d}',
                'abertas': mensal_por_mes.get(month, {}).get('abertas', 0),
                'resolvidas': mensal_por_mes.get(month, {}).get('resolvidas', 0),
            }
            for month in range(1, 13)
        ],
    })
