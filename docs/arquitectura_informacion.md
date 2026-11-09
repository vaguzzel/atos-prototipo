# ATOS · Arquitectura de información

Prototipo interactivo de ATOS, la solución de Terabyte para el Terminal Portuario Aconcagua S.A. Documento generado desde el enrutador del prototipo.

## 1. Mapa del sitio

### Capa pública y acceso

- Portal público — `#/`
- Congestión del gate y del acceso vial — `#/publico/congestion`
- Verificar un certificado de cadena de frío — `#/verificar`
- Ingresar a ATOS — `#/ingresar`
- Segundo factor de autenticación — `#/segundo-factor`
- Recuperar el acceso — `#/recuperar`
- Registrar una organización — `#/registro`
- Resultado de la verificación — `#/verificar/:id`

### Comunes a todos los perfiles

- Inicio — `#/inicio`
- Bandeja de tareas — `#/tareas`
- Notificaciones — `#/notificaciones`
- Resultados de búsqueda — `#/buscar`
- Mis preferencias — `#/perfil`
- Ayuda — `#/ayuda`
- Mis exportaciones — `#/exportaciones`

### Gate, patio y equipos

- Retiro de importación — `#/gate/retiros`
- Puesto de atención — `#/gate/puesto`
- Carril de excepción — `#/gate/excepcion`
- Citas del día — `#/gate/citas`
- Nueva cita — `#/gate/citas/nueva`
- Estadía por camión — `#/gate/estadia`
- Congestión y capacidad — `#/gate/congestion`
- Mapa del patio — `#/patio`
- Condiciones dinámicas — `#/patio/condiciones`
- Verificaciones físicas — `#/patio/verificaciones`
- Remociones programadas — `#/patio/remociones`
- Barrido de bloques — `#/patio/barrido`
- Núcleo operacional — `#/patio/movimientos`
- Despacho de tractocamiones — `#/patio/tractos`
- Citas a tres bandas — `#/in02`
- Gemelo de operación — `#/patio/gemelo`
- Terminal de cabina RTG-07 — `#/cabina/patio`
- Cabina de la grúa de muelle G2 — `#/cabina/grua`
- ATOU 482913 7 — `#/contenedor/:c`
- Ingreso de exportación REC-1184 — `#/gate/visita/:id`
- Retiro REC-1184 — `#/gate/retiro/:id`

### Servicios transversales

- App Móvil de Terreno — `#/terreno`
- Continuidad: operación sin enlace — `#/continuidad`
- Identidad y acceso — `#/acceso`
- Conteo de emergencia — `#/acceso/emergencia`
- Mi credencial — `#/acceso/credencial`
- Documentos — `#/documentos`
- Firmas pendientes — `#/firma`
- Convivencia con el TOS 2012 — `#/convivencia`
- App de terreno: Ronda reefer y mantenimiento — `#/terreno/:perfil`
- REC-1184 — `#/documentos/:id`

### Patio refrigerado

- Mapa de tomas — `#/reefer`
- Alarmas — `#/reefer/alarmas`
- Evidencia de cadena de frío — `#/reefer/evidencia`
- Certificados de integridad — `#/reefer/certificados`
- Indicadores de alarma — `#/reefer/indicadores`
- Tablero REC-1184 — `#/reefer/tablero/:id`
- ATOU 482913 7 — `#/reefer/contenedor/:c`

### Nave y planificación

- Recaladas — `#/nave`
- Programación de sitios y grúas — `#/nave/programacion`
- Reglas del planificador — `#/nave/reglas`
- Productividad en tiempo real — `#/nave/productividad`
- Recalada REC-1184 — `#/nave/recalada/:id`
- Plan de estiba REC-1184 — `#/nave/plan/:id`

### Evidencia comercial y regulatoria

- Hechos facturables — `#/evidencia/hechos`
- Objeciones — `#/evidencia/objeciones`
- Conciliación diaria — `#/evidencia/conciliacion`
- Recuperar evidencia — `#/evidencia/recuperar`
- Inspecciones de autoridad — `#/inspecciones`
- Nueva cita de inspección — `#/inspecciones/nueva`
- Cumplimiento de la hora acordada — `#/inspecciones/cumplimiento`
- Energía y emisiones — `#/emisiones`
- Reporte para el verificador — `#/emisiones/verificador`
- Hecho REC-1184 — `#/evidencia/hecho/:id`
- Inspección REC-1184 — `#/inspecciones/:id`

### Portal e integraciones

