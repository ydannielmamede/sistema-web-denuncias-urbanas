from django.core.management.base import BaseCommand

from categoria.models import Categoria
from orgao_alvo.models import OrgaoAlvo


class Command(BaseCommand):
    help = "Cria órgãos-alvo fictícios para demonstração"

    def handle(self, *args, **options):
        dados = {
            "Iluminação": ("Secretaria de Iluminação Pública", "iluminacao@demonstracao.invalid"),
            "Abastecimento": ("Departamento e Abastecimento", "agua@demonstracao.invalid"),
            "Infraestrutura": ("Secretaria de Obras Urbanas", "obras@demonstracao.invalid"),
            "Meio Ambiente": ("Instituto de Meio Ambiente", "ambiente@demonstracao.invalid"),
            "Transporte": ("Autarquia de Mobilidade Urbana", "mobilidade@demonstracao.invalid"),
            "Limpeza Urbana": ("Serviço de Limpeza Urbana", "limpeza@demonstracao.invalid"),
        }

        for nome_categoria, (descricao, email) in dados.items():
            categoria = Categoria.objects.get(nome_categoria=nome_categoria)
            OrgaoAlvo.objects.update_or_create(
                descricao=descricao,
                categoria=categoria,
                defaults={
                    "email_orgao": email,
                    "telefone": "(00) 0000-0000",
                },
            )

        self.stdout.write(self.style.SUCCESS("Órgãos-alvo fictícios criados/atualizados."))
