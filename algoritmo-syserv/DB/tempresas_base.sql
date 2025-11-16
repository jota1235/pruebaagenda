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
-- Table structure for table `tempresas_base`
--

CREATE TABLE `tempresas_base` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(80) DEFAULT NULL,
  `domicilio_empresa` varchar(150) DEFAULT NULL,
  `nombre_contacto` varchar(80) DEFAULT NULL,
  `tel1_contacto` varchar(18) DEFAULT NULL,
  `tel2_contacto` varchar(18) DEFAULT 'menuAcordeon',
  `email_contacto` varchar(40) DEFAULT NULL,
  `nota_especial` varchar(20) DEFAULT NULL,
  `creditos` text,
  `activa` varchar(3) NOT NULL,
  `ScriptCredito` text NOT NULL,
  `modulosActivos` text NOT NULL,
  `ban_comisiones` int(2) NOT NULL DEFAULT '1',
  `id_handel_base` int(11) DEFAULT NULL COMMENT 'Es la sucursal de la cual se tomaran los registros para sincronizar en el resto de sucursales',
  `id_usuario_contacto` int(11) DEFAULT NULL COMMENT 'id de usuario que sera el contacto para los pedidos de material en franquicias',
  `suc_licencias` text NOT NULL COMMENT 'Guarda el listado de las sucursales a las que se aplicará la licencia mensual',
  `importe_pago_lic` text NOT NULL,
  `is_factura_lic` text NOT NULL,
  `notif_cumple` tinyint(2) NOT NULL DEFAULT '1' COMMENT 'Notifica fecha de compleaño del cliente',
  `notif_inactiv` tinyint(2) NOT NULL DEFAULT '1' COMMENT 'Notifica tiempo de inactividad de clientes',
  `periodSinActiv` int(11) NOT NULL DEFAULT '30' COMMENT 'Cuantifica  tiempo sin compras de los clientes',
  `marginPrint` varchar(10) NOT NULL DEFAULT '0px' COMMENT 'Margen para impresión de Tickets en sistema',
  `seg_insumos` tinyint(2) NOT NULL DEFAULT '0' COMMENT 'Aplicar Seguimiento de Insumos',
  `seg_rf` tinyint(4) NOT NULL DEFAULT '2' COMMENT '1= Al cierre de venta., 2=Al cierre del turno',
  `seg_crf` tinyint(4) NOT NULL DEFAULT '2' COMMENT '1=Para todas las ventas con servicios, 2= Solo ventas con insumos',
  `list_suc_seg` varchar(500) NOT NULL DEFAULT 'all' COMMENT 'Lista de sucursales para aplicar la validación de seguimiento de insumos',
  `tiempo_notificacion_1` int(11) NOT NULL DEFAULT '0' COMMENT 'Configuración de envío de notificación',
  `status_send_1` enum('-Indistinto-','Reservado','Confirmado','Cobrado') NOT NULL DEFAULT '-Indistinto-' COMMENT 'Status para enviar una notificación SMS',
  `send_type_1` enum('- Todos -','SMS','Email') NOT NULL DEFAULT '- Todos -' COMMENT 'Tipo de entrega para notificaciones a clientes',
  `tiempo_notificacion_2` int(11) NOT NULL DEFAULT '0' COMMENT 'Configuración de envío de notificación',
  `status_send_2` enum('-Indistinto-','Reservado','Confirmado','Cobrado') NOT NULL DEFAULT '-Indistinto-' COMMENT 'Status para enviar una notificación SMS',
  `send_type_2` enum('- Todos -','SMS','Email') NOT NULL DEFAULT '- Todos -' COMMENT 'Tipo de entrega para notificaciones a clientes',
  `opDescIVA` tinyint(2) NOT NULL DEFAULT '0' COMMENT 'Descontar IVA en comisiones de personal',
  `dias_ctespr` int(11) NOT NULL DEFAULT '365' COMMENT 'Cantidad de dias de margen para contabilizar las ventas en clientes premium',
  `nventa_ctespr` int(11) NOT NULL DEFAULT '-1' COMMENT 'Cantidad de compras para calculo de clientes premium.',
  `opSumDesc` tinyint(2) NOT NULL DEFAULT '0' COMMENT 'Incluir descuentos en totales de ventas',
  `tolerancias` varchar(50) NOT NULL DEFAULT '10,15,15' COMMENT 'Tolerancia de entrada, tolerancia_entrada_anticipada, tolerancia_salida_tardia',
  `ban_caducidad_point` int(2) NOT NULL DEFAULT '1' COMMENT 'Establece caducidad de puntos',
  `add_propina_ta` int(2) NOT NULL DEFAULT '0' COMMENT 'Sumar propina TA en pago a empleados',
  `porc_desc_prop` decimal(10,2) NOT NULL COMMENT 'Porcentaje de descuento en propina',
  `param_config` text COMMENT 'Mas parámetros de configuración en formato json y base64'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tempresas_base`
--

INSERT INTO `tempresas_base` (`id`, `nombre_empresa`, `domicilio_empresa`, `nombre_contacto`, `tel1_contacto`, `tel2_contacto`, `email_contacto`, `nota_especial`, `creditos`, `activa`, `ScriptCredito`, `modulosActivos`, `ban_comisiones`, `id_handel_base`, `id_usuario_contacto`, `suc_licencias`, `importe_pago_lic`, `is_factura_lic`, `notif_cumple`, `notif_inactiv`, `periodSinActiv`, `marginPrint`, `seg_insumos`, `seg_rf`, `seg_crf`, `list_suc_seg`, `tiempo_notificacion_1`, `status_send_1`, `send_type_1`, `tiempo_notificacion_2`, `status_send_2`, `send_type_2`, `opDescIVA`, `dias_ctespr`, `nventa_ctespr`, `opSumDesc`, `tolerancias`, `ban_caducidad_point`, `add_propina_ta`, `porc_desc_prop`, `param_config`) VALUES
(44, 'LA BELLA MAZATLÁN', 'RIó BALUARTE 810, COL. PALOS PRIETOS', 'ARABELLA GARCíA MADRID', '(667) 102-8921', 'menuAcordeon', '', '', '[2025/01][2025/02][2025/03][2025/04][2025/05][2025/06][2025/07][2025/08][2025/09][2025/10][2025/11]', 'SI', 'function otorgaCredito(){          \r\n     $(|#txtcredito_ref|).val( $(|#fecha_entrada|).val() );\r\n     $(|#txtcredito_ref|).prop(|disabled|,true);    \r\n}\r\n\r\nfunction nuevoAbono(){\r\n     var AdeudoInicial= parseFloat($(|#AdeudoInicial|).val());\r\n     var SaldoActual= parseFloat($(|#SaldoActual|).val());\r\n     var RecargosAnteriores= parseFloat($(|#RecargosAnteriores|).val());\r\n     var TotalAbonos= parseFloat($(|#TotalAbonos|).val());\r\n     var DiasRetraso= parseInt($(|#DiasRetraso|).val());\r\n     var FechaActual= $(|#FechaActual|).val();\r\n     var FechaCredito= $(|#FechaCredito|).val();\r\n     var ImporteRecargoxDia=0.0;\r\n     var ImporteRecargoTotal=0.0;  \r\n     var TotalAdeudoActual=0.0;\r\n     var ParcialidadMinima=0.0;\r\n\r\n\r\n     /*Calcula importe de recargo por día de retraso en la fecha de pago esperada*/\r\n     /*Considera cobrar el 10% del adeudo actual*/     \r\n\r\n         ImporteRecargoxDia= parseInt(SaldoActual * 0.10);\r\n         ImporteRecargoTotal= ImporteRecargoxDia * DiasRetraso;  \r\n\r\n\r\n\r\n     /*Calcula automáticamente la fecha del próximo pago*/\r\n\r\n         SumarDias(FechaActual,|15|,|FechaProximoPago|);\r\n\r\n     /*Establece la fecha limite de pago*/\r\n     /*Para este ejemplo un mes despues de la fecha en que se otorgo el credito*/\r\n\r\n         SumarDias(FechaCredito,|30|,|FechaLimitePago|);\r\n\r\n\r\n     /*Calculo del Adeudo Total*/\r\n\r\n         TotalAdeudoActual= AdeudoInicial + RecargosAnteriores + ImporteRecargoTotal - TotalAbonos;\r\n\r\n\r\n     /*Pago mínimo que debe cubrir el cliente en el pago parcial*/\r\n     /*Para este ejemplo debe pagar al menos el importe de recargo*/\r\n     /*Si no existe recargo, mínimo debe pagar $100.00*/\r\n\r\n         if( ImporteRecargoTotal > 0 ){\r\n            ParcialidadMinima=ImporteRecargoTotal;\r\n         } else {\r\n            if( TotalAdeudoActual < 100 ){\r\n                 ParcialidadMinima=TotalAdeudoActual;   \r\n            } else {\r\n                 ParcialidadMinima=100;   \r\n            }\r\n         }\r\n\r\n\r\n     /*Saidas Formateadas*/\r\n\r\n         $(|#ImporteRecargoxDia|).val( format(ImporteRecargoxDia) );\r\n         $(|#ImporteRecargoTotal|).val( format(ImporteRecargoTotal) );\r\n         $(|#TotalAdeudoActual|).val( format(TotalAdeudoActual) );\r\n         $(|#ParcialidadMinima|).val( format(ParcialidadMinima) );   \r\n}', 'PUNTO DE VENTA|AJUSTES GENERALES|', 1, NULL, NULL, '76|117|', '76/1032.4|117/1032.4|', '76/1|117/1|', 1, 1, 30, '20px', 0, 2, 2, 'all', 1, '-Indistinto-', '- Todos -', -2, '-Indistinto-', '- Todos -', 0, 365, -1, 0, '30,5,5,60', 1, 0, '0.00', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tempresas_base`
--
ALTER TABLE `tempresas_base`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tempresas_base`
--
ALTER TABLE `tempresas_base`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=188;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
