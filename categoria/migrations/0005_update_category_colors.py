from django.db import migrations


CATEGORY_COLORS = {
    'Iluminação': '#FFC300',
    'Abastecimento': '#38BDF8',
    'Infraestrutura': '#FB923C',
    'Meio Ambiente': '#2DD4BF',
    'Transporte': '#9333EA',
    'Limpeza Urbana': '#8B4513',
}


def set_category_colors(apps, schema_editor):
    Categoria = apps.get_model('categoria', 'Categoria')
    for nome, cor in CATEGORY_COLORS.items():
        Categoria.objects.filter(nome_categoria=nome).update(cor=cor)


def reset_category_colors(apps, schema_editor):
    old_colors = {
        'Iluminação': '#F8C146',
        'Abastecimento': '#3B82F6',
        'Infraestrutura': '#F97316',
        'Meio Ambiente': '#22C55E',
        'Transporte': '#8B5CF6',
        'Limpeza Urbana': '#8B4513',
    }
    Categoria = apps.get_model('categoria', 'Categoria')
    for nome, cor in old_colors.items():
        Categoria.objects.filter(nome_categoria=nome).update(cor=cor)


class Migration(migrations.Migration):

    dependencies = [
        ('categoria', '0004_categoria_cor'),
    ]

    operations = [
        migrations.RunPython(set_category_colors, reset_category_colors),
    ]
