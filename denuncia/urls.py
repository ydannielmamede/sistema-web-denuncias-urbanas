from django.urls import path
from .views import denuncia_page

app_name = 'denuncia'

urlpatterns = [
    path('', denuncia_page, name='denuncia'),
]
