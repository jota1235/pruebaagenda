-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 13, 2025 at 11:54 AM
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
-- Table structure for table `tusuarios`
--

CREATE TABLE `tusuarios` (
  `id` int(11) NOT NULL,
  `id_empresa_base` int(11) DEFAULT '1',
  `handel` int(11) DEFAULT NULL,
  `nombre` varchar(15) DEFAULT NULL,
  `apaterno` varchar(25) DEFAULT NULL,
  `amaterno` varchar(25) DEFAULT NULL,
  `nombrecto` varchar(80) DEFAULT NULL,
  `tel1` varchar(25) DEFAULT NULL,
  `tel2` varchar(25) DEFAULT NULL,
  `email1` varchar(120) DEFAULT NULL,
  `email2` varchar(45) DEFAULT NULL,
  `id_permiso` int(11) DEFAULT NULL,
  `id_permiso_2` int(11) DEFAULT NULL COMMENT 'Permiso secundario',
  `contrasenia` varchar(45) DEFAULT NULL,
  `alias` varchar(45) DEFAULT NULL,
  `activo` varchar(5) NOT NULL DEFAULT 'Si',
  `orden` int(11) NOT NULL DEFAULT '1',
  `blk` varchar(50) NOT NULL,
  `chk_sueldo_base` int(2) NOT NULL DEFAULT '0',
  `sueldo_base` decimal(13,3) DEFAULT '0.000',
  `periodisidad` int(11) NOT NULL DEFAULT '1',
  `ban_acceso_ip` int(2) NOT NULL DEFAULT '0' COMMENT 'Si es 1 significa que existe una lista para limitar el acceso de ciertas IP',
  `ids_acceso_ip` text NOT NULL COMMENT 'Listado de indices que  referencian las IPs que pueden accesar con el usuario',
  `n_comision` enum('','_bono') DEFAULT NULL COMMENT 'Configura el tipo de comisión que se le pagará al empleado si Comisión 1 o Comisión 2 (+ Bono)',
  `ban_atiende_ctes` int(2) NOT NULL DEFAULT '0' COMMENT 'Si es 1 agregara el usuario en el combo de Atendio cliente',
  `ids_cambio_sucursal` text NOT NULL COMMENT 'Ids disponibles para cambio de sucursal',
  `ids_select_clasific` text NOT NULL COMMENT 'Selección de clasificaciones de servicios y productos',
  `inicio_labores` date DEFAULT NULL,
  `ids_con_privilegio_aux` text NOT NULL COMMENT 'Privilegios auxiliares del usuario',
  `color_agenda_fondo` varchar(10) NOT NULL DEFAULT '#848484',
  `color_agenda_texto` varchar(10) NOT NULL DEFAULT 'white',
  `precio_default` varchar(30) NOT NULL DEFAULT 'precio_normal',
  `id_personal_umov` int(11) NOT NULL COMMENT 'Id del personal que realizó el último movimiento',
  `config_add` text NOT NULL COMMENT 'Formato JSON parametros de configuración adicionales',
  `json_datadd` text NOT NULL COMMENT 'Otros datos en formato Json'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tusuarios`
--

INSERT INTO `tusuarios` (`id`, `id_empresa_base`, `handel`, `nombre`, `apaterno`, `amaterno`, `nombrecto`, `tel1`, `tel2`, `email1`, `email2`, `id_permiso`, `id_permiso_2`, `contrasenia`, `alias`, `activo`, `orden`, `blk`, `chk_sueldo_base`, `sueldo_base`, `periodisidad`, `ban_acceso_ip`, `ids_acceso_ip`, `n_comision`, `ban_atiende_ctes`, `ids_cambio_sucursal`, `ids_select_clasific`, `inicio_labores`, `ids_con_privilegio_aux`, `color_agenda_fondo`, `color_agenda_texto`, `precio_default`, `id_personal_umov`, `config_add`, `json_datadd`) VALUES
(739, 44, 117, 'ANGELICA', 'VAZQUEZ', 'SIERRA', 'ANGELICA VAZQUEZ SIERRA', '', '', '', '', 402, 401, '', 'Angie', 'Si', 1, '', 0, '0.000', 1, 0, '', NULL, 0, '76|117|', '', NULL, '', '#848484', 'white', 'precio_normal', 0, '', ''),
(1524, 44, 117, 'CAJERA', 'REAL DEL VALLE', '', 'CAJERA REAL DEL VALLE', '', '', '', '', 401, 402, '', 'real.delvalle', 'Si', 1, '', 0, '0.000', 1, 0, '', NULL, 0, '76|117|', '', '0000-00-00', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(1565, 44, 117, 'DIANA STEFANIA ', 'HERNáNDEZ ', 'GOMEZ', 'DIANA STEFANIA  HERNáNDEZ  GOMEZ', '(669) 261-7588', '', '', '', 402, NULL, '', 'Fanny', 'No', 1, '2021-9-13 10:52:51', 0, '0.000', 1, 0, '', NULL, 1, '76|117|', '', '2021-06-23', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(1566, 44, 117, 'ZURIMMY JATZEL', 'CASTRO', 'CISNEROS', 'ZURIMMY JATZEL CASTRO CISNEROS', '(669) 326-2789', '', '', '', 402, 401, '', 'Zury', 'No', 1, '2022-12-12 18:26:26', 0, '0.000', 1, 0, '', NULL, 1, '', '', '2022-10-02', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(1731, 44, 117, 'KENIA MICHELLE', 'PEREZ', 'ONTIVEROS', 'KENIA MICHELLE PEREZ ONTIVEROS', '(669) 290-4756', '', '', '', 402, NULL, '', 'kenia1', 'No', 2, '2022-1-24 13:16:25', 0, '0.000', 1, 0, '', NULL, 1, '', '', '2021-10-04', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(1954, 44, 117, 'JOANA PAULINA', 'GARCIA', 'HERNANDEZ', 'JOANA PAULINA GARCIA HERNANDEZ', '(744) 473-7530', '', '', '', 402, NULL, '', 'Paulin', 'No', 2, '2022-4-22 08:31:02', 0, '0.000', 1, 0, '', NULL, 1, '76|117|', '', '2022-02-14', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(2196, 44, 117, 'SELENE ISABEL', 'AMPARO ', 'VEGA', 'SELENE ISABEL AMPARO  VEGA', '(669) 267-4051', '', '', '', 401, 402, '', 'Selenei', 'No', 2, '2023-5-20 09:15:53', 0, '0.000', 1, 0, '', NULL, 1, '76|117|', '', '2022-05-21', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(2273, 44, 117, 'MONICA', 'VIELMA', 'ZUANI', 'MONICA VIELMA ZUANI', '', '', '', '', 402, 401, '', 'monica', 'Si', 1, '2023-7-12 17:16:50', 0, '0.000', 1, 1, 'Escritorio|Móvil|', NULL, 0, '76|117|', '', '2022-06-24', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(2998, 44, 117, 'DANNA SICARU', 'LOAIZA', 'MARCHEN', 'DANNA SICARU LOAIZA MARCHEN', '', '', '', '', 402, 401, '', 'DannaL', 'No', 1, '2023-7-12 13:44:59', 0, '0.000', 1, 0, '', NULL, 0, '76|117|', '', '2024-02-07', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(3706, 44, 117, 'VALERIA', 'ORTIZ', 'MONTES DE OCA', 'VALERIA ORTIZ MONTES DE OCA', '(669) 216-2099', '', '', '', 402, NULL, '', 'Valeria1', 'No', 1, '', 0, '0.000', 7, 0, '', NULL, 0, '76|117|', '', '0000-00-00', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(3811, 44, 117, 'DANNA', 'LOAIZA', 'MARCHEN', 'DANNA LOAIZA MARCHEN', '', '', '', '', 401, NULL, '', 'DannaSi', 'No', 1, '', 0, '0.000', 1, 1, 'Escritorio|', NULL, 0, '76|117|', '', NULL, '', '#848484', 'white', 'precio_normal', 0, '', ''),
(4020, 44, 117, 'NAYDELIN', 'ROBLES ', 'GONZALEZ ', 'NAYDELIN ROBLES  GONZALEZ ', '', '', '', '', 401, NULL, '', 'Nayd', 'No', 1, '', 0, '0.000', 1, 0, '', NULL, 0, '117|', '', '2024-07-01', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(4521, 44, 117, 'SARAHI', 'LOPEZ', 'MARISCAL', 'SARAHI LOPEZ MARISCAL', '(669) 403-3316', '', '', '', 401, NULL, '', 'eslm', 'No', 1, '', 0, '0.000', 1, 1, 'Escritorio|', NULL, 0, '117|', '', NULL, '', '#848484', 'white', 'precio_normal', 0, '', ''),
(4833, 44, 117, 'NOEMI', 'CRUZ', 'PADILLA', 'NOEMI CRUZ PADILLA', '(669) 404-1664', '', '', '', 402, NULL, '', 'SNoemi', 'No', 1, '', 0, '0.000', 1, 1, 'Escritorio|', NULL, 0, '117|', '', '2025-05-03', '', '#848484', 'white', 'precio_normal', 0, '', ''),
(4924, 44, 117, 'GLORIA', 'FAUSTO', 'GARCIA', 'GLORIA FAUSTO GARCIA', '(669) 312-7284', '', '', '', 402, 401, '', 'gloriag', 'Si', 1, '', 0, '0.000', 1, 1, 'Escritorio|', NULL, 0, '76|117|', '', NULL, '', '#848484', 'white', 'precio_normal', 0, '', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tusuarios`
--
ALTER TABLE `tusuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tusuarios_id_empresa_base` (`id_empresa_base`),
  ADD KEY `tusuarios_handel` (`handel`),
  ADD KEY `tusuarios_id_permiso` (`id_permiso`),
  ADD KEY `tusuarios_ibfk_4` (`id_permiso_2`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tusuarios`
--
ALTER TABLE `tusuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5483;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tusuarios`
--
ALTER TABLE `tusuarios`
  ADD CONSTRAINT `tusuarios_ibfk_1` FOREIGN KEY (`handel`) REFERENCES `tempresas` (`handel`),
  ADD CONSTRAINT `tusuarios_ibfk_2` FOREIGN KEY (`id_empresa_base`) REFERENCES `tempresas_base` (`id`),
  ADD CONSTRAINT `tusuarios_ibfk_3` FOREIGN KEY (`id_permiso`) REFERENCES `tpermisos` (`id`),
  ADD CONSTRAINT `tusuarios_ibfk_4` FOREIGN KEY (`id_permiso_2`) REFERENCES `tpermisos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
