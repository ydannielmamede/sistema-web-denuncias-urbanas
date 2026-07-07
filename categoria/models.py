from django.db import models


class Categoria(models.Model):
    CORES = [
        ('#FFC300', 'Iluminação'),
        ('#38BDF8', 'Abastecimento'),
        ('#FB923C', 'Infraestrutura'),
        ('#2DD4BF', 'Meio Ambiente'),
        ('#9333EA', 'Transporte'),
        ('#8B4513', 'Limpeza Urbana'),
    ]
    id_categoria = models.AutoField(primary_key=True,null=False)
    nome_categoria = models.CharField(max_length=45, null=False, unique=True)
    descricao_categoria = models.CharField(max_length=100, null=True)
    icone = models.CharField(max_length=10, null=True, blank=True, default='📍')
    cor = models.CharField(max_length=7, choices=CORES, null=True, blank=True, default='#FFC300')

    class Meta:
        db_table = 'categoria'
    def __str__(self):       
        return self.nome_categoria