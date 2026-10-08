// Run with jsdom installed outside the repository; see SECURITY_AUDIT.md.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<div id="meta"><div class="drm-programs"></div><div class="rds-rtplus-homepage"></div></div><div id="hdr-logo"></div><select id="hdr-program-id"></select>', {runScripts: 'outside-only'});
const w = dom.window;
for (const file of ['htdocs/lib/jquery-3.7.1.min.js', 'htdocs/lib/Utils.js', 'htdocs/lib/MetaPanel.js']) {
    w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
}
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
const rds = new w.WfmMetaPanel(el);
rds.radiotext_plus = {news: [], homepage: 'evil.test/" onclick="alert(1)'};
rds.update({mode: 'WFM'});
assert.equal(el.find('.rds-rtplus-homepage a').attr('onclick'), undefined);
rds.radiotext_plus.homepage = 'javascript://alert(1)';
rds.update({mode: 'WFM'});
assert.equal(el.find('.rds-rtplus-homepage a').attr('href'), '');
dom.window.close();
console.log('Metadata DOM security checks passed');
