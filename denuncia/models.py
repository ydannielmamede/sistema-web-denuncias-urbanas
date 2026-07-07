

from django.db import models

# Create your models here.
class Denuncia(models.Model):
    id_denuncia = models.AutoField(primary_key=True, null=False, db_column='id_denuncia')
    mensagem = models.CharField(max_length=255, null=False, unique=False, db_column='Mensagem')
    foto_1 = models.ImageField(upload_to='denuncias/', max_length=100, null=True, blank=True, db_column='Foto_1')
    foto_2 = models.ImageField(upload_to='denuncias/', max_length=100, null=True, blank=True, db_column='Foto_2')
    foto_3 = models.ImageField(upload_to='denuncias/', max_length=100, null=True, blank=True, db_column='Foto_3')
    foto_4 = models.ImageField(upload_to='denuncias/', max_length=100, null=True, blank=True, db_column='Foto_4')
    foto_5 = models.ImageField(upload_to='denuncias/', max_length=100, null=True, blank=True, db_column='Foto_5')
    data_hora = models.DateTimeField(auto_now_add=True, null=False, unique=False, db_column='Data_hora')
    anonimo = models.BooleanField(default=False, null=False, unique=False, db_column='Anonimo')
    localizacao = models.CharField(max_length=100, null=True, unique=False, db_column='Localizacao')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, db_column='Latitude')
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, db_column='Longitude')
    id_categoria = models.ForeignKey('categoria.Categoria', on_delete=models.CASCADE, db_column='CATEGORIA_id_categoria')
    id_orgao_alvo = models.ForeignKey('orgao_alvo.OrgaoAlvo', on_delete=models.CASCADE, db_column='ORGAO_ALVO_id_orgao_alvo')
    id_usuario = models.ForeignKey(
        'usuario.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='USUARIO_id_usuario',
    )

    class Status(models.TextChoices):
        PENDENTE = 'P', 'Pendente'
        EM_ANALISE = 'A', 'Em análise'
        RESOLVIDA = 'R', 'Resolvida'

    class Prioridade(models.TextChoices):
        BAIXA = 'B', 'Baixa'
        MEDIA = 'M', 'Média'
        ALTA = 'A', 'Alta'
        CRITICA = 'C', 'Crítica'

    status = models.CharField(
        max_length=1,
        choices=Status.choices,
        default=Status.PENDENTE,
        db_column='Status',
        null=False,
        blank=False,
    )
    prioridade = models.CharField(
        max_length=1,
        choices=Prioridade.choices,
        default=Prioridade.MEDIA,
        db_column='Prioridade',
        null=False,
        blank=False,
    )


    class Meta:
        db_table = 'denuncia'
        verbose_name = 'Denuncia'
        verbose_name_plural = 'Denuncias'

    def midias(self):
        return [midia for midia in (self.foto_1, self.foto_2, self.foto_3, self.foto_4, self.foto_5) if midia]

    def __str__(self):
        return self.mensagem