- Portal de clientes — `#/portal`
- Mi carga — `#/portal/carga`
- Mis citas — `#/portal/citas`
- Validación documental — `#/portal/documentos`
- Instrucción de embarque — `#/portal/instruccion`
- Evidencia y objeciones — `#/portal/facturacion`
- Serie térmica — `#/portal/frio`
- Citas de inspección — `#/portal/inspecciones`
- Hub de Integración — `#/hub`
- Canal puente — `#/hub/puente`
- Autoridades y operador ferroviario — `#/hub/autoridades`
- Mensaje REC-1184 — `#/hub/mensaje/:id`

### Gestión

- Contrapartes externas — `#/terceros`
- Nueva contraparte — `#/terceros/nueva`
- Tablero analítico — `#/analitica`
- Indicadores del concedente — `#/analitica/concedente`
- Personas usuarias — `#/admin/personas`
- Roles y permisos — `#/admin/roles`
- Parámetros — `#/admin/parametros`
- Flujos de trabajo — `#/admin/flujos`
- Plantillas de notificación — `#/admin/notificaciones`
- Plantillas de documentos — `#/admin/documentos`
- Retención de registros — `#/admin/retencion`
- Auditoría — `#/admin/auditoria`
- REC-1184 — `#/terceros/:id`
- REC-1184 — `#/analitica/indicador/:id`
- Evento REC-1184 — `#/admin/auditoria/:id`

## 2. Diagrama de navegación

- Portal público → Ingresar → (Segundo factor) → Inicio del perfil
- Inicio → Citas → Visita de 7 pasos → Estadía; Visita ↔ Carril de excepción; Visita → Ficha del contenedor
- Inicio → Inspecciones → Detalle y aprobación → Acta firmada
- Inicio → Alarmas reefer → App de terreno; Alarmas → Evidencia y certificado

## 3. Taxonomía y nomenclatura

| Término | Significado |
|---|---|
| ATOS | Aconcagua Terminal Operating System: la plataforma de operación del terminal que propone Terabyte. |
| CLIENTE / Terminal Portuario Aconcagua | En los documentos, «el CLIENTE»; en la interfaz, Terminal Portuario Aconcagua. |
| TOS 2012 | El sistema de operación de 2012, que convive con ATOS hasta su retiro. Siempre con este nombre. |
| Adaptador del TOS 2012 | La fachada única por la que ATOS y el TOS 2012 conviven. |
| Hub de Integración | El componente de intercambio de mensajes con navieras, autoridades y el sistema de gestión empresarial. |
| Entorno Local de Continuidad (ELC) | La infraestructura local que mantiene la operación crítica sin enlace exterior. |
| Operación sin enlace | El estado en que el terminal opera con el ELC porque cayó el enlace exterior. |
| Marcha blanca | Período de operación supervisada antes de la producción plena. |
| Validación en sombra | Una regla o versión nueva se compara contra lo vigente sin afectar la operación. |
| Hecho facturable | Evento operacional sellado que respalda un cobro: tipo, cantidad, regla aplicada y evidencia. |
| Instrucción de embarque | Lo que el cliente instruye sobre su carga (consignatario, destino, bultos). No es sinónimo de orden de embarque. |
| Orden de embarque | La orden operacional del terminal para cargar un contenedor en la nave. |
| Nombrada | El turno asignado a un trabajador eventual; origina su credencial temporal. |
| Congelamiento | Período sin cambios en temporada (15 de diciembre a 30 de abril). |

## 4. Menús por perfil

### Empresa de transporte

- **Gate, patio y equipos**: Citas a tres bandas
- **Portal e integraciones**: Portal de clientes · Mis citas

### Conductor de camión

- **Servicios transversales**: App Móvil de Terreno

### Funcionario de gate

- **Gate, patio y equipos**: Puesto de atención · Citas del día · Carril de excepción · Estadía por camión · Congestión y capacidad · Retiro de importación · Mapa del patio · Condiciones dinámicas · Verificaciones físicas · Remociones programadas · Barrido de bloques · Núcleo operacional
- **Servicios transversales**: Documentos

### Cliente de carga

- **Gate, patio y equipos**: Citas a tres bandas
- **Portal e integraciones**: Portal de clientes · Mi carga · Validación documental · Instrucción de embarque · Evidencia y objeciones · Serie térmica · Citas de inspección
- **Servicios transversales**: Firmas pendientes

### Planificador de estiba y patio

