//
// Utility functions
//

function Utils() {}

Utils.fm_url = 'https://www.google.com/search?q={}+FM';
Utils.callsign_url = null;
Utils.sonde_url = null;
Utils.vessel_url = null;
Utils.flight_url = null;
Utils.icao_url = null;
Utils.receiver_pos = null;

// Set receiver position
Utils.setReceiverPos = function(pos) {
    if (pos.lat && pos.lon) this.receiver_pos = pos;
};

// Get receiver position
Utils.getReceiverPos = function() {
    return this.receiver_pos;
};

// Set URL for linkifying callsigns
Utils.setCallsignUrl = function(url) {
    this.callsign_url = url;
};

// Set URL for linkifying radiosonde IDs
Utils.setSondeUrl = function(url) {
    this.sonde_url = url;
};

// Set URL for linkifying AIS vessel IDs
Utils.setVesselUrl = function(url) {
    this.vessel_url = url;
};

// Set URL for linkifying flight and aircraft IDs
Utils.setFlightUrl = function(url) {
    this.flight_url = url;
};

// Set URL for linkifying ICAO aircraft IDs
Utils.setIcaoUrl = function(url) {
    this.icao_url = url;
};

// Escape HTML code
Utils.htmlEscape = function(input) {
    return $('<div/>').text(input).html();
};

// Print frequency (in Hz) in a nice way
Utils.printFreq = function(freq) {
    if (isNaN(parseInt(freq))) {
        return freq;
    } else if (freq >= 30000000) {
        return '' + (freq / 1000000.0) + 'MHz';
    } else if (freq >= 10000) {
        return '' + (freq / 1000.0) + 'kHz';
    } else {
        return '' + freq + 'Hz';
    }
}

// Change frequency as required by given modulation
Utils.offsetFreq = function(freq, mod) {
    switch(mod) {
        case 'cw':
            return freq - UI.getCwOffset();
        case 'fax':
            return freq - 1900;
        case 'cwdecoder':
        case 'rtty450':
        case 'rtty170':
        case 'rtty85':
        case 'bpsk31':
        case 'bpsk63':
        case 'sitorb':
        case 'navtex':
        case 'dsc':
            return freq - 1000;
    }

    return freq;
}

// Wrap given callsign or other ID into a clickable link.
Utils.linkify = function(id, url = null, content = null, tip = null) {
    id = String(id == null? '' : id);
    // If no specific content, use the ID itself
    if (content == null) content = id;
    content = Utils.htmlEscape(content);

    // Compose tooltip
    var tipText = tip? ' title="' + Utils.htmlEscape(tip) + '"'  : '';

    // Must have valid ID and lookup URL
    if ((id == '') || (url == null) || (url == '')) {
        return tipText? '<div' + tipText + '>' + content + '</div>'  : content;
    } else {
        var href = url.replaceAll('{}', encodeURIComponent(id));
        try {
            var parsed = new URL(href, document.baseURI);
            if (!['http:', 'https:'].includes(parsed.protocol)) return content;
            href = parsed.href;
        } catch (e) {
            return content;
        }
        return '<a target="callsign_info" rel="noopener noreferrer"' + tipText + ' href="' +
            Utils.htmlEscape(href) + '">' + content + '</a>';
    }
};

// Linkify name by mode
Utils.linkifyByMode = function(mode, name) {
    switch (mode) {
        case 'SONDE': return this.linkifySonde(name);
        case 'AIS':   return this.linkifyVessel(name);
        case 'HDR':   return this.linkifyFM(name);
    }

    // Default is HAM callsign
    return this.linkifyCallsign(name);
};

// Create link to an FM station
Utils.linkifyFM = function(name) {
    return this.linkify(name, this.fm_url);
};

// Create link to a callsign, with country tooltip, etc.
Utils.linkifyCallsign = function(callsign) {
    // Strip callsign of modifiers
    var id = callsign.replace(/[-/].*$/, '');
    // Add country name as a tooltip
    return this.linkify(id, this.callsign_url, callsign, Lookup.call2cname(id));
};

// Create link to a radiosonde
Utils.linkifySonde = function(id) {
    return this.linkify(id, this.sonde_url, id);
};

// Create link to a maritime vessel, with country tooltip, etc.
Utils.linkifyVessel = function(mmsi) {
    // Add country name as a tooltip
    return this.linkify(mmsi, this.vessel_url, mmsi, Lookup.mmsi2cname(mmsi));
};

// Create link to a flight or an aircraft
Utils.linkifyFlight = function(flight, content = null) {
    return this.linkify(flight, this.flight_url, content);
};

