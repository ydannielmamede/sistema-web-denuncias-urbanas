from django.db import migrations


def create_categories(apps, schema_editor):
    Categoria = apps.get_model('categoria', 'Categoria')
    categories = [
        ('Iluminação', 'Relate falta de iluminação pública ou postes danificados em sua região.', '💡'),
        ('Abastecimento', 'Denuncie interrupções no abastecimento de água ou vazamentos.', '💧'),
        ('Infraestrutura', 'Buracos, calçadas, vias danificadas.', '🚧'),
        ('Meio Ambiente', 'Desmatamento, descarte irregular, poluição.', '🌱'),
        ('Transporte', 'Ônibus, semáforos, sinalização viária.', '🚌'),
        ('Limpeza Urbana', 'Lixo acumulado, limpeza de logradouros.', '🗑️'),
    ]
    for nome, descricao, icone in categories:
        Categoria.objects.update_or_create(
            nome_categoria=nome,
            defaults={
                'descricao_categoria': descricao,
                'icone': icone,
            }
        )


def remove_categories(apps, schema_editor):
    Categoria = apps.get_model('categoria', 'Categoria')
    nomes = [
        'Iluminação', 'Abastecimento', 'Infraestrutura',
        'Meio Ambiente', 'Transporte', 'Limpeza Urbana'
    ]
    Categoria.objects.filter(nome_categoria__in=nomes).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('categoria', '0002_categoria_icone'),
    ]

    operations = [
        migrations.RunPython(create_categories, remove_categories),
    ]
