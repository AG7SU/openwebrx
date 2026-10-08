// Run with jsdom installed outside the repository; see SECURITY_AUDIT.md.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');
const leafletSource = fs.readFileSync(path.join(root, 'htdocs/map-leaflet.js'), 'utf8');
const googleMapSource = fs.readFileSync(path.join(root, 'htdocs/map-google.js'), 'utf8');
const mapInputSource = fs.readFileSync(path.join(root, 'htdocs/lib/settings/MapInput.js'), 'utf8');
assert(googleMapSource.includes('https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(api_key)'));
assert(mapInputSource.includes("https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent($el.data('key'))"));
assert(leafletSource.includes("static/lib/leaflet.geodesic-2.7.2.min.js"));
assert(leafletSource.includes("static/lib/leaflet-maidenhead-c15c07b.js"));
assert(leafletSource.includes("static/lib/leaflet/leaflet.css"));
assert(leafletSource.includes("static/lib/leaflet/leaflet.js"));
assert(leafletSource.includes("static/lib/leaflet/leaflet.textpath-1.2.3.js"));
assert(leafletSource.includes("static/lib/leaflet/L.Terminator-1.1.0.js"));
for (const remote of ['unpkg.com/leaflet@', 'cdn.jsdelivr.net/npm/leaflet.', 'ha8tks.github.io/Leaflet.Maidenhead']) {
    assert(!leafletSource.includes(remote), `unexpected remote map dependency: ${remote}`);
}
for (const [file, expected] of [
    ['htdocs/lib/chroma.min.js', '1c9374b3415be8db0758965cdd50d2d23928ac67d2d584be8223506e2bdab1fb'],
    ['htdocs/lib/location-picker.min.js', '7f230f5026d1f8a8b77ab2ee3e40af763a9c18410a1bb8db740504082a76a8cb'],
    ['htdocs/lib/nite-overlay.js', '92f548378692fc7617e822093636783aa091eb377f74e23c9219789c36e4801c'],
    ['htdocs/lib/nanoscroller.css', 'bf0352a290c90912333f2e239cdb4d4035a873460218c6ff58e23d364de558fc'],
    ['htdocs/lib/leaflet.geodesic-2.7.2.min.js', '60944f24c4db35a8b8930ec47d995dc7031251391ad9cea678421c7fcfa6b282'],
    ['htdocs/lib/leaflet-maidenhead-c15c07b.js', '3cbc6ede686d49a93165ee9b045fff8ba2292a8a9f1dc579ba59e3b43408403a'],
    ['htdocs/lib/leaflet/leaflet.js', 'db49d009c841f5ca34a888c96511ae936fd9f5533e90d8b2c4d57596f4e5641a'],
    ['htdocs/lib/leaflet/leaflet.css', 'a7837102824184820dfa198d1ebcd109ff6d0ff9a2672a074b9a1b4d147d04c6'],
    ['htdocs/lib/leaflet/leaflet.textpath-1.2.3.js', '296db08583608ef852b8186cb5a5eb52b264a8a43954766fe7322e5dac38903b'],
    ['htdocs/lib/leaflet/L.Terminator-1.1.0.js', '85f6682ca1e8bfcc3fa00d7551cd06ae0ea54533aec93198ee078a3e76276a78'],
    ['htdocs/lib/leaflet/images/layers-2x.png', '066daca850d8ffbef007af00b06eac0015728dee279c51f3cb6c716df7c42edf'],
    ['htdocs/lib/leaflet/images/layers.png', '1dbbe9d028e292f36fcba8f8b3a28d5e8932754fc2215b9ac69e4cdecf5107c6'],
    ['htdocs/lib/leaflet/images/marker-icon-2x.png', '00179c4c1ee830d3a108412ae0d294f55776cfeb085c60129a39aa6fc4ae2528'],
    ['htdocs/lib/leaflet/images/marker-icon.png', '574c3a5cca85f4114085b6841596d62f00d7c892c7b03f28cbfa301deb1dc437'],
    ['htdocs/lib/leaflet/images/marker-shadow.png', '264f5c640339f042dd729062cfc04c17f8ea0f29882b538e3848ed8f10edb4da']
]) {
    const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
    assert.equal(actual, expected, `${file} checksum changed; update its pin and notice`);
}
assert(fs.existsSync(path.join(root, 'htdocs/lib/licenses/Leaflet-Geodesic-GPL-3.0.txt')));
assert(fs.existsSync(path.join(root, 'htdocs/lib/licenses/GPL-3.0.txt')));
assert(fs.existsSync(path.join(root, 'htdocs/lib/licenses/LGPL-3.0.txt')));
assert(fs.existsSync(path.join(root, 'htdocs/lib/licenses/Nite-Overlay-MIT.txt')));
assert(fs.existsSync(path.join(root, 'htdocs/lib/licenses/Leaflet-Maidenhead-MIT.txt')));
const featuresHtml = fs.readFileSync(path.join(root, 'htdocs/features.html'), 'utf8');
assert(featuresHtml.includes('static/lib/markdown-it-15.0.2.min.js'));
assert(!featuresHtml.includes('cdnjs.cloudflare.com/ajax/libs/markdown-it'));
for (const file of ['htdocs/map-google.html', 'htdocs/map-leaflet.html']) {
    const mapHtml = fs.readFileSync(path.join(root, file), 'utf8');
    assert(!mapHtml.includes('cdnjs.cloudflare.com/ajax/libs/moment.js'));
}
const markdownItHash = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'htdocs/lib/markdown-it-15.0.2.min.js'))).digest('hex');
assert.equal(markdownItHash, '635972b985228e8af9f0143647c68616b7a3bb09f6946e7e4a52e43dcf5e7be5');
assert(fs.existsSync(path.join(root, 'htdocs/lib/licenses/Markdown-it-MIT.txt')));
for (const license of ['Leaflet-BSD-2-Clause.txt', 'Leaflet-TextPath-MIT.txt', 'Leaflet-Terminator-MIT.txt']) {
    assert(fs.existsSync(path.join(root, 'htdocs/lib/leaflet/licenses', license)));
}
const dom = new JSDOM('<div id="meta"><div class="drm-programs"></div><div class="rds-rtplus-homepage"></div></div><div id="hdr-logo"></div><select id="hdr-program-id"></select><div id="section"><div id="section-title">▴&nbsp;Settings</div><div class="closed"></div></div>', {runScripts: 'outside-only'});
const w = dom.window;
for (const file of ['htdocs/lib/jquery-3.7.1.min.js', 'htdocs/lib/Utils.js', 'htdocs/lib/MetaPanel.js', 'htdocs/lib/UI.js', 'htdocs/lib/MapMarkers.js']) {
    w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
}
w.LS = {save: () => {}};
assert.match(w.Utils.relativeTime(40000, 100000), /minute/);
assert.match(w.Utils.relativeTime(160000, 100000), /in .*minute/);
assert.equal(w.Utils.relativeTime('not-a-time', 100000), '');
w.MapManager = function() {};
w.google = {maps: {
    InfoWindow: class {
        setContent(content) { this.content = content; }
        open() {}
    },
    event: {addListener: () => {}}
}};
w.eval(fs.readFileSync(path.join(root, 'htdocs/map-google.js'), 'utf8'));
w.eval(fs.readFileSync(path.join(root, 'htdocs/lib/markdown-it-15.0.2.min.js'), 'utf8'));
w.$.ajax = () => ({done: () => {}});
w.eval(fs.readFileSync(path.join(root, 'htdocs/features.js'), 'utf8'));
w.setTimeout = () => 1;
const payload = '<img src=x onerror="alert(1)">';
const el = w.$('#meta');
const drm = new w.DrmMetaPanel(el);
drm.update({mode: 'DRM', status: {}, media: {}, signal: {}, service_list: [{id: '1234', label: payload, text: payload, program_type: {name: payload}, bitrate_kbps: payload, protection_mode: payload, country: {name: payload}, language: {name: payload}}]});
assert.equal(el.find('.drm-programs img').length, 0);
assert(el.find('.drm-programs').text().includes(payload));
const hdr = new w.HdrMetaPanel(el);
hdr.update({mode: 'HDR', audio_services: [{id: 0, name: payload}], program: 0});
assert.equal(w.$('#hdr-program-id option').length, 1);
assert(w.$('#hdr-program-id').text().includes(payload));
hdr.update({mode: 'HDR', image: true, data: '" onerror="alert(1)'});
assert.equal(w.$('#hdr-logo img').attr('onerror'), undefined);
const dab = new w.DabMetaPanel(el);
dab.$select = w.$('#hdr-program-id');
dab.update({mode: 'DAB', programmes: {'1': payload}});
assert(dab.$select.text().includes(payload));
assert.equal(dab.$select.find('img').length, 0);
assert(!w.TetraMetaPanel.prototype.row('Name', payload).includes('<img'));
const sectionTitle = w.document.querySelector('#section-title');
const injectedSection = w.document.createElement('div');
injectedSection.className = 'closed';
sectionTitle.after(injectedSection);
w.UI.toggleSection(sectionTitle, true);
assert.equal(sectionTitle.textContent, '▾\u00a0Settings');
assert.equal(sectionTitle.querySelector('img'), null);
assert.equal(injectedSection.classList.contains('closed'), false);
const receiverInfoWindow = new w.google.maps.InfoWindow();
w.getInfoWindow = () => receiverInfoWindow;
w.map = {};
w.showReceiverInfoWindow({config: {receiver_name: payload}});
assert(receiverInfoWindow.content instanceof w.HTMLElement);
assert.equal(receiverInfoWindow.content.querySelector('img'), null);
assert.equal(receiverInfoWindow.content.querySelector('h3').textContent, payload);
const markerDiv = w.document.createElement('div');
const featureMarker = {div: markerDiv, symbol: payload};
w.FeatureMarker.prototype.draw.call(featureMarker);
assert.equal(markerDiv.querySelector('img'), null);
assert.equal(markerDiv.textContent, payload);
featureMarker.symbol = '&#9733;';
w.FeatureMarker.prototype.draw.call(featureMarker);
assert.equal(markerDiv.textContent, '★');
featureMarker.symbol = '&tridot;';
w.FeatureMarker.prototype.draw.call(featureMarker);
assert.notEqual(markerDiv.textContent, '&tridot;');
const markdownCell = w.document.createElement('td');
const converter = w.markdownit({html: false, linkify: false, typographer: false});
w.FeatureReport.appendMarkdown(
    markdownCell,
    '<img src=x onerror="alert(1)"><script>alert(2)</script>\n\n[unsafe](javascript:alert(1)) [safe](https://example.test/)',
    converter
);
assert.equal(markdownCell.querySelector('img'), null);
assert.equal(markdownCell.querySelector('script'), null);
assert.equal(markdownCell.querySelector('[onerror]'), null);
assert.equal(markdownCell.querySelector('a[href^="javascript:"]'), null);
assert.equal(markdownCell.querySelector('a[href="https://example.test/"]').rel, 'noopener noreferrer');
const featureBody = w.document.createElement('tbody');
w.FeatureReport.render({[payload]: {available: true, requirements: {[payload]: {available: false, description: payload}}}}, featureBody, converter);
assert.equal(featureBody.querySelector('img'), null);
assert(featureBody.textContent.includes(payload));
const rds = new w.WfmMetaPanel(el);
rds.radiotext_plus = {news: [], homepage: 'evil.test/" onclick="alert(1)'};
rds.update({mode: 'WFM'});
assert.equal(el.find('.rds-rtplus-homepage a').attr('onclick'), undefined);
rds.radiotext_plus.homepage = 'javascript://alert(1)';
rds.update({mode: 'WFM'});
assert.equal(el.find('.rds-rtplus-homepage a').attr('href'), '');
dom.window.close();
console.log('Metadata DOM security checks passed');
