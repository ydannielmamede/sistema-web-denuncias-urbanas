from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('categoria', '0005_update_category_colors'),
    ]

    operations = [
        migrations.AlterField(
            model_name='categoria',
            name='cor',
            field=models.CharField(
                blank=True,
                choices=[
                    ('#FFC300', 'Iluminação'),
                    ('#38BDF8', 'Abastecimento'),
                    ('#FB923C', 'Infraestrutura'),
                    ('#2DD4BF', 'Meio Ambiente'),
                    ('#9333EA', 'Transporte'),
                    ('#8B4513', 'Limpeza Urbana'),
                ],
                default='#FFC300',
                max_length=7,
                null=True,
            ),
        ),
    ]
