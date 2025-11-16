-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 13, 2025 at 12:02 PM
-- Server version: 5.5.68-MariaDB
-- PHP Version: 7.0.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistemas_erp`
--

-- --------------------------------------------------------

--
-- Table structure for table `tconfig_gral_aux1`
--

CREATE TABLE `tconfig_gral_aux1` (
  `id` int(11) NOT NULL,
  `id_empresa_base` int(11) DEFAULT NULL,
  `handel` int(11) DEFAULT NULL,
  `horario_sabado` varchar(25) DEFAULT NULL,
  `horario_domingo` varchar(25) DEFAULT NULL,
  `formato_hora` varchar(10) DEFAULT 'militar',
  `str_dias` varchar(20) NOT NULL DEFAULT '1-2-3-4-5-' COMMENT 'Dias de la semana que trabaja la barber',
  `json_encuestas` text COMMENT 'Configuración Adicional para envío de Encuestas por WSP'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tconfig_gral_aux1`
--

INSERT INTO `tconfig_gral_aux1` (`id`, `id_empresa_base`, `handel`, `horario_sabado`, `horario_domingo`, `formato_hora`, `str_dias`, `json_encuestas`) VALUES
(61, 44, 117, '9-19', '', 'militar', '1-2-3-4-5-', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tconfig_gral_aux1`
--
ALTER TABLE `tconfig_gral_aux1`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_empresa_handel` (`id_empresa_base`,`handel`),
  ADD KEY `id_empresa_base` (`id_empresa_base`),
  ADD KEY `handel` (`handel`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tconfig_gral_aux1`
--
ALTER TABLE `tconfig_gral_aux1`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=221;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tconfig_gral_aux1`
--
ALTER TABLE `tconfig_gral_aux1`
  ADD CONSTRAINT `tconfig_gral_aux1_ibfk_1` FOREIGN KEY (`id_empresa_base`) REFERENCES `tempresas_base` (`id`),
  ADD CONSTRAINT `tconfig_gral_aux1_ibfk_2` FOREIGN KEY (`handel`) REFERENCES `tempresas` (`handel`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
