from django.db import models

# Create your models here.
class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True,null=False)
    nome_categoria = models.CharField(max_length=45, null=False, unique=True)
    descricao_categoria = models.CharField(max_length=100, null=True)
    icone = models.CharField(max_length=10, null=True, blank=True, default='📍')
    cor = models.CharField(max_length=7, null=True, blank=True, default='#F8C146')

    class Meta:
        db_table = 'categoria'
    def __str__(self):       
        return self.nome_categoria