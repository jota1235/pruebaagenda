-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 13, 2025 at 12:00 PM
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
-- Table structure for table `tpermisos`
--

CREATE TABLE `tpermisos` (
  `id` int(11) NOT NULL,
  `handel` int(11) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `ids_privilegios` longtext,
  `tipo_viz` enum('1','2') NOT NULL DEFAULT '2',
  `moduloInicio` varchar(30) NOT NULL,
  `visible` enum('0','1') NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tpermisos`
--

INSERT INTO `tpermisos` (`id`, `handel`, `nombre`, `ids_privilegios`, `tipo_viz`, `moduloInicio`, `visible`) VALUES
(401, 117, 'CAJERO', 'mnuInicio_ID|optAppDesctos_ID|optMarkEmpCit|optMarkValFalc|mnuInventarios_ID|subAlmacenesd_ID|optSelectSucursal_Almacen_ID|optAjustarInventario_ID|optOmiteAuthAlmacen_ID|subSalInvent_ID|idNewSalidaAlmacen|optCancelSal_ID|subEntInvent_ID|idNewEntradaAlmacen|optCancelEnt_ID|subTransferInv_ID|subRecepcion_ID|mnuVentas_ID|subClientes_ID|subNuevoCliente_ID|mnuRegistroCFDI_ID|subMovCaja_ID|MovAddRapid|subReportesFinancieros_ID|optViwCortesCaja_ID|optFlash_ID|optRangoFechas_ID|subCuentasxCobrar_ID|optSelectSucursal_CuentasxCob|optNotCtasxCob_ID|optNotCtasxCob_ID|mnuConfiguracion_ID|subAbreCaja_ID|optOpCorteAnt_ID|optBlkCaduci_ID|optMultiSess_ID|opOcultaPorcc_ID|subCerrarSes_ID|', '2', '', '1'),
(402, 117, 'DEPILADORA', 'mnuInicio_ID|optAppDesctos_ID|mnuCompras_ID|subProductos_ID|mnuVentas_ID|subClientes_ID|subNuevoCliente_ID|mnuConfiguracion_ID|subAbreCaja_ID|optOpCorteAnt_ID|optMultiSess_ID|', '2', '', '1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tpermisos`
--
ALTER TABLE `tpermisos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tpermisos_handel` (`handel`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tpermisos`
--
ALTER TABLE `tpermisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1319;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tpermisos`
--
ALTER TABLE `tpermisos`
  ADD CONSTRAINT `tpermisos_ibfk_1` FOREIGN KEY (`handel`) REFERENCES `tempresas` (`handel`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
