from django.db import models

# Create your models here.
class Denuncia(models.Model):
    id_denuncia = models.AutoField(primary_key=True, null=False, db_column='id_denuncia')
    mensagem = models.CharField(max_length=255, null=False, unique=False, db_column='Mensagem')
    foto_video = models.CharField(max_length=100, null=True, unique=False, db_column='Foto_video')
    data_hora = models.DateTimeField(auto_now_add=True, null=False, unique=False, db_column='Data_hora')
    anonimo = models.BooleanField(default=False, null=False, unique=False, db_column='Anonimo')
    localizacao = models.CharField(max_length=100, null=True, unique=False, db_column='Localizacao')
    id_categoria = models.ForeignKey('categoria.Categoria', on_delete=models.CASCADE, db_column='CATEGORIA_id_categoria')
    id_orgao_alvo = models.ForeignKey('orgao_alvo.OrgaoAlvo', on_delete=models.CASCADE, db_column='ORGAO_ALVO_id_orgao_alvo')
    id_usuario = models.ForeignKey('usuario.Usuario', on_delete=models.CASCADE, db_column='USUARIO_id_usuario')

    class Meta:
        db_table = 'denuncia'
        verbose_name = 'Denuncia'
        verbose_name_plural = 'Denuncias'

    def __str__(self):
        return self.mensagem
