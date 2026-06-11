from django.urls import path
from .views import (
    criar_denuncia,
    denuncia_page,
    marcar_status_em_analise,
    marcar_status_pendente,
    marcar_status_resolvida,
)

app_name = 'denuncia'

urlpatterns = [
    path('', denuncia_page, name='denuncia'),
    path('criar/', criar_denuncia, name='criar_denuncia'),
    path('<int:id_denuncia>/status/pendente/', marcar_status_pendente, name='marcar_status_pendente'),
    path('<int:id_denuncia>/status/em-analise/', marcar_status_em_analise, name='marcar_status_em_analise'),
    path('<int:id_denuncia>/status/resolvida/', marcar_status_resolvida, name='marcar_status_resolvida'),
]
