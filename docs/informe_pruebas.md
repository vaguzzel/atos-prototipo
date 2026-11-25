# Informe de las pruebas del prototipo de ATOS

Generado por `prototipo/pruebas/prueba_edge.mjs` en Microsoft Edge sin interfaz (8.6 minutos). Abre `index.html` desde el disco (`file://`), igual que el paquete sin conexión.

**Resultado: 78 de 78 comprobaciones correctas.**

| Criterio de aceptación | Resultado |
|---|---|
| 1. Cero enlaces rotos y cero botones sin acción | Cumple: 258 enlaces distintos, 540 pantallas recorridas con 19 perfiles |
| 2. Auditoría axe-core sin incumplimientos AA | Cumple: 97 pantallas y 4 estados con capas abiertas (WCAG 2.0, 2.1 y 2.2, niveles A y AA) |
| 3. Capturas en cinco tamaños sin desplazamiento horizontal | Cumple: 11 pantallas clave por tamaño y todas las rutas en 768 y 375 px |
| 4. Cero errores en la consola | Cumple |
| 5. Paquete navegable sin red | Cumple: 80 solicitudes, todas locales |
| 6. Cada bloque y componente demostrable con su ruta | Ver `docs/arquitectura_informacion.md`, secciones 1 y 7 |
| 7. Sin textos prohibidos ni montos | Lo revisa `prototipo/verificar.py` con el motor de `make chequear` |

## Comprobaciones

| Resultado | Comprobación | Detalle |
|---|---|---|
| OK | Cero enlaces rotos (258 enlaces distintos en 540 pantallas recorridas con 19 perfiles) |  |
| OK | Cero botones sin acción |  |
| OK | Ninguna pantalla falla ni muestra valores vacíos | [] |
| OK | Todas las rutas se recorren con al menos un perfil (97) |  |
| OK | El recorrido guiado aparece en el primer ingreso |  |
| OK | Auditoría axe-core WCAG 2.2 AA sin incumplimientos (97 pantallas y 4 estados con capas abiertas) |  |
| OK | Objetivos táctiles de 44 × 44 px o más en controles |  |
| OK | Sin desplazamiento horizontal en 1920×1080, 1366×768, 768×1024, 1024×768 y 375×812 (todas las rutas en 768 y 375) |  |
| OK | Portal público: dígito verificador ISO 6346 erróneo se marca al escribir |  |
| OK | Portal público: número válido se confirma en tiempo real |  |
| OK | Consulta pública: estado mínimo sin posición exacta |  |
| OK | El idioma inglés persiste al recargar (RF-POR-07) |  |
| OK | Ingreso: correo inválido se marca al escribir |  |
| OK | Perfil externo pide el segundo factor |  |
| OK | Segundo factor: código incompleto se rechaza con su causa |  |
| OK | Segundo factor correcto: inicio del perfil con recorrido guiado |  |
| OK | El recorrido se puede saltar |  |
| OK | El recorrido se retoma desde Ayuda |  |
| OK | Registro: no avanza sin elegir el tipo |  |
| OK | Registro: RUT con dígito verificador erróneo se marca |  |
| OK | Registro: guardar y volver después |  |
| OK | Registro: se retoma donde quedó |  |
| OK | Registro de organización externa completo en seis pasos, con resumen y estado «En validación» |  |
| OK | Paso 1: cita confirmada |  |
| OK | La cita creada aparece en las citas del gate |  |
| OK | Paso 2: documentación validada |  |
| OK | Paso 3: en gate con lectura óptica y dígito verificador |  |
| OK | Paso 4: masa verificada |  |
| OK | Abrir barrera pide confirmación de acción crítica |  |
| OK | Paso 5: destino asignado |  |
| OK | Paso 6: posición registrada por telemetría |  |
| OK | Paso 7: salida registrada con estadía de 34 minutos frente a la meta de 45 |  |
| OK | El hecho facturable generado aparece en la evidencia |  |
| OK | Excepción: el camión pasa al carril de excepción |  |
| OK | Excepción: la agencia sube el documento y el camión vuelve a la fila con su franja |  |
| OK | Masa bruta sobre 5 %: avance detenido |  |
| OK | El plan de estiba queda marcado para replanificar |  |
| OK | Replanificación por discrepancia de masa |  |
| OK | Inspección: el inspector confirma |  |
| OK | Inspección: remoción, atención y acta firmada |  |
| OK | Inspección: el rechazo vuelve con su motivo |  |
| OK | App de terreno: indicador de estado sin conexión |  |
| OK | Sin elegir la acción, la alarma no se confirma |  |
| OK | Sin conexión: la confirmación queda en la cola del equipo |  |
| OK | Al volver la red: sincronización y conflicto resuelto con regla determinista en la bitácora |  |
| OK | La alarma confirmada desaparece de la bandeja |  |
| OK | Alarma reefer con aviso simultáneo a dos destinatarios |  |
| OK | Escalamiento si nadie confirma |  |
| OK | La confirmación de la alarma queda en la auditoría |  |
| OK | Caída del enlace: aviso en todas las vistas |  |
| OK | Sin enlace, el gate sigue y acumula registros |  |
| OK | Al volver el enlace se entrega lo acumulado |  |
| OK | Filtros del tablero analítico cambian los valores |  |
| OK | Profundización: del indicador al gráfico, a la tabla y al evento de origen |  |
| OK | Exportación asíncrona con aviso al terminar |  |
| OK | Parámetro: simulación del efecto antes de aplicar |  |
| OK | Parámetro aplicado sin desarrollo |  |
| OK | Doble aprobación: quien solicita no aprueba |  |
| OK | La jefatura aprueba la transferencia de autoridad |  |
| OK | Tablero: reordenar con alternativa por teclado |  |
| OK | Tablero: cambiar el tamaño |  |
| OK | Tablero: agregar y quitar componentes |  |
| OK | Tablero: restaurar la configuración |  |
| OK | Atajo «/»: búsqueda global |  |
| OK | Búsqueda tolerante a errores con autocompletado agrupado |  |
| OK | Búsqueda: Enter muestra los resultados agrupados |  |
| OK | Atajo «?»: ayuda de atajos |  |
| OK | Atajo «N»: registro nuevo |  |
| OK | Paginación |  |
| OK | Orden por columna |  |
| OK | Acciones masivas con confirmación |  |
| OK | Menú contextual en filas |  |
| OK | Cabina: la vía de excepción está bloqueada con el equipo en movimiento |  |
| OK | Cabina: se habilita con el equipo detenido (interlock) |  |
| OK | Cabina de la grúa: el plan se actualiza solo, con alerta |  |
| OK | Reiniciar demostración vuelve al estado inicial |  |
| OK | Cero solicitudes de red fuera del paquete (80 solicitudes, todas locales) |  |
| OK | Cero errores en la consola |  |

## Revisión manual por teclado

La prueba automática recorre con teclado los atajos (`/`, `?`, `N`, Escape), las flechas del autocompletado y el foco atrapado en los diálogos. Antes de cada entrega, una persona recorre además cada flujo del guion solo con Tab, Shift+Tab, Enter, Espacio y flechas, y confirma que el foco se ve en todo momento.
