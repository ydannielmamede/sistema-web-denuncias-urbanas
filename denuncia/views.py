from django.shortcuts import render
from categoria.models import Categoria


def denuncia_page(request):
    categorias = Categoria.objects.all().order_by('nome_categoria')
    return render(request, 'denuncia/denuncia.html', {
        'categorias': categorias,
    })