// Create link to a MODE-S ICAO ID
Utils.linkifyIcao = function(icao, content = null) {
    return this.linkify(icao, this.icao_url, content);
};

// Create link to tune OWRX to the given frequency and modulation.
Utils.linkifyFreq = function(freq, mod) {
    var frequency = Number(freq);
    var modulation = String(mod == null? '' : mod);
    if (!Number.isFinite(frequency)) return Utils.htmlEscape(Utils.printFreq(freq));
    return '<a target="openwebrx-rx" href="/#freq='
        + encodeURIComponent(frequency) + ',mod=' + encodeURIComponent(modulation) + '">'
        + Utils.htmlEscape(Utils.printFreq(frequency)) + '</a>';
};

// Create link to a map locator
Utils.linkifyLocator = function(locator) {
    return '<a target="openwebrx-map" href="map?locator='
        + encodeURIComponent(locator) + '">' + Utils.htmlEscape(locator) + '</a>';
}

// Linkify given content so that clicking them opens the map with
// the info bubble.
Utils.linkToMap = function(id, content = null, attrs = "", contentIsHtml = false) {
    var safeContent = content == null? Utils.htmlEscape(id || '')
        : contentIsHtml? content : Utils.htmlEscape(content);
    if (id) {
        return '<a ' + attrs + ' href="map?callsign='
            + encodeURIComponent(id) + '" target="openwebrx-map">'
            + safeContent + '</a>';
    } else if (content != null) {
        return '<div ' + attrs + '>' + safeContent + '</div>';
    } else {
        return '';
    }
};

// Print time in hours, minutes, and seconds.
Utils.HHMMSS = function(t, local = false) {
    var pad = function (i) { return ('' + i).padStart(2, "0") };

    // Convert timestamps into dates
    if (!(t instanceof Date)) t = new Date(t);

    if (local) {
        return pad(t.getHours()) + ':' + pad(t.getMinutes()) + ':' + pad(t.getSeconds());
    } else {
        return pad(t.getUTCHours()) + ':' + pad(t.getUTCMinutes()) + ':' + pad(t.getUTCSeconds());
    }
};

var relativeTimeFormatter = null;
Utils.relativeTime = function(timestamp, now = Date.now()) {
    var date = Number(timestamp);
    var current = Number(now);
    if (!Number.isFinite(date) || !Number.isFinite(current)) return '';

    var difference = (date - current) / 1000;
    var seconds = Math.abs(difference);
    var unit;
    var count;
    if (seconds < 45) {
        unit = 'second';
        count = Math.round(seconds);
    } else if (seconds < 90) {
        unit = 'minute';
        count = 1;
    } else if (seconds < 45 * 60) {
        unit = 'minute';
        count = Math.round(seconds / 60);
    } else if (seconds < 90 * 60) {
        unit = 'hour';
        count = 1;
    } else if (seconds < 22 * 60 * 60) {
        unit = 'hour';
        count = Math.round(seconds / 3600);
    } else if (seconds < 36 * 60 * 60) {
        unit = 'day';
        count = 1;
    } else if (seconds < 26 * 86400) {
        unit = 'day';
        count = Math.round(seconds / 86400);
    } else if (seconds < 45 * 86400) {
        unit = 'month';
        count = 1;
    } else if (seconds < 320 * 86400) {
        unit = 'month';
        count = Math.round(seconds / (30 * 86400));
    } else if (seconds < 548 * 86400) {
        unit = 'year';
        count = 1;
    } else {
        unit = 'year';
        count = Math.round(seconds / (365 * 86400));
    }

    count *= Math.sign(difference);
    if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
        if (relativeTimeFormatter === null) {
            relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'});
        }
        return relativeTimeFormatter.format(count, unit);
    }

    var absoluteCount = Math.abs(count);
    var label = absoluteCount + ' ' + unit + (absoluteCount === 1 ? '' : 's');
    return count > 0 ? 'in ' + label : label + ' ago';
};

// Print location
Utils.latLon = function(latlon) {
    if (!latlon.lat || !latlon.lon) return '';

    return
      Math.abs(latlon.lat).toFixed(3) + (latlon.lat >= 0.0? '&deg;N, ':'&deg;S, ')
    + Math.abs(latlon.lon).toFixed(3) + (latlon.lon >= 0.0? '&deg;E':'&deg;W');
};

// Snap given frequency to the nearest step.
Utils.snapFrequency = function(freq, step) {
    if (step <= 0) {
        return Math.round(freq);
    } else if (step == 8330) {
        return this.snapAirbandFrequency(freq);
    } else {
        return Math.round(freq / step) * step;
    }
};

