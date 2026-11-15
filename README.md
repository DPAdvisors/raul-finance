# Raúl Finance — aplicación financiera personal

Aplicación PWA para iPhone, con almacenamiento local-first y sincronización opcional con Supabase.

## Incluye
- Dashboard de disponibilidad, ingresos, gastos, ahorro y obligaciones.
- Registro de ingresos y gastos con categoría, fecha y medio de pago.
- Control de deudas y cuotas.
- Presupuestos mensuales por categoría.
- Registro de ahorro y meta mensual.
- Estadísticas e historial filtrable.
- Exportación CSV y respaldo/restauración JSON.
- Atajos de iOS mediante enlaces `?quick=expense`, `?quick=income` y `?quick=balance`.
- Tema automático según el modo claro/oscuro del dispositivo.

## Publicar para instalar en iPhone
La instalación PWA requiere HTTPS:
1. Sube el contenido de esta carpeta a un hosting estático HTTPS (por ejemplo, Cloudflare Pages, Netlify o GitHub Pages).
2. Abre la URL publicada en Safari en el iPhone.
3. Pulsa Compartir → Añadir a pantalla de inicio.
4. Abre Raúl Finance desde el nuevo icono.

## Almacenamiento y respaldo
Los movimientos se guardan en `localStorage` del navegador/dispositivo. Exporta periódicamente un respaldo JSON desde Ajustes. Para sincronización entre dispositivos, configura Supabase siguiendo los pasos de abajo.

## Activar sincronización Supabase
1. Crea un proyecto en Supabase.
2. En SQL Editor ejecuta el contenido de `supabase.sql`.
3. En Project Settings → API copia Project URL y la anon/public key.
4. En Raúl Finance → Ajustes, pega URL y anon key.
5. Pulsa Conectar / iniciar sesión e ingresa tu correo.
6. Abre el enlace recibido en el mismo navegador/dispositivo y vuelve a la app.
7. Pulsa Sincronizar ahora.

**Importante:** esta primera versión guarda una copia completa del estado en Supabase al pulsar sincronizar. La sincronización es manual, no automática; evita editar simultáneamente en varios dispositivos. La clave `anon` es pública por diseño, pero nunca pegues una `service_role` key en la app.

## Atajos de iOS
Después de publicar la PWA, crea estos tres atajos desde la app Atajos:
- **Registrar gasto:** acción “URL” con `https://TU-DOMINIO/?quick=expense`, luego “Abrir URL”.
- **Registrar ingreso:** `https://TU-DOMINIO/?quick=income`.
- **Consultar saldo:** `https://TU-DOMINIO/?quick=balance`.

Puedes añadir cada atajo a la pantalla de inicio o configurarlo con Siri. Reemplaza TU-DOMINIO por la URL real de tu publicación.

## Presupuesto inicial cargado
Ingreso objetivo: $5.600.000 COP.
Obligaciones mensuales iniciales: arriendo $900.000; mercado $600.000; hijo $600.000; deuda Paula $300.000; Banco de Bogotá $400.000.
Otros presupuestos iniciales editables: servicios $350.000; transporte $200.000; ropa $250.000; restaurantes $350.000; entretenimiento $250.000; ahorro $800.000; libre/imprevistos $600.000.

Los valores de servicios y transporte son estimaciones iniciales, no datos confirmados.
