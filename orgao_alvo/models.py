from django.db import models

# Create your models here.
class OrgaoAlvo(models.Model):
    id_orgao_alvo = models.AutoField(primary_key=True,null=False,db_column='id_orgao_alvo')
    descricao = models.CharField(max_length=45,null=True, unique=False, db_column='Descricao_orgao')
    email_orgao = models.CharField(max_length=100,null=True, unique=False, db_column='Email_orgao')
    telefone = models.CharField(max_length=15,null=True, unique=False, db_column='Telefone_orgao')
    categoria = models.ForeignKey('categoria.Categoria', on_delete=models.CASCADE, db_column='id_categoria')

    class Meta:
        db_table = 'orgao_alvo'
        verbose_name = 'Orgao Alvo'
        verbose_name_plural = 'Orgaos Alvos'

    def __str__(self):
        return self.descricao