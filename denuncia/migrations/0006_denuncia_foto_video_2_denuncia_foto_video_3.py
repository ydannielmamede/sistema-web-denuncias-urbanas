# Generated manually for up to 3 denuncia media files

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('denuncia', '0005_alter_denuncia_foto_video'),
    ]

    operations = [
        migrations.AddField(
            model_name='denuncia',
            name='foto_video_2',
            field=models.FileField(blank=True, db_column='Foto_video_2', max_length=100, null=True, upload_to='denuncias/'),
        ),
        migrations.AddField(
            model_name='denuncia',
            name='foto_video_3',
            field=models.FileField(blank=True, db_column='Foto_video_3', max_length=100, null=True, upload_to='denuncias/'),
        ),
    ]
