from django.contrib import admin

from denuncia.models import Denuncia


@admin.register(Denuncia)
class DenunciaAdmin(admin.ModelAdmin):
    list_display = ('id_denuncia', 'mensagem', 'id_categoria', 'status', 'prioridade', 'data_hora')
    list_filter = ('status', 'prioridade', 'id_categoria')
