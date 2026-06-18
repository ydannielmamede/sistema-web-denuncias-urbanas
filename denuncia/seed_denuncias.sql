-- Script de seed inicial para a tabela `denuncia`
-- Denúncias fictícias vinculadas às categorias, órgãos alvo e usuários cadastrados para Belém/PA.

BEGIN;

INSERT INTO denuncia (
    Mensagem,
    Foto_video,
    Data_hora,
    Anonimo,
    Localizacao,
    CATEGORIA_id_categoria,
    ORGAO_ALVO_id_orgao_alvo,
    USUARIO_id_usuario,
    Status
)
SELECT
    'Poste com lâmpada queimada na Travessa Padre Eutíquio, próximo ao comércio local.',
    NULL,
    CURRENT_TIMESTAMP,
    0,
    'Travessa Padre Eutiquio, Batista Campos, Belem-PA',
    c.id_categoria,
    o.id_orgao_alvo,
    u.id,
    'P'
FROM categoria c
JOIN orgao_alvo o ON o.id_categoria = c.id_categoria
JOIN usuario u ON u.username = 'ana.souza'
WHERE c.nome_categoria = 'Iluminação'
  AND o.Descricao_orgao = 'SEURB - Iluminacao Publica'
  AND NOT EXISTS (
      SELECT 1
      FROM denuncia
      WHERE Mensagem = 'Poste com lâmpada queimada na Travessa Padre Eutíquio, próximo ao comércio local.'
  );

INSERT INTO denuncia (
    Mensagem,
    Foto_video,
    Data_hora,
    Anonimo,
    Localizacao,
    CATEGORIA_id_categoria,
    ORGAO_ALVO_id_orgao_alvo,
    USUARIO_id_usuario,
    Status
)
SELECT
    'Vazamento de água na calçada causando desperdício e dificultando a passagem de pedestres.',
    NULL,
    CURRENT_TIMESTAMP,
    0,
    'Avenida Almirante Barroso, Marco, Belem-PA',
    c.id_categoria,
    o.id_orgao_alvo,
    u.id,
    'A'
FROM categoria c
JOIN orgao_alvo o ON o.id_categoria = c.id_categoria
JOIN usuario u ON u.username = 'bruno.lima'
WHERE c.nome_categoria = 'Abastecimento'
  AND o.Descricao_orgao = 'COSANPA'
  AND NOT EXISTS (
      SELECT 1
      FROM denuncia
      WHERE Mensagem = 'Vazamento de água na calçada causando desperdício e dificultando a passagem de pedestres.'
  );

INSERT INTO denuncia (
    Mensagem,
    Foto_video,
    Data_hora,
    Anonimo,
    Localizacao,
    CATEGORIA_id_categoria,
    ORGAO_ALVO_id_orgao_alvo,
    USUARIO_id_usuario,
    Status
)
SELECT
    'Buraco grande na via com risco de acidente para carros e motocicletas.',
    NULL,
    CURRENT_TIMESTAMP,
    1,
    'Rua dos Mundurucus, Jurunas, Belem-PA',
    c.id_categoria,
    o.id_orgao_alvo,
    NULL,
    'P'
FROM categoria c
JOIN orgao_alvo o ON o.id_categoria = c.id_categoria
WHERE c.nome_categoria = 'Infraestrutura'
  AND o.Descricao_orgao = 'SEURB - Obras e Posturas'
  AND NOT EXISTS (
      SELECT 1
      FROM denuncia
      WHERE Mensagem = 'Buraco grande na via com risco de acidente para carros e motocicletas.'
  );

INSERT INTO denuncia (
    Mensagem,
    Foto_video,
    Data_hora,
    Anonimo,
    Localizacao,
    CATEGORIA_id_categoria,
    ORGAO_ALVO_id_orgao_alvo,
    USUARIO_id_usuario,
    Status
)
SELECT
    'Descarte irregular de entulho próximo à área verde do bairro.',
    NULL,
    CURRENT_TIMESTAMP,
    0,
    'Passagem Sao Pedro, Guama, Belem-PA',
    c.id_categoria,
    o.id_orgao_alvo,
    u.id,
    'A'
FROM categoria c
JOIN orgao_alvo o ON o.id_categoria = c.id_categoria
JOIN usuario u ON u.username = 'carla.mendes'
WHERE c.nome_categoria = 'Meio Ambiente'
  AND o.Descricao_orgao = 'SEMMA Belem'
  AND NOT EXISTS (
      SELECT 1
      FROM denuncia
      WHERE Mensagem = 'Descarte irregular de entulho próximo à área verde do bairro.'
  );

INSERT INTO denuncia (
    Mensagem,
    Foto_video,
    Data_hora,
    Anonimo,
    Localizacao,
    CATEGORIA_id_categoria,
    ORGAO_ALVO_id_orgao_alvo,
    USUARIO_id_usuario,
    Status
)
SELECT
    'Semáforo intermitente em cruzamento movimentado, gerando risco aos pedestres.',
    NULL,
    CURRENT_TIMESTAMP,
    0,
    'Avenida Pedro Miranda com Travessa Lomas Valentinas, Pedreira, Belem-PA',
    c.id_categoria,
    o.id_orgao_alvo,
    u.id,
    'P'
FROM categoria c
JOIN orgao_alvo o ON o.id_categoria = c.id_categoria
JOIN usuario u ON u.username = 'ana.souza'
WHERE c.nome_categoria = 'Transporte'
  AND o.Descricao_orgao = 'SEMOB Belem'
  AND NOT EXISTS (
      SELECT 1
      FROM denuncia
      WHERE Mensagem = 'Semáforo intermitente em cruzamento movimentado, gerando risco aos pedestres.'
  );

INSERT INTO denuncia (
    Mensagem,
    Foto_video,
    Data_hora,
    Anonimo,
    Localizacao,
    CATEGORIA_id_categoria,
    ORGAO_ALVO_id_orgao_alvo,
    USUARIO_id_usuario,
    Status
)
SELECT
    'Acúmulo de lixo doméstico há vários dias causando mau cheiro na rua.',
    NULL,
    CURRENT_TIMESTAMP,
    1,
    'Rua da Marinha, Marambaia, Belem-PA',
    c.id_categoria,
    o.id_orgao_alvo,
    NULL,
    'R'
FROM categoria c
JOIN orgao_alvo o ON o.id_categoria = c.id_categoria
WHERE c.nome_categoria = 'Limpeza Urbana'
  AND o.Descricao_orgao = 'SESAN Belem'
  AND NOT EXISTS (
      SELECT 1
      FROM denuncia
      WHERE Mensagem = 'Acúmulo de lixo doméstico há vários dias causando mau cheiro na rua.'
  );

COMMIT;
