# Mis Finanzas

App web instalable (PWA) de finanzas personales: ingresos, gastos, cuentas, deudas con intereses y cuota fija o variable, recurrentes automáticos, presupuestos, metas y proyecciones a 12 meses.

- `index.html` — toda la app (sin dependencias).
- `sw.js`, `manifest.webmanifest`, `icon-*.png` — instalación y uso sin internet.
- `backend/Code.gs` — backend opcional en Google Sheets (Apps Script) con usuario y contraseña.

Este repositorio no contiene datos ni claves: cada persona conecta su propia hoja de cálculo.

## Conectar tu Google Sheets

1. Crea una hoja de cálculo nueva en Google Sheets.
2. Extensiones → Apps Script. Borra lo que haya y pega el contenido de `backend/Code.gs`. Guarda.
3. Implementar → Nueva implementación → tipo **Aplicación web** → Ejecutar como **Yo** → Acceso **Cualquier usuario** → Implementar, y autoriza con tu cuenta.
4. Copia la dirección que termina en `/exec`.
5. Abre la app, pega esa dirección, elige usuario y contraseña (mínimo 8 caracteres) y toca **Crear mi usuario**.

Si cambias `Code.gs` más adelante: Implementar → Administrar implementaciones → editar → Versión nueva (así la dirección no cambia).

## Instalar en iPhone

Abre la app en Safari → Compartir → **Añadir a pantalla de inicio**.
