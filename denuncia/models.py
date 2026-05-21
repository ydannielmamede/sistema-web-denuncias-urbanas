from django.db import models

# Create your models here.
class Categoria(models.Model):
    id_perfil = models.AutoField(primary_key=True, null=False)
    descricao_perfil = models.CharField(max_length=20, null=False, unique=False)

class Meta:
    db_table = 'perfil'
    verbose_name = 'Perfil'
    plural_verbose_name = 'Perfis'

def __str__(self):
    return self.descricao_perfil
