# ATOS · Prototipo interactivo

Prototipo de alta fidelidad de ATOS, la solución de Terabyte para el Terminal Portuario Aconcagua S.A. Es un sitio
estático: no tiene servicios de fondo, base de datos ni autenticación real. Los datos son simulados, viven en la
memoria del navegador y vuelven a su estado inicial al recargar o con «Reiniciar demostración».

**Abrir el prototipo:** https://vaguzzel.github.io/atos-prototipo/

## Cómo recorrerlo

- En «Ingresar» eliges uno de los 19 perfiles de demostración. Sirve cualquier correo válido con una contraseña de
  8 caracteres o más, y el segundo factor acepta cualquier código de 6 dígitos.
- El botón «Demostración», abajo a la izquierda, cambia de perfil e idioma, simula la caída del enlace exterior y la
  pérdida de cobertura en terreno, dispara una alarma del patio refrigerado, salta al inicio de cada flujo del guion,
  enciende o apaga el agua en movimiento de la portada y del acceso, y reinicia la demostración.
- El botón de pausa del encabezado detiene todas las animaciones.

## Documentos

- [Guion de demostración](docs/guion_demostracion.md)
- [Sistema de diseño](docs/sistema_diseno.md)
- [Arquitectura de información](docs/arquitectura_informacion.md)

Funciona también sin conexión: basta con abrir `index.html` desde el disco. Las fuentes Cormorant Garamond y
Source Sans 3 van en la carpeta `fuentes/`, con su licencia OFL.
