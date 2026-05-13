-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: denuncias-db
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `Nome_categoria` varchar(45) NOT NULL,
  `Descricao_categoria` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `Nome_categoria_UNIQUE` (`Nome_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Iluminacao',' Falta de iluminação pública ou postes danificados em sua região.'),(2,'Abastecimento','Interrupções no abastecimento de água ou vazamentos.'),(3,'Infraestrutura','Buracos, calçadas, vias danificadas.'),(4,'Meio Ambiente','Desmatamento, descarte irregular, poluição.'),(5,'Transporte','Ônibus, semáforos, sinalização viária.'),(6,'Limpeza','Lixo acumulado, limpeza de logradouros.');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denuncia`
--

DROP TABLE IF EXISTS `denuncia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denuncia` (
  `id_denuncia` int NOT NULL AUTO_INCREMENT,
  `Mensagem` varchar(255) NOT NULL,
  `Foto_video` varchar(100) DEFAULT NULL,
  `Data_hora` datetime NOT NULL,
  `Anonimo` tinyint DEFAULT NULL,
  `Localizacao` varchar(100) DEFAULT NULL,
  `USUARIO_id_usuario` int NOT NULL,
  `USUARIO_PERFIL_id_perfil` int NOT NULL,
  `CATEGORIA_id_categoria` int NOT NULL,
  `ORGAO_ALVO_id_orgao_alvo` int NOT NULL,
  PRIMARY KEY (`id_denuncia`),
  UNIQUE KEY `Data_hora_UNIQUE` (`Data_hora`),
  KEY `fk_DENUNCIA_USUARIO1_idx` (`USUARIO_id_usuario`,`USUARIO_PERFIL_id_perfil`),
  KEY `fk_DENUNCIA_CATEGORIA1_idx` (`CATEGORIA_id_categoria`),
  KEY `fk_DENUNCIA_ORGAO_ALVO1_idx` (`ORGAO_ALVO_id_orgao_alvo`),
  CONSTRAINT `fk_DENUNCIA_CATEGORIA1` FOREIGN KEY (`CATEGORIA_id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `fk_DENUNCIA_ORGAO_ALVO1` FOREIGN KEY (`ORGAO_ALVO_id_orgao_alvo`) REFERENCES `orgao_alvo` (`id_orgao_alvo`),
  CONSTRAINT `fk_DENUNCIA_USUARIO1` FOREIGN KEY (`USUARIO_id_usuario`, `USUARIO_PERFIL_id_perfil`) REFERENCES `usuario` (`id_usuario`, `PERFIL_id_perfil`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denuncia`
--

LOCK TABLES `denuncia` WRITE;
/*!40000 ALTER TABLE `denuncia` DISABLE KEYS */;
INSERT INTO `denuncia` VALUES (1,'Funcionario exigiu pagamento para liberar alvara','foto_alvara_01.jpg','2025-01-10 09:15:00',0,'Av. Almirante Barroso, 3200, Belem-PA',3,3,1,1),(2,'Descarte ilegal de residuos quimicos no igarape','video_igarape_02.mp4','2025-02-03 14:30:00',1,'Igarape do Tucunduba, Belem-PA',4,3,3,3),(3,'Obra de calcamento parou sem conclusao ha 6 meses',NULL,'2025-03-18 11:00:00',0,'Rua dos Mundurucus, 1450, Belem-PA',5,3,4,1),(4,'Medico recusou atendimento sem justificativa legal','foto_upa_04.jpg','2025-04-07 08:45:00',1,'UPA Guama, Belem-PA',3,3,2,2),(5,'Nota fiscal falsa apresentada em licitacao publica','doc_licitacao_05.pdf','2025-05-01 16:20:00',0,'Sede da Prefeitura, Marco, Belem-PA',2,2,5,1);
/*!40000 ALTER TABLE `denuncia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orgao_alvo`
--

DROP TABLE IF EXISTS `orgao_alvo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orgao_alvo` (
  `id_orgao_alvo` int NOT NULL AUTO_INCREMENT,
  `Descricao_orgao` varchar(45) DEFAULT NULL,
  `Email_orgao` varchar(255) DEFAULT NULL,
  `Telefone_orgao` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id_orgao_alvo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orgao_alvo`
--

LOCK TABLES `orgao_alvo` WRITE;
/*!40000 ALTER TABLE `orgao_alvo` DISABLE KEYS */;
INSERT INTO `orgao_alvo` VALUES (1,'Prefeitura Municipal','ouvidoria@prefeitura.pa.gov.br','(91) 3201-8000'),(2,'Secretaria de Saude','sespa@saude.pa.gov.br','(91) 3201-3500'),(3,'SEMAS - Meio Ambiente','semas@semas.pa.gov.br','(91) 3184-6100'),(4,'Policia Civil','delegacia@pc.pa.gov.br','(91) 3184-0400');
/*!40000 ALTER TABLE `orgao_alvo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `perfil`
--

DROP TABLE IF EXISTS `perfil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfil` (
  `id_perfil` int NOT NULL,
  `Descricao_perfil` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_perfil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perfil`
--

LOCK TABLES `perfil` WRITE;
/*!40000 ALTER TABLE `perfil` DISABLE KEYS */;
INSERT INTO `perfil` VALUES (1,'Administrador'),(2,'Anonimo'),(3,'Cidadao');
/*!40000 ALTER TABLE `perfil` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(100) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Cpf` char(11) NOT NULL,
  `Nascimento` date NOT NULL,
  `Genero` enum('M','F','O') DEFAULT NULL,
  `Telefone` varchar(15) DEFAULT NULL,
  `PERFIL_id_perfil` int NOT NULL,
  PRIMARY KEY (`id_usuario`,`PERFIL_id_perfil`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  UNIQUE KEY `Cpf_UNIQUE` (`Cpf`),
  KEY `fk_USUARIO_PERFIL1_idx` (`PERFIL_id_perfil`),
  CONSTRAINT `fk_USUARIO_PERFIL1` FOREIGN KEY (`PERFIL_id_perfil`) REFERENCES `perfil` (`id_perfil`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Ana Souza','ana.souza@email.com','04523167890','1990-03-15','F','(91) 99801-2345',1),(2,'Carlos Mendes','c.mendes@email.com','12378456901','1985-07-22','M','(91) 98712-3456',2),(3,'Fernanda Lima','fernanda.lima@email.com','56734512367','1998-11-05','F','(91) 99634-5678',3),(4,'Roberto Alves','roberto.alves@email.com','78912345600','1975-02-18','M','(91) 98523-4567',3),(5,'Patricia Costa','patricia.costa@email.com','32165498712','2001-09-30','O',NULL,3);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'denuncias-db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 11:23:36
