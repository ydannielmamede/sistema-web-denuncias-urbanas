from django.urls import path
from .views import cadastrar_usuario, login_usuario, logout_usuario

app_name = "usuario"

urlpatterns = [
    path("login/", login_usuario, name="login"),
    path("cadastro/", cadastrar_usuario, name="cadastro"),
    path("logout/", logout_usuario, name="logout"),
]
