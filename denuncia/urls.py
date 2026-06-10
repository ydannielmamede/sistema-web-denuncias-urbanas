from django.urls import path
from .views import criar_denuncia, denuncia_page

app_name = 'denuncia'

urlpatterns = [
    path('', denuncia_page, name='denuncia'),
    path('criar/', criar_denuncia, name='criar_denuncia'),
]
