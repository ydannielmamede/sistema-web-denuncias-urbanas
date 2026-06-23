# Generated manually for foto_video FileField

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('denuncia', '0004_denuncia_latitude_denuncia_longitude'),
    ]

    operations = [
        migrations.AlterField(
            model_name='denuncia',
            name='foto_video',
            field=models.FileField(blank=True, db_column='Foto_video', max_length=100, null=True, upload_to='denuncias/'),
        ),
    ]