- **Gate, patio y equipos**: Citas del día · Estadía por camión · Congestión y capacidad · Mapa del patio · Condiciones dinámicas · Verificaciones físicas · Remociones programadas · Barrido de bloques · Núcleo operacional · Citas a tres bandas · Gemelo de operación
- **Patio refrigerado**: Mapa de tomas · Alarmas · Evidencia de cadena de frío · Certificados de integridad · Indicadores de alarma
- **Nave y planificación**: Recaladas · Programación de sitios y grúas · Plan de estiba REC-1184 · Reglas del planificador · Productividad en tiempo real
- **Gestión**: Tablero analítico · Indicadores del concedente

### Supervisor de turno y de patio

- **Gate, patio y equipos**: Puesto de atención · Citas del día · Carril de excepción · Estadía por camión · Congestión y capacidad · Retiro de importación · Mapa del patio · Condiciones dinámicas · Verificaciones físicas · Remociones programadas · Barrido de bloques · Núcleo operacional · Despacho de tractocamiones · Terminal de cabina RTG-07 · Cabina de la grúa de muelle G2
- **Patio refrigerado**: Mapa de tomas · Alarmas · Evidencia de cadena de frío · Certificados de integridad · Indicadores de alarma
- **Nave y planificación**: Recaladas · Programación de sitios y grúas · Plan de estiba REC-1184 · Reglas del planificador · Productividad en tiempo real
- **Evidencia comercial y regulatoria**: Inspecciones de autoridad · Cumplimiento de la hora acordada
- **Gestión**: Tablero analítico · Indicadores del concedente
- **Servicios transversales**: App Móvil de Terreno · Identidad y acceso · Conteo de emergencia · Documentos · Convivencia con el TOS 2012 · Continuidad: operación sin enlace

### Operador de equipo de patio

- **Gate, patio y equipos**: Terminal de cabina RTG-07

### Operador de grúa de muelle

- **Gate, patio y equipos**: Cabina de la grúa de muelle G2

### Jefatura de operaciones

- **Gate, patio y equipos**: Puesto de atención · Citas del día · Carril de excepción · Estadía por camión · Congestión y capacidad · Retiro de importación · Mapa del patio · Condiciones dinámicas · Verificaciones físicas · Remociones programadas · Barrido de bloques · Núcleo operacional · Despacho de tractocamiones · Citas a tres bandas · Gemelo de operación · Terminal de cabina RTG-07 · Cabina de la grúa de muelle G2
- **Patio refrigerado**: Mapa de tomas · Alarmas · Evidencia de cadena de frío · Certificados de integridad · Indicadores de alarma
- **Nave y planificación**: Recaladas · Programación de sitios y grúas · Plan de estiba REC-1184 · Reglas del planificador · Productividad en tiempo real
- **Evidencia comercial y regulatoria**: Hechos facturables · Objeciones · Conciliación diaria · Recuperar evidencia · Inspecciones de autoridad · Cumplimiento de la hora acordada · Energía y emisiones · Reporte para el verificador
- **Portal e integraciones**: Portal de clientes · Hub de Integración · Canal puente · Autoridades y operador ferroviario
- **Gestión**: Contrapartes externas · Tablero analítico · Indicadores del concedente · Auditoría
- **Servicios transversales**: App Móvil de Terreno · Identidad y acceso · Conteo de emergencia · Documentos · Firmas pendientes · Convivencia con el TOS 2012 · Continuidad: operación sin enlace

### Administrador funcional

- **Gate, patio y equipos**: Citas del día · Estadía por camión · Congestión y capacidad
- **Portal e integraciones**: Portal de clientes · Hub de Integración · Canal puente · Autoridades y operador ferroviario
- **Gestión**: Contrapartes externas · Tablero analítico · Indicadores del concedente · Personas usuarias · Roles y permisos · Parámetros · Flujos de trabajo · Plantillas de notificación · Plantillas de documentos · Retención de registros · Auditoría
- **Servicios transversales**: Identidad y acceso · Conteo de emergencia · Documentos · Convivencia con el TOS 2012 · Continuidad: operación sin enlace

### Analista de facturación

- **Evidencia comercial y regulatoria**: Hechos facturables · Objeciones · Conciliación diaria · Recuperar evidencia
- **Gestión**: Contrapartes externas · Tablero analítico · Indicadores del concedente
- **Servicios transversales**: Documentos · Firmas pendientes

### Área de documentación

- **Gate, patio y equipos**: Citas del día · Estadía por camión · Congestión y capacidad · Mapa del patio · Condiciones dinámicas · Verificaciones físicas · Remociones programadas · Barrido de bloques
- **Evidencia comercial y regulatoria**: Inspecciones de autoridad · Cumplimiento de la hora acordada
- **Portal e integraciones**: Hub de Integración · Autoridades y operador ferroviario
- **Gestión**: Contrapartes externas
- **Servicios transversales**: Documentos · Firmas pendientes

