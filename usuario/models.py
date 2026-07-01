from django.db import models
from django.contrib.auth.models import AbstractUser


class Usuario(AbstractUser):
    # username, email, password, first_name, last_name já vêm do AbstractUser

    cpf = models.CharField(max_length=14, null=True, blank=True, unique=True, db_column="Cpf")
    nascimento = models.DateField(null=True, db_column="Nascimento")
    genero = models.CharField(max_length=20, null=True, db_column="Genero")
    telefone = models.CharField(max_length=20, null=True, blank=True, db_column="Telefone")

    class Meta:
        db_table = "usuario"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.username
