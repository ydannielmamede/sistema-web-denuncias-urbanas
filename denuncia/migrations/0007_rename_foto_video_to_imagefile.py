# Generated manually for image-only denuncia uploads

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('denuncia', '0006_denuncia_foto_video_2_denuncia_foto_video_3'),
    ]

    operations = [
        migrations.RenameField(
            model_name='denuncia',
            old_name='foto_video',
            new_name='imageFile',
        ),
        migrations.RenameField(
            model_name='denuncia',
            old_name='foto_video_2',
            new_name='imageFile_2',
        ),
        migrations.RenameField(
            model_name='denuncia',
            old_name='foto_video_3',
            new_name='imageFile_3',
        ),
        migrations.AlterField(
            model_name='denuncia',
            name='imageFile',
            field=models.ImageField(blank=True, db_column='Foto_video', max_length=100, null=True, upload_to='denuncias/'),
        ),
        migrations.AlterField(
            model_name='denuncia',
            name='imageFile_2',
            field=models.ImageField(blank=True, db_column='Foto_video_2', max_length=100, null=True, upload_to='denuncias/'),
        ),
        migrations.AlterField(
            model_name='denuncia',
            name='imageFile_3',
            field=models.ImageField(blank=True, db_column='Foto_video_3', max_length=100, null=True, upload_to='denuncias/'),
        ),
    ]
