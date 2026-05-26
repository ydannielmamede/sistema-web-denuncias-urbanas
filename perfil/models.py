from django.db import models

# Create your models here.
class Perfil(models.Model):
    id_perfil = models.AutoField(primary_key=True,null=False,db_column='id_perfil')
    descricao = models.CharField(max_length=20,null=True, unique=True, db_column='Descricao_perfil')

    class Meta:
        db_table = 'perfil'
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfis'

    def __str__(self):
        return self.descricao