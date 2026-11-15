# Raúl Finance v2

Aplicación web progresiva (PWA) para control financiero personal en COP.

## Configuración inicial incluida
- Salario base bruto: $2.500.000 COP.
- KPI máximo: $1.000.000 COP; inicia en $0 recibido.
- Deducciones estimadas de salud y pensión: 4% + 4%, editables.
- Presupuesto inicial de referencia: $2.300.000 COP netos estimados.
- Obligaciones mensuales conocidas: hijo $600.000; deuda Paula $300.000; cuota iPhone $200.000; arriendo $950.000; pasajes $180.000.
- Mercado inicial estimado: $400.000; servicios iniciales estimados: $180.000.
- Los saldos originales de Paula y iPhone se dejan en $0 porque solo se informó la cuota mensual, no el total pendiente. Se pueden completar en Deudas > Editar.

## Funciones v2
- Registro de ingresos y gastos con fecha, categoría, medio de pago y descripción.
- Ingresos diferenciados entre ingreso ganado, préstamo y reembolso.
- Los préstamos recibidos crean simultáneamente una deuda y una entrada de efectivo; no se cuentan como ingreso ganado.
- Deudas con valor original, capital pagado, saldo pendiente, cuota, interés, vencimiento, notas e historial de abonos.
- Los abonos se separan entre capital e intereses y se registran como gasto.
- Tarjetas de crédito con cupo, saldo utilizado, compras y pagos.
- Nómina con salario bruto, KPI, otros ingresos, salud, pensión y descuentos adicionales mensuales/quincenales.
- Presupuesto mensual editable y categorías de presupuesto personalizables.
- Ahorro, estadísticas, historial y exportación CSV/JSON.
- Bloqueo biométrico local mediante WebAuthn cuando el navegador/dispositivo lo soporte.
- Migración de la base local v1 a v2 sin borrar los movimientos existentes.

## Publicación en GitHub Pages
1. Descomprime el ZIP.
2. Reemplaza en la raíz del repositorio los archivos `index.html`, `sw.js`, `supabase.sql`, `README.md`, `manifest.webmanifest` e iconos.
3. Haz commit y push.
4. Espera a que GitHub Pages publique los cambios.
5. En iPhone, cierra la PWA y vuelve a abrirla. Si ves la versión anterior, elimina el icono de inicio, abre la URL en Safari, recarga y vuelve a añadirla a pantalla de inicio.

El `sw.js` cambia a caché v2 para forzar la actualización de recursos estáticos.

## Datos y seguridad
- Los datos locales se guardan en `localStorage` del navegador. Exporta respaldos JSON periódicamente.
- La sincronización Supabase sigue siendo manual: ejecuta `supabase.sql`, configura Project URL y anon/public key, inicia sesión por enlace de correo y pulsa “Sincronizar ahora”.
- RLS limita cada copia en la nube al usuario autenticado. Nunca uses la `service_role` key en el navegador.
- GitHub Pages sirve el código públicamente. No pongas contraseñas, claves privadas ni datos financieros reales en el repositorio.
- La biometría es una barrera local adicional del dispositivo; no reemplaza la autenticación de Supabase ni RLS. Si el dispositivo/navegador no admite WebAuthn, usa la app sin bloqueo biométrico. Haz un respaldo antes de activar funciones de seguridad.
- No hay sincronización automática ni recuperación de datos locales sin respaldo o copia en la nube.

## Consideraciones de cálculo
- La estimación de nómina calcula salud y pensión con los porcentajes editables configurados. El tratamiento salarial del KPI y otros descuentos debe validarse contra tu desprendible real de nómina.
- Los valores de mercado y servicios son estimaciones modificables.
- Registrar un pago de tarjeta se clasifica como transferencia para no duplicar el gasto de las compras que ya fueron registradas.