// Snap given frequency to the nearest airband frequency,
// with respect to the uneven 8.33kHz step.
Utils.snapAirbandFrequency = function(freq) {
    freq = Math.round(freq);

    var i  = freq % 25000;
    freq += i < 4165?  0 : i < 12500? 8330 : i < 20835? 16670 : 25000;
    freq -= i;

    return freq;
};

// Compute distance, in kilometers, between two latlons. Use receiver
// location if the second latlon is not provided.
Utils.distanceKm = function(p1, p2) {
    // Use receiver location if second latlon not given
    if (p2 == null) p2 = this.receiver_pos;
    // Convert from map objects to latlons
    if ("lng" in p1) p1 = { lat : p1.lat(), lon : p1.lng() };
    if ("lng" in p2) p2 = { lat : p2.lat(), lon : p2.lng() };
    // Earth radius in km
    var R = 6371.0;
    // Convert degrees to radians
    var rlat1 = p1.lat * (Math.PI/180);
    var rlat2 = p2.lat * (Math.PI/180);
    // Compute difference in radians
    var difflat = rlat2 - rlat1;
    var difflon = (p2.lon - p1.lon) * (Math.PI/180);
    // Compute distance
    d = 2 * R * Math.asin(Math.sqrt(
        Math.sin(difflat/2) * Math.sin(difflat/2) +
        Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon/2) * Math.sin(difflon/2)
    ));
    return Math.round(d);
};

// Truncate string to a given number of characters, adding "..." to the end.
Utils.truncate = function(str, count) {
    str = String(str == null? '' : str);
    return str.length > count? str.slice(0, count) + '…'  : str;
};

// Convert degrees to compass direction.
Utils.degToCompass = function(deg) {
    dir = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dir[Math.floor((deg/22.5) + 0.5) % 16];
};

// Convert Maidenhead locator ID to lat/lon pair.
Utils.loc2latlng = function(id) {
    return [
        (id.charCodeAt(1) - 65 - 9) * 10 + Number(id[3]) + 0.5,
        (id.charCodeAt(0) - 65 - 9) * 20 + Number(id[2]) * 2 + 1.0
    ];
};

// Convert given name to an information section title.
Utils.makeListTitle = function(name) {
    return '<div style="border-bottom:2px solid;padding-top:1em;"><b>' + Utils.htmlEscape(name) + '</b></div>';
};

// Convert given name/value to an information section item.
Utils.makeListItem = function(name, value, valueIsHtml = false) {
    return '<div style="display:flex;justify-content:space-between;border-bottom:1px dotted;white-space:nowrap;">'
        + '<span>' + Utils.htmlEscape(name) + '&nbsp;&nbsp;&nbsp;&nbsp;</span>'
        + '<span>' + (valueIsHtml? value : Utils.htmlEscape(value)) + '</span>'
        + '</div>';
};

// Get opacity value in the 0..1 range based on the given age.
Utils.getOpacityScale = function(age) {
    var scale = 1;
    if (age >= retention_time / 2) {
        scale = (retention_time - age) / (retention_time / 2);
    }
    return Math.max(0, Math.min(1, scale));
};

// Save given canvas into a PNG file.
Utils.saveCanvas = function(canvas, filename) {
    // Get canvas by its ID
    var c = document.getElementById(canvas);
    if (c == null) return;

    // Convert canvas to a data blob
    c.toBlob(function(blob) {
        // Create and click a link to the canvas data URL
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.style = 'display: none';
        a.download = (filename || canvas) + ".png";
        document.body.appendChild(a);
        a.click();

        // Get rid of the canvas data URL
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 0);
    }, 'image/png');
};

//
// Local Storage Access
//

function LS() {}

// Return true of setting exist in storage.
LS.has = function(key) {
    return localStorage && (localStorage.getItem(key)!=null);
};

// Remove item from local storage.
LS.delete = function(key) {
    if (localStorage) localStorage.removeItem(key);
};

// Save named UI setting to local storage.
LS.save = function(key, value) {
    if (localStorage) localStorage.setItem(key, value);
};

// Load named UI setting from local storage.
LS.loadStr = function(key) {
    return localStorage? localStorage.getItem(key) : null;
};

LS.loadInt = function(key) {
    var x = localStorage? localStorage.getItem(key) : null;
    return x!=null? parseInt(x) : 0;
}

LS.loadBool = function(key) {
    var x = localStorage? localStorage.getItem(key) : null;
    return x==='true';
}
