// Sync plugin.xml's <plugin version="..."> to match package.json.
// The version attribute is required by the Cordova plugin spec
// (https://cordova.apache.org/docs/en/latest/plugin_ref/spec.html), so it must
// stay in step with package.json (the source of truth). Run automatically by
// `npm version` via the "version" lifecycle script. Targets only the <plugin>
// root attribute line (which ends in `">`), never the XML declaration on line 1
// (which ends in `?>`).
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');
const xmlPath = path.join(__dirname, '..', 'plugin.xml');
const xml = fs.readFileSync(xmlPath, 'utf8');
const next = xml.replace(/^(\s*)version="[^"]*">/m, `$1version="${version}">`);
if (next === xml) {
  console.error('ERROR: no <plugin version="..."> attribute found in plugin.xml');
  process.exit(1);
}
fs.writeFileSync(xmlPath, next);
console.log(`plugin.xml version -> ${version}`);