### Protección portuaria y prevención de riesgos

- **Gestión**: Auditoría
- **Servicios transversales**: App Móvil de Terreno · Identidad y acceso · Conteo de emergencia

### Trabajador portuario

- **Servicios transversales**: Mi credencial

### Inspector de autoridad

- **Portal e integraciones**: Citas de inspección
- **Servicios transversales**: Firmas pendientes

### Verificador externo de emisiones

- **Evidencia comercial y regulatoria**: Reporte para el verificador

### Personal de ronda reefer y mantenimiento

- **Patio refrigerado**: Mapa de tomas · Alarmas · Evidencia de cadena de frío · Certificados de integridad · Indicadores de alarma
- **Servicios transversales**: App Móvil de Terreno

### Naviera no integrada

- **Portal e integraciones**: Canal puente

## 5. Jerarquía de la información

1. Nivel 1, módulo (menú principal).
2. Nivel 2, función (menú del módulo).
3. Nivel 3, registro (ficha o detalle).
4. Nivel 4, evento de origen (evidencia).

## 6. Rutas de tres interacciones o menos

| Perfil | Función | Ruta | Interacciones |
|---|---|---|---|
| Empresa de transporte | Reservar o cambiar una cita | Inicio → acceso rápido «Reservar o cambiar una cita» | 1 |
| Empresa de transporte | Estado de mis visitas | Inicio → acceso rápido «Estado de mis visitas» | 1 |
| Empresa de transporte | Citas a tres bandas | Inicio → acceso rápido «Citas a tres bandas» | 1 |
| Empresa de transporte | Congestión del gate y del acceso | Inicio → acceso rápido «Congestión del gate y del acceso» | 1 |
| Empresa de transporte | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Empresa de transporte | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Conductor de camión | Mi cita y mi destino | Inicio → acceso rápido «Mi cita y mi destino» | 1 |
| Conductor de camión | Congestión del gate | Inicio → acceso rápido «Congestión del gate» | 1 |
| Conductor de camión | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Conductor de camión | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Funcionario de gate | Puesto de atención | Inicio → acceso rápido «Puesto de atención» | 1 |
| Funcionario de gate | Ingreso guiado de exportación | Inicio → acceso rápido «Ingreso guiado de exportación» | 1 |
| Funcionario de gate | Carril de excepción | Inicio → acceso rápido «Carril de excepción» | 1 |
| Funcionario de gate | Citas del día | Inicio → acceso rápido «Citas del día» | 1 |
| Funcionario de gate | Estadía por camión | Inicio → acceso rápido «Estadía por camión» | 1 |
| Funcionario de gate | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Funcionario de gate | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Cliente de carga | Mi carga | Inicio → acceso rápido «Mi carga» | 1 |
| Cliente de carga | Instrucción de embarque | Inicio → acceso rápido «Instrucción de embarque» | 1 |
| Cliente de carga | Validación documental | Inicio → acceso rápido «Validación documental» | 1 |
| Cliente de carga | Evidencia y objeciones | Inicio → acceso rápido «Evidencia y objeciones» | 1 |
| Cliente de carga | Serie térmica | Inicio → acceso rápido «Serie térmica» | 1 |
| Cliente de carga | Citas de inspección | Inicio → acceso rápido «Citas de inspección» | 1 |
| Cliente de carga | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Cliente de carga | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Planificador de estiba y patio | Plan de estiba de Cóndor Austral | Inicio → acceso rápido «Plan de estiba de Cóndor Austral» | 1 |
| Planificador de estiba y patio | Condiciones de patio | Inicio → acceso rápido «Condiciones de patio» | 1 |
| Planificador de estiba y patio | Reglas del planificador | Inicio → acceso rápido «Reglas del planificador» | 1 |
| Planificador de estiba y patio | Mapa del patio | Inicio → acceso rápido «Mapa del patio» | 1 |
| Planificador de estiba y patio | Gemelo de operación | Inicio → acceso rápido «Gemelo de operación» | 1 |
| Planificador de estiba y patio | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Planificador de estiba y patio | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Supervisor de turno y de patio | Verificaciones y divergencias | Inicio → acceso rápido «Verificaciones y divergencias» | 1 |
| Supervisor de turno y de patio | Alarmas reefer | Inicio → acceso rápido «Alarmas reefer» | 1 |
| Supervisor de turno y de patio | Puesto de gate | Inicio → acceso rápido «Puesto de gate» | 1 |
| Supervisor de turno y de patio | Despacho de tractocamiones | Inicio → acceso rápido «Despacho de tractocamiones» | 1 |
| Supervisor de turno y de patio | Convivencia con el TOS 2012 | Inicio → acceso rápido «Convivencia con el TOS 2012» | 1 |
| Supervisor de turno y de patio | App de terreno | Inicio → acceso rápido «App de terreno» | 1 |
| Supervisor de turno y de patio | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Supervisor de turno y de patio | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Operador de equipo de patio | Terminal de cabina | Inicio → acceso rápido «Terminal de cabina» | 1 |
| Operador de equipo de patio | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Operador de equipo de patio | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Operador de grúa de muelle | Cabina de la grúa de muelle | Inicio → acceso rápido «Cabina de la grúa de muelle» | 1 |
| Operador de grúa de muelle | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Operador de grúa de muelle | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Jefatura de operaciones | Programación de sitios y grúas | Inicio → acceso rápido «Programación de sitios y grúas» | 1 |
| Jefatura de operaciones | Tablero analítico | Inicio → acceso rápido «Tablero analítico» | 1 |
| Jefatura de operaciones | Convivencia con el TOS 2012 | Inicio → acceso rápido «Convivencia con el TOS 2012» | 1 |
| Jefatura de operaciones | Productividad de grúas | Inicio → acceso rápido «Productividad de grúas» | 1 |
| Jefatura de operaciones | Indicadores del concedente | Inicio → acceso rápido «Indicadores del concedente» | 1 |
| Jefatura de operaciones | Alarmas reefer | Inicio → acceso rápido «Alarmas reefer» | 1 |
| Jefatura de operaciones | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Jefatura de operaciones | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Administrador funcional | Personas usuarias | Inicio → acceso rápido «Personas usuarias» | 1 |
| Administrador funcional | Roles y permisos | Inicio → acceso rápido «Roles y permisos» | 1 |
| Administrador funcional | Parámetros | Inicio → acceso rápido «Parámetros» | 1 |
| Administrador funcional | Plantillas de notificación | Inicio → acceso rápido «Plantillas de notificación» | 1 |
| Administrador funcional | Auditoría | Inicio → acceso rápido «Auditoría» | 1 |
| Administrador funcional | Contrapartes externas | Inicio → acceso rápido «Contrapartes externas» | 1 |
| Administrador funcional | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Administrador funcional | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Analista de facturación | Hechos facturables | Inicio → acceso rápido «Hechos facturables» | 1 |
| Analista de facturación | Objeciones | Inicio → acceso rápido «Objeciones» | 1 |
| Analista de facturación | Conciliación diaria | Inicio → acceso rápido «Conciliación diaria» | 1 |
| Analista de facturación | Recuperar evidencia | Inicio → acceso rápido «Recuperar evidencia» | 1 |
| Analista de facturación | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Analista de facturación | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Área de documentación | Inspecciones de autoridad | Inicio → acceso rápido «Inspecciones de autoridad» | 1 |
| Área de documentación | Nueva cita de inspección | Inicio → acceso rápido «Nueva cita de inspección» | 1 |
| Área de documentación | Cumplimiento de la hora acordada | Inicio → acceso rápido «Cumplimiento de la hora acordada» | 1 |
| Área de documentación | Documentos | Inicio → acceso rápido «Documentos» | 1 |
| Área de documentación | Firmas pendientes | Inicio → acceso rápido «Firmas pendientes» | 1 |
| Área de documentación | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Área de documentación | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Protección portuaria y prevención de riesgos | Conteo de emergencia | Inicio → acceso rápido «Conteo de emergencia» | 1 |
| Protección portuaria y prevención de riesgos | Accesos por zona | Inicio → acceso rápido «Accesos por zona» | 1 |
| Protección portuaria y prevención de riesgos | Auditoría de accesos | Inicio → acceso rápido «Auditoría de accesos» | 1 |
| Protección portuaria y prevención de riesgos | App de terreno | Inicio → acceso rápido «App de terreno» | 1 |
| Protección portuaria y prevención de riesgos | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Protección portuaria y prevención de riesgos | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Trabajador portuario | Mi credencial del turno | Inicio → acceso rápido «Mi credencial del turno» | 1 |
| Trabajador portuario | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Trabajador portuario | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Inspector de autoridad | Citas de inspección | Inicio → acceso rápido «Citas de inspección» | 1 |
| Inspector de autoridad | Firmar actas | Inicio → acceso rápido «Firmar actas» | 1 |
| Inspector de autoridad | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Inspector de autoridad | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Verificador externo de emisiones | Reporte de emisiones | Inicio → acceso rápido «Reporte de emisiones» | 1 |
| Verificador externo de emisiones | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Verificador externo de emisiones | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Personal de ronda reefer y mantenimiento | App de terreno: ronda reefer | Inicio → acceso rápido «App de terreno: ronda reefer» | 1 |
| Personal de ronda reefer y mantenimiento | Alarmas reefer | Inicio → acceso rápido «Alarmas reefer» | 1 |
| Personal de ronda reefer y mantenimiento | Mapa de tomas | Inicio → acceso rápido «Mapa de tomas» | 1 |
| Personal de ronda reefer y mantenimiento | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Personal de ronda reefer y mantenimiento | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Naviera no integrada | Canal puente: cargar un archivo | Inicio → acceso rápido «Canal puente: cargar un archivo» | 1 |
| Naviera no integrada | Bandeja de tareas | Inicio → ícono de bandeja en la barra superior | 1 |
| Naviera no integrada | Búsqueda global | Cualquier pantalla → campo de búsqueda (tecla /) → resultado | 2 |
| Perfiles con acceso | Puesto de atención | Menú principal «Gate, patio y equipos» → «Puesto de atención» | 2 |
| Perfiles con acceso | Citas del día | Menú principal «Gate, patio y equipos» → «Citas del día» | 2 |
| Perfiles con acceso | Carril de excepción | Menú principal «Gate, patio y equipos» → «Carril de excepción» | 2 |
| Perfiles con acceso | Estadía por camión | Menú principal «Gate, patio y equipos» → «Estadía por camión» | 2 |
| Perfiles con acceso | Congestión y capacidad | Menú principal «Gate, patio y equipos» → «Congestión y capacidad» | 2 |
| Perfiles con acceso | Retiro de importación | Menú principal «Gate, patio y equipos» → «Retiro de importación» | 2 |
| Perfiles con acceso | Mapa del patio | Menú principal «Gate, patio y equipos» → «Mapa del patio» | 2 |
| Perfiles con acceso | Condiciones dinámicas | Menú principal «Gate, patio y equipos» → «Condiciones dinámicas» | 2 |
| Perfiles con acceso | Verificaciones físicas | Menú principal «Gate, patio y equipos» → «Verificaciones físicas» | 2 |
| Perfiles con acceso | Remociones programadas | Menú principal «Gate, patio y equipos» → «Remociones programadas» | 2 |
| Perfiles con acceso | Barrido de bloques | Menú principal «Gate, patio y equipos» → «Barrido de bloques» | 2 |
| Perfiles con acceso | Núcleo operacional | Menú principal «Gate, patio y equipos» → «Núcleo operacional» | 2 |
| Perfiles con acceso | Despacho de tractocamiones | Menú principal «Gate, patio y equipos» → «Despacho de tractocamiones» | 2 |
| Perfiles con acceso | Citas a tres bandas | Menú principal «Gate, patio y equipos» → «Citas a tres bandas» | 2 |
| Perfiles con acceso | Gemelo de operación | Menú principal «Gate, patio y equipos» → «Gemelo de operación» | 2 |
| Perfiles con acceso | Terminal de cabina RTG-07 | Menú principal «Gate, patio y equipos» → «Terminal de cabina RTG-07» | 2 |
| Perfiles con acceso | Cabina de la grúa de muelle G2 | Menú principal «Gate, patio y equipos» → «Cabina de la grúa de muelle G2» | 2 |
| Perfiles con acceso | Mapa de tomas | Menú principal «Patio refrigerado» → «Mapa de tomas» | 2 |
| Perfiles con acceso | Alarmas | Menú principal «Patio refrigerado» → «Alarmas» | 2 |
| Perfiles con acceso | Evidencia de cadena de frío | Menú principal «Patio refrigerado» → «Evidencia de cadena de frío» | 2 |
| Perfiles con acceso | Certificados de integridad | Menú principal «Patio refrigerado» → «Certificados de integridad» | 2 |
| Perfiles con acceso | Indicadores de alarma | Menú principal «Patio refrigerado» → «Indicadores de alarma» | 2 |
| Perfiles con acceso | Recaladas | Menú principal «Nave y planificación» → «Recaladas» | 2 |
| Perfiles con acceso | Programación de sitios y grúas | Menú principal «Nave y planificación» → «Programación de sitios y grúas» | 2 |
| Perfiles con acceso | Plan de estiba REC-1184 | Menú principal «Nave y planificación» → «Plan de estiba REC-1184» | 2 |
| Perfiles con acceso | Reglas del planificador | Menú principal «Nave y planificación» → «Reglas del planificador» | 2 |
| Perfiles con acceso | Productividad en tiempo real | Menú principal «Nave y planificación» → «Productividad en tiempo real» | 2 |
| Perfiles con acceso | Hechos facturables | Menú principal «Evidencia comercial y regulatoria» → «Hechos facturables» | 2 |
| Perfiles con acceso | Objeciones | Menú principal «Evidencia comercial y regulatoria» → «Objeciones» | 2 |
| Perfiles con acceso | Conciliación diaria | Menú principal «Evidencia comercial y regulatoria» → «Conciliación diaria» | 2 |
| Perfiles con acceso | Recuperar evidencia | Menú principal «Evidencia comercial y regulatoria» → «Recuperar evidencia» | 2 |
| Perfiles con acceso | Inspecciones de autoridad | Menú principal «Evidencia comercial y regulatoria» → «Inspecciones de autoridad» | 2 |
| Perfiles con acceso | Cumplimiento de la hora acordada | Menú principal «Evidencia comercial y regulatoria» → «Cumplimiento de la hora acordada» | 2 |
| Perfiles con acceso | Energía y emisiones | Menú principal «Evidencia comercial y regulatoria» → «Energía y emisiones» | 2 |
| Perfiles con acceso | Reporte para el verificador | Menú principal «Evidencia comercial y regulatoria» → «Reporte para el verificador» | 2 |
| Perfiles con acceso | Portal de clientes | Menú principal «Portal e integraciones» → «Portal de clientes» | 2 |
| Perfiles con acceso | Mi carga | Menú principal «Portal e integraciones» → «Mi carga» | 2 |
| Perfiles con acceso | Mis citas | Menú principal «Portal e integraciones» → «Mis citas» | 2 |
| Perfiles con acceso | Validación documental | Menú principal «Portal e integraciones» → «Validación documental» | 2 |
| Perfiles con acceso | Instrucción de embarque | Menú principal «Portal e integraciones» → «Instrucción de embarque» | 2 |
| Perfiles con acceso | Evidencia y objeciones | Menú principal «Portal e integraciones» → «Evidencia y objeciones» | 2 |
| Perfiles con acceso | Serie térmica | Menú principal «Portal e integraciones» → «Serie térmica» | 2 |
| Perfiles con acceso | Citas de inspección | Menú principal «Portal e integraciones» → «Citas de inspección» | 2 |
| Perfiles con acceso | Hub de Integración | Menú principal «Portal e integraciones» → «Hub de Integración» | 2 |
| Perfiles con acceso | Canal puente | Menú principal «Portal e integraciones» → «Canal puente» | 2 |
| Perfiles con acceso | Autoridades y operador ferroviario | Menú principal «Portal e integraciones» → «Autoridades y operador ferroviario» | 2 |
| Perfiles con acceso | Contrapartes externas | Menú principal «Gestión» → «Contrapartes externas» | 2 |
| Perfiles con acceso | Tablero analítico | Menú principal «Gestión» → «Tablero analítico» | 2 |
| Perfiles con acceso | Indicadores del concedente | Menú principal «Gestión» → «Indicadores del concedente» | 2 |
| Perfiles con acceso | Personas usuarias | Menú principal «Gestión» → «Personas usuarias» | 2 |
| Perfiles con acceso | Roles y permisos | Menú principal «Gestión» → «Roles y permisos» | 2 |
| Perfiles con acceso | Parámetros | Menú principal «Gestión» → «Parámetros» | 2 |
| Perfiles con acceso | Flujos de trabajo | Menú principal «Gestión» → «Flujos de trabajo» | 2 |
| Perfiles con acceso | Plantillas de notificación | Menú principal «Gestión» → «Plantillas de notificación» | 2 |
| Perfiles con acceso | Plantillas de documentos | Menú principal «Gestión» → «Plantillas de documentos» | 2 |
| Perfiles con acceso | Retención de registros | Menú principal «Gestión» → «Retención de registros» | 2 |
| Perfiles con acceso | Auditoría | Menú principal «Gestión» → «Auditoría» | 2 |
| Perfiles con acceso | App Móvil de Terreno | Menú principal «Servicios transversales» → «App Móvil de Terreno» | 2 |
| Perfiles con acceso | Identidad y acceso | Menú principal «Servicios transversales» → «Identidad y acceso» | 2 |
| Perfiles con acceso | Conteo de emergencia | Menú principal «Servicios transversales» → «Conteo de emergencia» | 2 |
| Perfiles con acceso | Mi credencial | Menú principal «Servicios transversales» → «Mi credencial» | 2 |
| Perfiles con acceso | Documentos | Menú principal «Servicios transversales» → «Documentos» | 2 |
| Perfiles con acceso | Firmas pendientes | Menú principal «Servicios transversales» → «Firmas pendientes» | 2 |
| Perfiles con acceso | Convivencia con el TOS 2012 | Menú principal «Servicios transversales» → «Convivencia con el TOS 2012» | 2 |
| Perfiles con acceso | Continuidad: operación sin enlace | Menú principal «Servicios transversales» → «Continuidad: operación sin enlace» | 2 |

