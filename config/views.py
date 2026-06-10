from django.shortcuts import render
from denuncia.models import Denuncia

def index(request):
    denuncias_recentes = Denuncia.objects.all().order_by('-data_hora')[:5]
    return render(request, 'index.html', {
        'denuncias_recentes': denuncias_recentes,
    })


