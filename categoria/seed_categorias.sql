-- Script de seed inicial para a tabela `categoria`
-- Insere 6 categorias fornecidas pelo usuário.
-- Execute no seu banco (ex: sqlite3, psql, mysql client) apropriado ao seu projeto.

BEGIN;

INSERT INTO categoria (nome_categoria, descricao_categoria, icone) VALUES
( 'Iluminação', 'Relate falta de iluminação pública ou postes danificados em sua região.', '💡'),
( 'Abastecimento', 'Denuncie interrupções no abastecimento de água ou vazamentos.', '💧'),
( 'Infraestrutura', 'Buracos, calçadas, vias danificadas.', '🚧'),
( 'Meio Ambiente', 'Desmatamento, descarte irregular, poluição.', '🌱'),
( 'Transporte', 'Ônibus, semáforos, sinalização viária.', '🚌'),
( 'Limpeza Urbana', 'Lixo acumulado, limpeza de logradouros.', '🗑️');

COMMIT;

-- Observação: se estiver usando PostgreSQL e quiser ignorar duplicatas por nome, use:
-- INSERT INTO categoria (nome_categoria, descricao_categoria, icone)
-- VALUES (...)
-- ON CONFLICT (nome_categoria) DO NOTHING;
