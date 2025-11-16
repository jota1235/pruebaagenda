-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 13, 2025 at 11:58 AM
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
-- Table structure for table `tconfig_gral`
--

CREATE TABLE `tconfig_gral` (
  `id` int(11) NOT NULL,
  `handel` int(11) NOT NULL,
  `id_empresa_base` int(11) NOT NULL DEFAULT '1',
  `puesto_servicio` varchar(30) DEFAULT NULL,
  `hora_inicio` int(11) DEFAULT NULL,
  `minutos_incremento` int(11) DEFAULT NULL,
  `hora_fin` int(11) DEFAULT NULL,
  `color_libre` varchar(15) NOT NULL,
  `color_reservada` varchar(10) NOT NULL,
  `color_confirmada` varchar(10) NOT NULL,
  `color_cancelada` varchar(10) NOT NULL,
  `color_cobrado` varchar(11) NOT NULL,
  `color_fuera_tiempo` varchar(10) NOT NULL,
  `conf_personal_glob` int(11) NOT NULL DEFAULT '1',
  `conf_sistema_apartado` int(11) NOT NULL DEFAULT '1',
  `conf_otorgar_credito` int(11) NOT NULL DEFAULT '1',
  `moduloInicio` varchar(50) NOT NULL DEFAULT 'calendario',
  `rangoHora` enum('SI','NO') NOT NULL DEFAULT 'SI',
  `rangoManual` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `tiempo_notificacion` int(11) NOT NULL DEFAULT '0',
  `Filas` varchar(1000) NOT NULL,
  `num_columnas` int(11) NOT NULL,
  `etiquet_cto` varchar(50) NOT NULL DEFAULT 'Producto o Servicio:',
  `etiquet_cant` int(11) NOT NULL DEFAULT '10' COMMENT 'Reutilizado para guardar Porcentaje en Puntos que genera una venta de servicios.',
  `serv_unico` varchar(2) NOT NULL DEFAULT '0',
  `most_disponibilidad` varchar(2) NOT NULL DEFAULT '0',
  `mod_colums` varchar(2) NOT NULL DEFAULT '1',
  `pedir_confirm` varchar(2) NOT NULL DEFAULT '0',
  `conf_filas` varchar(1000) NOT NULL,
  `vizNombreEmpresa` enum('1','0') NOT NULL DEFAULT '0',
  `alReservar` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `asuntoAlReservar` varchar(100) NOT NULL,
  `destinatAlReservar` varchar(150) NOT NULL,
  `coAlReservar` varchar(150) NOT NULL,
  `cuerpoAlReservar` varchar(1000) NOT NULL,
  `alConfirmar` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `asuntoAlConfirmar` varchar(100) NOT NULL,
  `destinatAlConfirmar` varchar(150) NOT NULL,
  `coAlConfirmar` varchar(150) NOT NULL,
  `cuerpoAlConfirmar` varchar(1000) NOT NULL,
  `alCancelar` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `asuntoAlCancelar` varchar(100) NOT NULL,
  `destinatAlCancelar` varchar(150) NOT NULL,
  `coAlCancelar` varchar(150) NOT NULL,
  `cuerpoAlCancelar` varchar(1000) NOT NULL,
  `alCobrar` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `asuntoAlCobrar` varchar(100) NOT NULL,
  `destinatAlCobrar` varchar(150) NOT NULL,
  `coAlCobrar` varchar(150) NOT NULL,
  `cuerpoAlCobrar` varchar(1000) NOT NULL,
  `alCaducar` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `asuntoAlCaducar` varchar(100) NOT NULL,
  `destinatAlCaducar` varchar(150) NOT NULL,
  `coAlCaducar` varchar(150) NOT NULL,
  `cuerpoAlCaducar` varchar(1000) NOT NULL,
  `optFolio` varchar(15) NOT NULL DEFAULT 'folio',
  `ticketVenta` enum('SI','NO') NOT NULL DEFAULT 'SI',
  `configTicketVenta` varchar(1500) NOT NULL,
  `Numero` varchar(50) NOT NULL,
  `Ciudad` varchar(35) NOT NULL,
  `CodPostal` varchar(5) NOT NULL,
  `Rfc` varchar(15) NOT NULL,
  `ticketVentaPDF` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `Estado` varchar(30) NOT NULL,
  `Numero_interior` varchar(35) NOT NULL,
  `Colonia` varchar(50) NOT NULL,
  `chk_reportado_tarjeta` varchar(2) NOT NULL DEFAULT '0',
  `ExportRoming` int(11) NOT NULL DEFAULT '1' COMMENT 'Cambiado para almacenar el numero de copias del ticket',
  `ModTratamientos` varchar(2) NOT NULL DEFAULT '1',
  `ChangCitaCtaCob` varchar(2) NOT NULL DEFAULT '0',
  `ChangPrecioPagCta` varchar(2) NOT NULL DEFAULT '0',
  `CaptMontosDinero` varchar(2) NOT NULL DEFAULT '0',
  `appliDescuentos` varchar(5) NOT NULL COMMENT 'Cambiada para almacenar Cantidad de columnas',
  `vizAnticipos` varchar(2) NOT NULL DEFAULT '0',
  `vizNombreTerapeuta` varchar(2) NOT NULL DEFAULT '0',
  `editCtasCobb` varchar(2) NOT NULL DEFAULT '0',
  `Notifi_Sonora` enum('1','0') NOT NULL DEFAULT '0',
  `Minute_Notifi` int(11) NOT NULL DEFAULT '2',
  `hora_inicio_app` decimal(11,2) NOT NULL,
  `hora_fin_app` int(11) NOT NULL,
  `medioPromoOblig` int(11) NOT NULL DEFAULT '0',
  `noC` varchar(15) NOT NULL COMMENT 'Sirve para evitar el cache en las imagenes del sistema, como el encabezado.'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tconfig_gral`
--

INSERT INTO `tconfig_gral` (`id`, `handel`, `id_empresa_base`, `puesto_servicio`, `hora_inicio`, `minutos_incremento`, `hora_fin`, `color_libre`, `color_reservada`, `color_confirmada`, `color_cancelada`, `color_cobrado`, `color_fuera_tiempo`, `conf_personal_glob`, `conf_sistema_apartado`, `conf_otorgar_credito`, `moduloInicio`, `rangoHora`, `rangoManual`, `tiempo_notificacion`, `Filas`, `num_columnas`, `etiquet_cto`, `etiquet_cant`, `serv_unico`, `most_disponibilidad`, `mod_colums`, `pedir_confirm`, `conf_filas`, `vizNombreEmpresa`, `alReservar`, `asuntoAlReservar`, `destinatAlReservar`, `coAlReservar`, `cuerpoAlReservar`, `alConfirmar`, `asuntoAlConfirmar`, `destinatAlConfirmar`, `coAlConfirmar`, `cuerpoAlConfirmar`, `alCancelar`, `asuntoAlCancelar`, `destinatAlCancelar`, `coAlCancelar`, `cuerpoAlCancelar`, `alCobrar`, `asuntoAlCobrar`, `destinatAlCobrar`, `coAlCobrar`, `cuerpoAlCobrar`, `alCaducar`, `asuntoAlCaducar`, `destinatAlCaducar`, `coAlCaducar`, `cuerpoAlCaducar`, `optFolio`, `ticketVenta`, `configTicketVenta`, `Numero`, `Ciudad`, `CodPostal`, `Rfc`, `ticketVentaPDF`, `Estado`, `Numero_interior`, `Colonia`, `chk_reportado_tarjeta`, `ExportRoming`, `ModTratamientos`, `ChangCitaCtaCob`, `ChangPrecioPagCta`, `CaptMontosDinero`, `appliDescuentos`, `vizAnticipos`, `vizNombreTerapeuta`, `editCtasCobb`, `Notifi_Sonora`, `Minute_Notifi`, `hora_inicio_app`, `hora_fin_app`, `medioPromoOblig`, `noC`) VALUES
(116, 117, 44, 'DEPILADORA', 9, 15, 19, '#ffffff', '#f6cece', '#f5a9a9', '#a4a4a4', '#fa5858', '#e6e6e6', 1, 0, 0, 'calendario', 'SI', 'NO', 0, '', 0, 'Producto o Servicio:', 10, '0', '0', '1', '0', '', '0', 'NO', '', '', '', '', 'NO', '', '', '', '', 'NO', '', '', '', '', 'NO', '', '', '', '', 'NO', '', '', '', '', 'idVenta', 'SI', 'Gracias por tu visita !!', '8112', 'Mazatlán', '82010', 'VASA700515DF2', 'NO', 'Sinaloa', 'Local 17', 'Plaza del Atlántico ', '1', 1, '1', '0', '0', '0', '', '0', '0', 'NO', '0', 2, '0.00', 0, 1, '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tconfig_gral`
--
ALTER TABLE `tconfig_gral`
  ADD PRIMARY KEY (`id`),
  ADD KEY `handel` (`handel`),
  ADD KEY `id_empresa_base` (`id_empresa_base`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tconfig_gral`
--
ALTER TABLE `tconfig_gral`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=295;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tconfig_gral`
--
ALTER TABLE `tconfig_gral`
  ADD CONSTRAINT `tconfig_gral_ibfk_1` FOREIGN KEY (`handel`) REFERENCES `tempresas` (`handel`),
  ADD CONSTRAINT `tconfig_gral_ibfk_2` FOREIGN KEY (`id_empresa_base`) REFERENCES `tempresas_base` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
