-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 13, 2025 at 12:01 PM
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
-- Table structure for table `tempresas`
--

CREATE TABLE `tempresas` (
  `handel` int(10) NOT NULL,
  `id_empresa_base` int(11) NOT NULL DEFAULT '1',
  `tiempo_sesion` int(10) DEFAULT NULL,
  `menuLateral_color_fondo` varchar(10) DEFAULT NULL,
  `menuLateral_color_fondo_resalte` varchar(10) DEFAULT NULL,
  `menuLateral_color_texto` varchar(10) DEFAULT NULL,
  `sub_menuLateral_color_fondo` varchar(10) DEFAULT NULL,
  `sub_menuLateral_color_texto` varchar(10) DEFAULT NULL,
  `sub_menuLateral_color_add` varchar(10) DEFAULT NULL,
  `menuLateral_color_texto_inabil` varchar(10) DEFAULT NULL,
  `sub_menuLateral_color_texto_inabil` varchar(10) DEFAULT NULL,
  `color_barra_encabezado` varchar(10) DEFAULT NULL,
  `color_texto_slogan` varchar(10) DEFAULT NULL,
  `sloganEmpresa_Sel` varchar(80) DEFAULT NULL,
  `nombreSucursal_Sel` varchar(40) DEFAULT NULL,
  `nombreEmpresa_Tick` varchar(150) DEFAULT NULL COMMENT 'Nombre de la empresa tal como debe aparecer en el encabezado del ticket',
  `textoCopyRight` varchar(80) DEFAULT NULL,
  `color_texto_titulo1` varchar(10) DEFAULT NULL,
  `color_fondo_btnComando` varchar(10) DEFAULT NULL,
  `ancho_contenedor_opciones_menu_rapido` varchar(10) DEFAULT NULL,
  `panelComandosRapidos_color_fondo` varchar(10) DEFAULT NULL,
  `color_texto_titulo_menu_rapido` varchar(10) DEFAULT NULL,
  `color_texto_subtitulo_menu_rapido` varchar(10) DEFAULT NULL,
  `color_texto_contenedor_opciones_menu_rapido` varchar(10) DEFAULT NULL,
  `color_texto_inabil_contenedor_opciones_menu_rapido` varchar(10) DEFAULT NULL,
  `color_fondo_contenedor_opciones_menu_rapido` varchar(10) DEFAULT NULL,
  `alto_minimo_contenedor_opciones_menu_rapido` varchar(10) DEFAULT NULL,
  `color_texto_btnComando` varchar(10) DEFAULT NULL,
  `color_fondo_btnNuevo` varchar(10) DEFAULT NULL,
  `color_fondo_btnImportar` varchar(10) DEFAULT NULL,
  `color_fondo_btnExportar` varchar(10) DEFAULT NULL,
  `color_fondo_btnLotesPedimentos` varchar(10) DEFAULT NULL,
  `color_fondo_btnLista` varchar(10) DEFAULT NULL,
  `color_fondo_btnConfigurar` varchar(10) DEFAULT NULL,
  `color_fondo_panel_busqueda` varchar(10) DEFAULT NULL,
  `color_linea_izquierda_panel_busqueda` varchar(10) DEFAULT NULL,
  `ColorFondoEncabezado` varchar(10) DEFAULT NULL,
  `ColorTextoEncabezado` varchar(10) DEFAULT NULL,
  `color_resalte_listin` varchar(10) DEFAULT NULL,
  `ColorFilaPar` varchar(10) DEFAULT NULL,
  `ColorFilaInpar` varchar(10) DEFAULT NULL,
  `color_fondo_panel_tip` varchar(10) DEFAULT NULL,
  `color_texto_panel_tip` varchar(10) DEFAULT NULL,
  `color_linea_izquierda_panel_tip` varchar(10) DEFAULT NULL,
  `Direccion` varchar(100) DEFAULT NULL,
  `Telefono` varchar(50) DEFAULT NULL,
  `PrecioActivo` varchar(20) DEFAULT NULL,
  `PrecioActivo2` varchar(20) NOT NULL,
  `includeInfoFiscal` varchar(1) NOT NULL DEFAULT '0',
  `rfc_fiscal` varchar(30) NOT NULL,
  `email_fiscal` varchar(40) NOT NULL,
  `razon_social` varchar(60) NOT NULL,
  `calle_fiscal` varchar(50) NOT NULL,
  `num_exterior_fiscal` varchar(30) NOT NULL,
  `num_interior_fiscal` varchar(30) NOT NULL,
  `colonia_fiscal` varchar(20) NOT NULL,
  `localidad_fiscal` varchar(30) NOT NULL,
  `municipio_fiscal` varchar(35) NOT NULL,
  `id_estado_fiscal` int(11) NOT NULL,
  `cp_fiscal` varchar(6) NOT NULL,
  `regimen` varchar(90) NOT NULL,
  `serie` varchar(10) NOT NULL,
  `noaprobacion` varchar(30) NOT NULL,
  `no_certificado` varchar(30) NOT NULL,
  `passwCertificado` varchar(20) NOT NULL,
  `banUssPrueba` int(2) NOT NULL DEFAULT '0',
  `ControlFolio` int(11) NOT NULL DEFAULT '1',
  `formatoControlFolio` varchar(30) NOT NULL DEFAULT '{FOLIO}',
  `plantillaEmail` text NOT NULL,
  `AsuntoMail` varchar(100) NOT NULL DEFAULT 'Su Factura {FOLIO} de {EMI_RAZON}',
  `Destinatarios` varchar(150) NOT NULL DEFAULT '{CTE_EMAIL}',
  `CopiaOculta` varchar(150) NOT NULL,
  `ban_enviar_email` int(2) NOT NULL DEFAULT '1',
  `ban_descarga_zip` int(2) NOT NULL DEFAULT '1',
  `chkApp` int(3) NOT NULL DEFAULT '0' COMMENT 'Indica si la sucursal estara disponible en la aplicación',
  `activa` enum('No','Si') NOT NULL DEFAULT 'Si',
  `isDemo` tinyint(2) NOT NULL DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tempresas`
--

INSERT INTO `tempresas` (`handel`, `id_empresa_base`, `tiempo_sesion`, `menuLateral_color_fondo`, `menuLateral_color_fondo_resalte`, `menuLateral_color_texto`, `sub_menuLateral_color_fondo`, `sub_menuLateral_color_texto`, `sub_menuLateral_color_add`, `menuLateral_color_texto_inabil`, `sub_menuLateral_color_texto_inabil`, `color_barra_encabezado`, `color_texto_slogan`, `sloganEmpresa_Sel`, `nombreSucursal_Sel`, `nombreEmpresa_Tick`, `textoCopyRight`, `color_texto_titulo1`, `color_fondo_btnComando`, `ancho_contenedor_opciones_menu_rapido`, `panelComandosRapidos_color_fondo`, `color_texto_titulo_menu_rapido`, `color_texto_subtitulo_menu_rapido`, `color_texto_contenedor_opciones_menu_rapido`, `color_texto_inabil_contenedor_opciones_menu_rapido`, `color_fondo_contenedor_opciones_menu_rapido`, `alto_minimo_contenedor_opciones_menu_rapido`, `color_texto_btnComando`, `color_fondo_btnNuevo`, `color_fondo_btnImportar`, `color_fondo_btnExportar`, `color_fondo_btnLotesPedimentos`, `color_fondo_btnLista`, `color_fondo_btnConfigurar`, `color_fondo_panel_busqueda`, `color_linea_izquierda_panel_busqueda`, `ColorFondoEncabezado`, `ColorTextoEncabezado`, `color_resalte_listin`, `ColorFilaPar`, `ColorFilaInpar`, `color_fondo_panel_tip`, `color_texto_panel_tip`, `color_linea_izquierda_panel_tip`, `Direccion`, `Telefono`, `PrecioActivo`, `PrecioActivo2`, `includeInfoFiscal`, `rfc_fiscal`, `email_fiscal`, `razon_social`, `calle_fiscal`, `num_exterior_fiscal`, `num_interior_fiscal`, `colonia_fiscal`, `localidad_fiscal`, `municipio_fiscal`, `id_estado_fiscal`, `cp_fiscal`, `regimen`, `serie`, `noaprobacion`, `no_certificado`, `passwCertificado`, `banUssPrueba`, `ControlFolio`, `formatoControlFolio`, `plantillaEmail`, `AsuntoMail`, `Destinatarios`, `CopiaOculta`, `ban_enviar_email`, `ban_descarga_zip`, `chkApp`, `activa`, `isDemo`, `fecha_creacion`) VALUES
(117, 44, 90, '#503159', '#9f4e8d', '#e6e6e6', '#f5f5f4', '#848484', '#499da7', '#848484', '#bdbdbd', '#499da7', '#499da7', 'Siéntete Bella', 'Suc. Real Del Valle', 'Empresa', 'DorisErp Todos los Derechos Reservados', '#0489b1', '#499da7', '10em', '#86629e', '#ffffff', '#ffffff', '#d8d8d8', '#086a87', '#000000', '8.3em', '#ffffff', '#499da7', '#848484', '#9f4e8d', '#f6463b', '#6f4589', '#499da7', '#f5f5f4', '#6f4589', '#f2f2f2', '#999999', '#fbeff5', '#f9f9f9', '#ffffff', '#f5f5f4', '#412c53', '#6f4589', 'Av. Libramiento 2', '(669) 105-0932', 'Precio Normal', 'Precio Normal', '0', '', '', '', '', '', '', '', '', '', 0, '', '', '', '', '', '', 0, 1, '{FOLIO}', '', 'Su Factura {FOLIO} de {EMI_RAZON}', '{CTE_EMAIL}', '', 1, 1, 1, 'Si', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tempresas`
--
ALTER TABLE `tempresas`
  ADD PRIMARY KEY (`handel`),
  ADD KEY `tempresas_handel` (`handel`),
  ADD KEY `tempresas_id_empresa_base` (`id_empresa_base`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tempresas`
--
ALTER TABLE `tempresas`
  MODIFY `handel` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=296;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
