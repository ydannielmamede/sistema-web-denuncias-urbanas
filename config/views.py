from django.shortcuts import redirect, render
from django.utils import timezone
from denuncia.models import Denuncia


def index(request):
    if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
        return redirect('denuncia:dashboard')

    denuncias_recentes = Denuncia.objects.select_related('id_categoria').order_by('-data_hora')[:5]
    total_denuncias = Denuncia.objects.count()
    resolvidas = Denuncia.objects.filter(status=Denuncia.Status.RESOLVIDA)
    total_resolvidas = resolvidas.count()
    pendentes = Denuncia.objects.filter(status=Denuncia.Status.PENDENTE).count()
    em_analise = Denuncia.objects.filter(status=Denuncia.Status.EM_ANALISE).count()
    taxa_resposta = round((total_resolvidas / total_denuncias * 100) if total_denuncias else 0)

    if total_resolvidas:
        total_days = sum((timezone.now() - d.data_hora).total_seconds() / 86400 for d in resolvidas)
        tempo_medio_resolucao = round(total_days / total_resolvidas, 1)
    else:
        tempo_medio_resolucao = 0

    cidadaos_impactados = Denuncia.objects.filter(anonimo=False).values('id_usuario').distinct().count()
    if cidadaos_impactados == 0:
        cidadaos_impactados = total_denuncias

    return render(request, 'index.html', {
        'denuncias_recentes': denuncias_recentes,
        'total_denuncias': total_denuncias,
        'resolvidas': total_resolvidas,
        'pendentes': pendentes,
        'em_analise': em_analise,
        'taxa_resposta': taxa_resposta,
        'tempo_medio_resolucao': tempo_medio_resolucao,
        'cidadaos_impactados': cidadaos_impactados,
        'taxa_resolucao': taxa_resposta,
    })


