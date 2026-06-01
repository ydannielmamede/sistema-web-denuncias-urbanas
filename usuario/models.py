from django.db import models

# Create your models here.
class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True,null=False,db_column='id_usuario')
    nome = models.CharField(max_length=100,null=False, unique=False, db_column='Nome')
    email = models.CharField(max_length=100,null=False, unique=True, db_column='Email')
    cpf = models.CharField(max_length=14,null=False, unique=True, db_column='Cpf')
    nascimento = models.DateField(null=False, unique=False, db_column='Nascimento')
    genero = models.CharField(max_length=20,null=True, unique=False, db_column='Genero')
    telefone = models.CharField(max_length=20,null=False, unique=False, db_column='Telefone')
    perfil_id = models.ForeignKey('perfil.Perfil', on_delete=models.CASCADE,null=False, db_column='Perfil_id_perfil')


    class Meta:
        db_table = 'usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.nome
