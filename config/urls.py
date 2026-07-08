"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.static import serve
from django.views.generic import TemplateView
from config.views import index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", index, name="index"),
    path(
        "denuncia/",
        include(("denuncia.urls", "denuncia"), namespace="denuncia"),
    ),
    path(
        "saibamais/",
        TemplateView.as_view(template_name="saibamais.html"),
        name="saibamais",
    ),
    path("accounts/", include("allauth.urls")),
    path("usuario/", include("usuario.urls")),
]

# WhiteNoise só serve /static/. /media/ precisa de tratamento separado.
# Em DEBUG, o helper static() resolve. Em produção, montamos uma rota
# dedicada que aponta para o MEDIA_ROOT — sem isso, fotos enviadas
# aparecem em media/denuncias/ mas retornam 404 quando o browser pede.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += [
        path(
            f"{settings.MEDIA_URL.strip('/')}/<path:path>",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]
