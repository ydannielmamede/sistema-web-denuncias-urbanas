from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuario", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="usuario",
            name="cpf",
            field=models.CharField(
                blank=True, db_column="Cpf", max_length=14, null=True, unique=True
            ),
        ),
        migrations.AlterField(
            model_name="usuario",
            name="telefone",
            field=models.CharField(
                blank=True, db_column="Telefone", max_length=20, null=True
            ),
        ),
    ]
