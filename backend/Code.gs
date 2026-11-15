/**
 * Mis Finanzas — backend en Google Sheets (Apps Script).
 *
 * Instalación: abre tu hoja de cálculo → Extensiones → Apps Script → pega este archivo →
 * Implementar → Nueva implementación → Aplicación web → Ejecutar como: Yo · Acceso: Cualquier usuario.
 * La dirección que termina en /exec es la "Dirección de conexión" que pide la app.
 *
 * Seguridad: la dirección es pública, pero toda operación exige usuario y contraseña (guardada
 * como hash con sal en las propiedades del script, nunca en la hoja) o un token de sesión.
 * Tras 5 intentos fallidos el acceso se bloquea 15 minutos.
 *
 * Datos: la pestaña oculta "_datos" guarda el estado completo de la app. Las pestañas
 * Movimientos, Cuentas y Deudas son una copia de solo lectura que se reescribe en cada
 * sincronización: editar esas pestañas NO cambia la app.
 */
var DATA_SHEET = '_datos';
var CHUNK = 40000;       // una celda admite 50.000 caracteres
var MAX_FAILS = 5;
var LOCK_MINUTES = 15;

function doGet() {
  return ContentService.createTextOutput('Mis Finanzas: conexión activa. Usa esta dirección en la app.');
}

function doPost(e) {
  var out;
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var q = JSON.parse(e.postData.contents);
    var P = PropertiesService.getScriptProperties();
    if (q.action === 'register') out = register_(q, P);
    else if (q.action === 'login') out = login_(q, P);
    else if (!validToken_(q.token, P)) out = { ok: false, error: 'auth' };
    else if (q.action === 'pull') out = pull_(q);
    else if (q.action === 'push') out = push_(q);
    else if (q.action === 'logout') out = logout_(q, P);
    else out = { ok: false, error: 'accion' };
  } catch (err) {
    out = { ok: false, error: 'server', detail: String(err) };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Autenticación ---------- */
function sha_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}
function hashPass_(pass, salt) {
  var h = salt + pass;
  for (var i = 0; i < 300; i++) h = sha_(salt + h);
  return h;
}
function newToken_(P) {
  var token = Utilities.getUuid() + Utilities.getUuid();
  var list = JSON.parse(P.getProperty('tokens') || '[]');
  list.push(sha_(token));
  P.setProperty('tokens', JSON.stringify(list.slice(-10))); // hasta 10 dispositivos
  return token;
}
function validToken_(token, P) {
  if (!token) return false;
  return JSON.parse(P.getProperty('tokens') || '[]').indexOf(sha_(String(token))) >= 0;
}
function register_(q, P) {
  if (P.getProperty('user')) return { ok: false, error: 'exists' };
  var user = String(q.user || '').trim().toLowerCase(), pass = String(q.pass || '');
  if (user.length < 3 || pass.length < 8) return { ok: false, error: 'weak' };
  var salt = Utilities.getUuid();
  P.setProperties({ user: user, salt: salt, hash: hashPass_(pass, salt) });
  var data = read_();
  return { ok: true, token: newToken_(P), rev: data.rev, state: data.state };
}
function login_(q, P) {
  var until = Number(P.getProperty('lockUntil') || 0);
  if (Date.now() < until) return { ok: false, error: 'locked', minutes: Math.ceil((until - Date.now()) / 60000) };
  var user = P.getProperty('user');
  if (!user) return { ok: false, error: 'nouser' };
  var okUser = String(q.user || '').trim().toLowerCase() === user;
  var okPass = hashPass_(String(q.pass || ''), P.getProperty('salt')) === P.getProperty('hash');
  if (!okUser || !okPass) {
    var fails = Number(P.getProperty('fails') || 0) + 1;
    if (fails >= MAX_FAILS) { P.setProperty('lockUntil', String(Date.now() + LOCK_MINUTES * 60000)); fails = 0; }
    P.setProperty('fails', String(fails));
    return { ok: false, error: 'bad' };
  }
  P.setProperty('fails', '0');
  var data = read_();
  return { ok: true, token: newToken_(P), rev: data.rev, state: data.state };
}
function logout_(q, P) {
  var h = sha_(String(q.token));
  var list = JSON.parse(P.getProperty('tokens') || '[]').filter(function (t) { return t !== h; });
  P.setProperty('tokens', JSON.stringify(list));
  return { ok: true };
}

/* ---------- Datos ---------- */
function dataSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(DATA_SHEET);
  if (!sh) { sh = ss.insertSheet(DATA_SHEET); sh.getRange('A1').setValue(0); sh.hideSheet(); }
  return sh;
}
function read_() {
  var sh = dataSheet_();
  var rev = Number(sh.getRange('A1').getValue()) || 0;
  var last = sh.getLastRow();
  if (last < 2) return { rev: rev, state: null };
  var state = sh.getRange(2, 1, last - 1, 1).getValues()
    .map(function (r) { return String(r[0]).slice(2); }).join(''); // quita el prefijo "J:"
  return { rev: rev, state: state || null };
}
function pull_(q) {
  var d = read_();
  if (q.have === d.rev) return { ok: true, rev: d.rev };
  return { ok: true, rev: d.rev, state: d.state };
}
function push_(q) {
  var d = read_();
  // Otro dispositivo guardó antes: se devuelve lo que hay para que la app decida.
  if (!q.force && q.base !== d.rev) return { ok: false, error: 'conflict', rev: d.rev, state: d.state };
  var state = String(q.state || '');
  JSON.parse(state); // si no es JSON válido, no se guarda
  var rows = [];
  for (var i = 0; i < state.length; i += CHUNK) rows.push(['J:' + state.substr(i, CHUNK)]); // el prefijo evita que Sheets lo lea como número o fórmula
  var sh = dataSheet_();
  var rev = d.rev + 1;
  sh.clearContents();
  sh.getRange('A1').setValue(rev);
  sh.getRange('B1').setValue(new Date());
  if (rows.length) sh.getRange(2, 1, rows.length, 1).setNumberFormat('@').setValues(rows);
  if (q.tables) writeTables_(q.tables);
  return { ok: true, rev: rev };
}
function writeTables_(tables) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ['Movimientos', 'Cuentas', 'Deudas'].forEach(function (name) {
    var rows = tables[name];
    if (!rows || !rows.length) return;
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    var width = rows[0].length;
    var clean = rows.map(function (r) {
      var out = [];
      for (var i = 0; i < width; i++) {
        var v = r[i] == null ? '' : r[i];
        // Texto que empieza por = + - @ se guarda como texto para que no se ejecute como fórmula.
        out.push(typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v);
      }
      return out;
    });
    sh.clearContents();
    sh.getRange(1, 1, clean.length, width).setValues(clean);
    sh.getRange(1, 1, 1, width).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
}
