from django.urls import path
from .views import (
    criar_denuncia,
    dashboard,
    dashboard_dados,
    dashboard_denuncias_page,
    denuncia_page,
    listar_denuncias,
    marcar_status_em_analise,
    marcar_status_pendente,
    marcar_status_resolvida,
)

app_name = 'denuncia'

urlpatterns = [
    path('', denuncia_page, name='denuncia'),
    path('criar/', criar_denuncia, name='criar_denuncia'),
    path('dashboard/', dashboard, name='dashboard'),
    path('dashboard/dados/', dashboard_dados, name='dashboard_dados'),
    path('dashboard/denuncias/', dashboard_denuncias_page, name='dashboard_denuncias_page'),
    path('denuncias/', listar_denuncias, name='listar_denuncias'),
    path('<int:id_denuncia>/status/pendente/', marcar_status_pendente, name='marcar_status_pendente'),
    path('<int:id_denuncia>/status/em-analise/', marcar_status_em_analise, name='marcar_status_em_analise'),
    path('<int:id_denuncia>/status/resolvida/', marcar_status_resolvida, name='marcar_status_resolvida'),
]