## 7. Componentes por pantalla

| Componente | Dónde aparece | Ruta |
|---|---|---|
| Menú principal | Todas las pantallas con sesión | `#/inicio` |
| Menú secundario contextual | Cada módulo (barra bajo el rastro) | `#/gate/puesto` |
| Rastro de navegación | Todas las pantallas | `#/inspecciones/INS-3307` |
| Paginación | Inspecciones, citas, hechos facturables | `#/inspecciones` |
| Pestañas | Ficha del contenedor, ficha de contraparte | `#/terceros/AAS` |
| Acordeones | Reglas del planificador, portal público | `#/nave/reglas` |
| Navegación por pasos | Ingreso de exportación, registro, nueva cita | `#/gate/visita/VIS-240871` |
| Menú de acciones rápidas | Visita del gate, citas, personas usuarias | `#/gate/visita/VIS-240871` |
| Validación en tiempo real | Consulta pública (ISO 6346), registro (RUT), nueva cita (patente) | `#/` |
| Selectores y desplegables | Filtros del tablero analítico | `#/analitica` |
| Casillas y botones de opción | Inicio de sesión, roles y permisos | `#/admin/roles` |
| Selectores de fecha y hora | Nueva cita de inspección, recuperar evidencia | `#/inspecciones/nueva` |
| Carga de archivos (arrastrar y soltar) | Prevalidación, registro, canal puente | `#/hub/puente` |
| Autocompletado | Búsqueda global, nueva cita, emisiones por contenedor | `#/gate/citas/nueva` |
| Formularios de varios pasos | Registro externo, nueva cita, alta de contraparte | `#/registro` |
| Tablas con orden y filtro | Todas las listas | `#/evidencia/hechos` |
| Gráfico de barras | Tablero analítico, congestión | `#/analitica` |
| Gráfico de líneas | Tablero analítico, serie térmica | `#/analitica` |
| Gráfico circular (anillo) | Tablero analítico, sobretiempo | `#/nave/productividad` |
| Área apilada | Tablero analítico, emisiones | `#/emisiones` |
| Mapa de calor | Ocupación del patio | `#/patio` |
| Dispersión | Productividad frente a espera | `#/nave/productividad` |
| Indicador de aguja | Lectura óptica, estadía | `#/analitica` |
| Tarjetas de información | Inicio de cada perfil | `#/inicio` |
| Líneas de tiempo | Visita, inspección, programación de sitios | `#/nave/programacion` |
| Indicadores de progreso | Registro, recorrido guiado, barrido | `#/registro` |
| Distintivos y etiquetas | Estados en todas las tablas | `#/gate/citas` |
| Información contextual emergente | Hechos facturables, franjas | `#/evidencia/hechos` |
| Mensajes de éxito, error, advertencia e información | Ingreso por el gate, registro y consulta pública | `#/gate/visita/VIS-240871` |
| Ventanas modales y diálogos | Resolver objeción, confirmar alarma | `#/evidencia/objeciones` |
| Notificaciones emergentes | Cada acción que cambia datos | `#/gate/visita/VIS-240871` |
| Esqueletos de carga | Al entrar a listas y tableros | `#/analitica` |
| Estados vacíos ilustrados | Bandeja vacía, filtros sin resultados | `#/exportaciones` |
| Botones primarios, secundarios y terciarios | Todas las pantallas | `#/gate/visita/VIS-240871` |
| Botón de acción flotante | Citas, inspecciones, contrapartes | `#/gate/citas` |
| Acciones en línea | Filas de tablas (Atender, Confirmar) | `#/gate/puesto` |
| Menús contextuales | Clic derecho en filas de citas, hechos, inspecciones | `#/gate/citas` |
| Acciones masivas | Citas, inspecciones, bandeja de tareas, personas | `#/inspecciones` |
| Confirmación de acciones críticas | Abrir barrera, suspender, transferir autoridad | `#/gate/visita/VIS-240871` |
