from django.db import models

# Create your models here.
class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True,null=False)
    nome = models.CharField(max_length=45,null=False, unique=False  )
    email = models.EmailField(_("Email"), max_length=254)