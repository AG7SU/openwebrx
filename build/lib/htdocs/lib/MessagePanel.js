function MessagePanel(el) {
    this.el = el;
    this.render();
    this.initClearButton();
}

function safeMessageColor(value, fallback) {
    return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? value : fallback;
}

function validImageDimensions(width, height) {
    return Number.isInteger(width) && Number.isInteger(height)
        && width > 0 && height > 0 && width <= 4096 && height <= 4096
        && width * height <= 16777216;
}

function decodeBoundedBase64(value, maxLength) {
    if (typeof value !== 'string' || value.length > maxLength) return null;
    try {
        return atob(value);
    } catch (e) {
        return null;
    }
}

var messageCanvasId = 0;

MessagePanel.prototype.supportsMessage = function(message) {
    return false;
};

MessagePanel.prototype.render = function() {
};

MessagePanel.prototype.pushMessage = function(message) {
};

// Automatic clearing is not enabled by default.
// Call this method from the constructor to enable.
MessagePanel.prototype.initClearTimer = function() {
    var me = this;
    if (me.removalInterval) clearInterval(me.removalInterval);
    me.removalInterval = setInterval(function () {
        me.clearMessages(250);
    }, 15000);
};

// Clear all currently shown messages.
MessagePanel.prototype.clearMessages = function(toRemain) {
    var $elements = $(this.el).find('tbody tr');
    // limit to 1000 entries in the list since browsers get laggy at some point
    var toRemove = $elements.length - toRemain;
    if (toRemove <= 0) return;
    $elements.slice(0, toRemove).remove();
};

// Add CLEAR button to the message list.
MessagePanel.prototype.initClearButton = function() {
    var me = this;
    me.clearButton = $(
        '<div class="openwebrx-button">Clear</div>'
    );
    me.clearButton.css({
        position: 'absolute',
        top: '10px',
        right: '10px'
    });
    me.clearButton.on('click', function() {
        me.clearMessages(0);
    });
    $(me.el).append(me.clearButton);
};

// Scroll to the bottom of the message list.
MessagePanel.prototype.scrollToBottom = function() {
    var $t = $(this.el).find('tbody');
    $t.scrollTop($t[0].scrollHeight);
};

function WsjtMessagePanel(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
    this.qsoModes = ['FT8', 'JT65', 'JT9', 'FT4', 'FST4', 'Q65', 'MSK144'];
    this.beaconModes = ['WSPR', 'FST4W'];
    this.modes = [].concat(this.qsoModes, this.beaconModes);
}

WsjtMessagePanel.prototype = Object.create(MessagePanel.prototype);

WsjtMessagePanel.prototype.supportsMessage = function(message) {
    return this.modes.indexOf(message['mode']) >= 0;
};

WsjtMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="time">UTC</th>' +
                '<th class="decimal">dB</th>' +
                '<th class="decimal">DT</th>' +
                '<th class="decimal freq">Freq</th>' +
                '<th class="message">Message</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

WsjtMessagePanel.prototype.pushMessage = function(msg) {
    var $b = $(this.el).find('tbody');
    var linkedmsg = msg['msg'];
    var matches;

    if (this.qsoModes.indexOf(msg['mode']) >= 0) {
        matches = linkedmsg.match(/^(.*?)([A-Z0-9\/]+)\s([A-Z0-9\/]+)\s(([A-R]{2}[0-9]{2})|(R?[+\-]?[0-9]{2})|(RRR))$/);
        if (matches) {
            var destination = matches[2]!=='CQ' && matches[2]!=='DX' && matches[2]!=='TEST'?
                Utils.linkifyCallsign(matches[2]) : matches[2];
            var locator = matches[5] && matches[5]!=='RR73'?
                Utils.linkifyLocator(matches[5]) : matches[4];
            linkedmsg = Utils.htmlEscape(matches[1]) + destination
                + ' ' + Utils.linkifyCallsign(matches[3])
                + ' ' + locator;
        } else {
            linkedmsg = Utils.htmlEscape(linkedmsg);
        }
    } else if (this.beaconModes.indexOf(msg['mode']) >= 0) {
        matches = linkedmsg.match(/([A-Z0-9]+)\s([A-R]{2}[0-9]{2})\s([0-9]+)/);
        if (matches) {
            linkedmsg = Utils.linkifyCallsign(matches[1])
                + ' ' + Utils.linkifyLocator(matches[2])
                + ' ' + Utils.htmlEscape(matches[3]);
        } else {
            linkedmsg = Utils.htmlEscape(linkedmsg);
        }
    }
    $b.append($(
        '<tr data-timestamp="' + Utils.htmlEscape(msg['timestamp']) + '">' +
        '<td class="time">' + Utils.HHMMSS(msg['timestamp']) + '</td>' +
        '<td class="decimal">' + Utils.htmlEscape(msg['db']) + '</td>' +
        '<td class="decimal">' + Utils.htmlEscape(msg['dt']) + '</td>' +
        '<td class="decimal freq">' + Utils.htmlEscape(msg['freq']) + '</td>' +
        '<td class="message" style="font-family:monospace;">' + linkedmsg + '</td>' +
        '</tr>'
    ));
    this.scrollToBottom();
}

$.fn.wsjtMessagePanel = function(){
    if (!this.data('panel')) {
        this.data('panel', new WsjtMessagePanel(this));
    }
    return this.data('panel');
};

function PacketMessagePanel(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
    this.modes = ['APRS', 'AIS', 'SONDE'];
}

PacketMessagePanel.prototype = Object.create(MessagePanel.prototype);

PacketMessagePanel.prototype.supportsMessage = function(message) {
    return this.modes.indexOf(message['mode']) >= 0;
};

PacketMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="time">UTC</th>' +
                '<th class="callsign">Callsign</th>' +
                '<th class="coord">Coord</th>' +
                '<th class="message">Comment</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

PacketMessagePanel.prototype.pushMessage = function(msg) {
    var $b = $(this.el).find('tbody');

    if (msg.type && msg.type === 'thirdparty' && msg.forwarded) {
        msg = msg.forwarded;
    }

    var source = msg.source;
    if (msg.type) {
        if (msg.type === 'nmea') {
            // Do not show AIS-specific stuff for now
            return;
        }
        if (msg.type === 'item') {
            source = msg.item;
        }
        if (msg.type === 'object') {
            source = msg.object;
        }
    }

    var timestamp = msg.timestamp? Utils.HHMMSS(msg.timestamp) : '';

    var link = '';
    var classes = [];
    var styles = {};
    var overlay = '';
    var stylesToString = function (s) {
        return $.map(s, function (value, key) {
            return key + ':' + value + ';'
        }).join('')
    };
    if (msg.symbol) {
        var symbolIndex = Number.isInteger(msg.symbol.index) && msg.symbol.index >= 0 && msg.symbol.index <= 255
            ? msg.symbol.index : 0;
        classes.push('aprs-symbol');
        classes.push('aprs-symboltable-' + (msg.symbol.table === '/' ? 'normal' : 'alternate'));
        styles['background-position-x'] = -(symbolIndex % 16) * 15 + 'px';
        styles['background-position-y'] = -Math.floor(symbolIndex / 16) * 15 + 'px';
        if (msg.symbol.table !== '/' && msg.symbol.table !== '\\') {
            var s = {};
            var tableIndex = Number.isInteger(msg.symbol.tableindex) && msg.symbol.tableindex >= 0 && msg.symbol.tableindex <= 255
                ? msg.symbol.tableindex : 0;
            s['background-position-x'] = -(tableIndex % 16) * 15 + 'px';
            s['background-position-y'] = -Math.floor(tableIndex / 16) * 15 + 'px';
            overlay = '<div class="aprs-symbol aprs-symboltable-overlay" style="' + stylesToString(s) + '"></div>';
        }
    } else if (msg.lat && msg.lon) {
        classes.push('openwebrx-maps-pin');
        overlay = '<svg viewBox="0 0 20 35"><use xlink:href="static/gfx/svg-defs.svg#maps-pin"></use></svg>';
    }
    var attrs = [
        'class="' + classes.join(' ') + '"',
        'style="' + stylesToString(styles) + '"'
    ].join(' ');
    if (msg.lat && msg.lon) {
        link = Utils.linkToMap(source, overlay, attrs, true);
    } else {
        link = Utils.linkToMap(null, overlay, attrs, true);
    }

    // Compose comment
    var comment = msg.comment || msg.message || '';
    if (comment !== '') {
        // Escape all special characters
        comment = Utils.htmlEscape(comment);
    } else if (msg.weather) {
        // Add weather readings
        if (msg.weather.temperature) {
            comment += 'Temperature ' + msg.weather.temperature.toFixed(1) + '&deg;C';
        }
        if (msg.weather.humidity) {
            comment += (comment? ', ':'') + 'Humidity ' + Utils.htmlEscape(msg.weather.humidity) + '%';
        }
        if (msg.weather.barometricpressure) {
            comment += (comment? ', ':'') + 'Pressure ' + msg.weather.barometricpressure.toFixed(1) + ' mbar';
        }
    } else if (msg.altitude || msg.speed) {
        // Add position readings
        if (msg.altitude) {
            comment += 'Altitude ' + msg.altitude.toFixed(0) + ' m';
            if (msg.vspeed > 0) comment += ' &uarr;' + msg.vspeed.toFixed(1) + ' m/s';
            if (msg.vspeed < 0) comment += ' &darr;' + (-msg.vspeed).toFixed(1) + ' m/s';
        }
        if (msg.speed) {
            comment += (comment? ', ':'') + 'Speed ' + msg.speed.toFixed(1) + ' km/h';
            if (msg.course) comment += ' ' + Utils.degToCompass(msg.course);
        }
    } else if (msg.device) {
        // Add device model and manufacturer
        comment = msg.device.manufacturer?
            Utils.htmlEscape(msg.device.manufacturer + ' ' + msg.device.device)
            : Utils.htmlEscape(msg.device);
    } else if (msg.country) {
        // Add country flag and name in lieu of comment
        comment = Lookup.cdata2country([msg.ccode, msg.country]);
    } else if (msg.mode === 'AIS') {
        // Get country flag and name from the MMSI
        comment = Lookup.mmsi2country(source);
    }

    // Linkify source based on what it is (sonde, vessel, or HAM callsign)
    source = Utils.linkifyByMode(msg.mode, source);

    $b.append($(
        '<tr>' +
        '<td class="time">' + timestamp + '</td>' +
        '<td class="callsign">' + source + '</td>' +
        '<td class="coord">' + link + '</td>' +
        '<td class="message">' + comment + '</td>' +
        '</tr>'
    ));
    this.scrollToBottom();
};

$.fn.packetMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new PacketMessagePanel(this));
    }
    return this.data('panel');
};

PocsagMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
}

PocsagMessagePanel.prototype = Object.create(MessagePanel.prototype);

PocsagMessagePanel.prototype.supportsMessage = function(message) {
    return message['mode'] === 'Pocsag';
};

PocsagMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="address">Address</th>' +
                '<th class="message">Message</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

PocsagMessagePanel.prototype.pushMessage = function(msg) {
    var $b = $(this.el).find('tbody');
    $b.append($(
        '<tr>' +
            '<td class="address">' + Utils.htmlEscape(msg.address) + '</td>' +
            '<td class="message">' + Utils.htmlEscape(msg.message) + '</td>' +
        '</tr>'
    ));
    this.scrollToBottom();
};

$.fn.pocsagMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new PocsagMessagePanel(this));
    }
    return this.data('panel');
};

PageMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
}

PageMessagePanel.prototype = Object.create(MessagePanel.prototype);

PageMessagePanel.prototype.supportsMessage = function(message) {
    return (message['mode'] === 'FLEX') || (message['mode'] === 'POCSAG');
};

PageMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="address">CapCode</th>' +
                '<th class="mode">Mode</th>' +
                '<th class="timestamp">Time</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

PageMessagePanel.prototype.pushMessage = function(msg) {
    // Get color from the message, default to white
    var color = safeMessageColor(msg.color, '#FFF');

    // Get channel from the message (FLEX only)
    var channel = msg.hasOwnProperty('channel')? '/' + Utils.htmlEscape(msg.channel) : '';


    // Append message header (address, time, etc)
    var $b = $(this.el).find('tbody');
    $b.append($(
        '<tr>' +
            '<td class="address">' + Utils.htmlEscape(msg.address) + '</td>' +
            '<td class="mode">' + Utils.htmlEscape(msg.mode) + Utils.htmlEscape(msg.baud) +
                Utils.htmlEscape(channel) + '</td>' +
            '<td class="timestamp" style="text-align:right;">' + Utils.HHMMSS(msg.timestamp) + '</td>' +
        '</tr>'
    ).css('background-color', color).css('color', '#000'));

    // Append message body (text)
    if (msg.hasOwnProperty('message')) {
        $b.append($(
            '<tr><td class="message" colspan="3">' +
            Utils.htmlEscape(msg.message) +
            '</td></tr>'
        ));
    }

    // Jump list to the last received message
    this.scrollToBottom();
};

$.fn.pageMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new PageMessagePanel(this));
    }
    return this.data('panel');
};

HfdlMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
    this.modes = ['HFDL', 'VDL2', 'ADSB', 'ACARS', 'UAT'];
}

HfdlMessagePanel.prototype = Object.create(MessagePanel.prototype);

HfdlMessagePanel.prototype.supportsMessage = function(message) {
    return this.modes.indexOf(message['mode']) >= 0;
};

HfdlMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="timestamp">Time</th>' +
                '<th class="flight">Flight</th>' +
                '<th class="aircraft">Aircraft</th>' +
                '<th class="data">Data</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

HfdlMessagePanel.prototype.pushMessage = function(msg) {
    var bcolor = safeMessageColor(msg.color, '#000');
    var fcolor = bcolor === '#000' ? '#FFF' : '#000';
    var data   = msg.type? Utils.htmlEscape(msg.type) : '';

    // Only linkify ICAO-compliant flight IDs
    var flight =
      !msg.flight? ''
    : !msg.flight.match(/^[A-Z]{3}[0-9]+[A-Z]*$/)? Utils.htmlEscape(msg.flight)
    : Utils.linkifyFlight(msg.flight);

    var aircraft =
      msg.aircraft? Utils.linkifyFlight(msg.aircraft)
    : msg.icao?     Utils.linkifyIcao(msg.icao)
    : '';

    var tstamp =
      msg.msgtime?   '<b>' + Utils.htmlEscape(msg.msgtime) + '</b>'
    : msg.timestamp? Utils.HHMMSS(msg.timestamp)
    : '';

    // Add location, altitude, speed, etc
    var data = '';
    if (msg.lat && msg.lon) {
        data += '@' + msg.lat.toFixed(4) + ',' + msg.lon.toFixed(4);
    }
    if (msg.altitude)    data += ' &UpArrowBar;' + Utils.htmlEscape(msg.altitude) + 'ft';
    if (msg.vspeed>0)    data += ' &UpperRightArrow;' + Utils.htmlEscape(msg.vspeed) + 'ft/m';
    if (msg.vspeed<0)    data += ' &LowerRightArrow;' + Utils.htmlEscape(-msg.vspeed) + 'ft/m';
    if (msg.speed)       data += ' &rightarrow;' + Utils.htmlEscape(msg.speed) + 'kt';
    if (msg.origin)      data += ' &lsh;' + Utils.htmlEscape(msg.origin);
    if (msg.destination) data += ' &rdsh;' + Utils.htmlEscape(msg.destination);

    // If no location data in the message, use message type as data
    if (!data.length && msg.type) data = Utils.htmlEscape(msg.type);

    // Make data point to the map
    if (data.length && msg.mapid) data = Utils.linkToMap(msg.mapid, data, "", true);

    // Add message direction to the aircraft
    //if (aircraft && msg.direction) {
    //    aircraft += (
    //      msg.direction === 'U'? '&#9664;'
    //    : msg.direction === 'D'? '&#9654;'
    //    : '');
    //}

    // Append report
    var $b = $(this.el).find('tbody');
    $b.append($(
        '<tr>' +
            '<td class="timestamp">' + tstamp + '</td>' +
            '<td class="flight">' + flight + '</td>' +
            '<td class="aircraft">' + aircraft + '</td>' +
            '<td class="data" style="text-align:left;">' + data + '</td>' +
        '</tr>'
    ).css('background-color', bcolor).css('color', fcolor));

    // Append messsage if present
    if (msg.message) {
        $b.append($(
            '<tr><td class="message" colspan="4">' + Utils.htmlEscape(msg.message) + '</td></tr>'
        ));
    }

    // Jump list to the last received message
    this.scrollToBottom();
};

$.fn.hfdlMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new HfdlMessagePanel(this));
    }
    return this.data('panel');
};

AdsbMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.clearButton.css('display', 'none');
}

AdsbMessagePanel.prototype = Object.create(MessagePanel.prototype);

AdsbMessagePanel.prototype.supportsMessage = function(message) {
    return message['mode'] === 'ADSB-LIST';
};

AdsbMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="flight">Flight</th>' +
                '<th class="aircraft">Aircraft</th>' +
                '<th class="squawk">Squawk</th>' +
                '<th class="distance">Dist</th>' +
                '<th class="altitude">Alt&nbsp;(ft)</th>' +
                '<th class="speed">Speed&nbsp;(kt)</th>' +
                '<th class="rssi">Signal</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

AdsbMessagePanel.prototype.pushMessage = function(msg) {
    // Must have list of aircraft
    if (!msg.aircraft) return;

    // Create new table body
    var body = '';
    var odd = false;
    msg.aircraft.forEach(entry => {
        // Signal strength
        var rssi = entry.rssi? Utils.htmlEscape(entry.rssi) + '&nbsp;dB' : '';

        // Flight identificators
        var flight =
          entry.flight? Utils.linkifyFlight(entry.flight)
        : '';
        var aircraft =
          entry.aircraft? Utils.linkifyFlight(entry.aircraft)
        : entry.icao?     Utils.linkifyIcao(entry.icao)
        : '';

        // Add country flag
        var flag = entry.ccode && Lookup.ccode2flag(entry.ccode);
        if (flag) aircraft = flag + '&nbsp;' + aircraft;

        // Altitude and climb / descent
        var alt  = entry.altitude? Utils.htmlEscape(entry.altitude) : '';
        if (entry.vspeed) {
            var vspeed = entry.vspeed;
            vspeed = vspeed>0? Utils.htmlEscape(vspeed) + '&uarr;' : Utils.htmlEscape(-vspeed) + '&darr;';
            alt    = vspeed + '&nbsp'.repeat(6 - alt.length) + alt;
        }

        // Speed and direction
        var speed = entry.speed? Utils.htmlEscape(entry.speed) : '';
        if (entry.course) {
            var dir = Utils.degToCompass(entry.course);
            speed = dir + '&nbsp'.repeat(5 - speed.length) + speed;
        }

        // Replace squawk with emergency status, if present
        var squawk = entry.squawk? Utils.htmlEscape(entry.squawk) : '';
        if (entry.emergency && (entry.emergency!=='NONE')) {
            squawk = '<div style="color:white;background-color:red;"><b>&nbsp;'
                + Utils.htmlEscape(entry.emergency) + '&nbsp;</b></div>';
        }

        // Compute distance to the receiver
        var distance = '';
        var receiver_pos = Utils.getReceiverPos();
        if (receiver_pos && entry.lat && entry.lon) {
            var id = entry.icao?     entry.icao
                   : entry.aircraft? entry.aircraft
                   : entry.flight?   entry.flight
                   : null;

            distance = Utils.distanceKm(entry, receiver_pos) + '&nbsp;km';
            if (id) distance = Utils.linkToMap(id, distance);
        }

        body += '<tr style="background-color:' + (odd? '#E0FFE0':'#FFFFFF') + ';">'
            + '<td class="flight">'   + flight   + '</td>'
            + '<td class="aircraft">' + aircraft + '</td>'
            + '<td class="squawk">'   + squawk   + '</td>'
            + '<td class="distance">' + distance + '</td>'
            + '<td class="altitude">' + alt      + '</td>'
            + '<td class="speed">'    + speed    + '</td>'
            + '<td class="rssi">'     + rssi     + '</td>'
            + '</tr>\n';
        odd = !odd;
    });

    // Assign new table body
    $(this.el).find('tbody').html(body);
};

$.fn.adsbMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new AdsbMessagePanel(this));
    }
    return this.data('panel');
};

DscMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
}

DscMessagePanel.prototype = Object.create(MessagePanel.prototype);

DscMessagePanel.prototype.supportsMessage = function(message) {
    return message['mode'] === 'DSC';
};

DscMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="timestamp">UTC</th>' +
                '<th class="src">From</th>' +
                '<th class="dst">To</th>' +
                '<th class="data">Data</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

DscMessagePanel.prototype.pushMessage = function(msg) {
    var bcolor = safeMessageColor(msg.color, '#000');
    var fcolor = bcolor === '#000' ? '#FFF' : '#000';
    var src    = msg.src? Utils.linkifyVessel(msg.src) : '';
    var dst    = msg.dst? Utils.linkifyVessel(msg.dst) : '';
    var data   = Utils.htmlEscape((
      (msg.category? ' ' + msg.category : '')
    + (msg.format?   ' ' + msg.format : '')
    + (msg.eos?      ' ' + msg.eos : '')
    + (!msg.ecc && !msg.data? ' ?' : '')
    ).trim().toUpperCase());

    // Format timestamp
    var timestamp =
      msg.time?      '<b>' + Utils.htmlEscape(msg.time) + '</b>'
    : msg.timestamp? Utils.HHMMSS(msg.timestamp)
    : '';

    // Format debugging data
    var symbols = '';
    if (msg.data) {
        var dataParts = String(msg.data).match(/(.*)\|(.*)/);
        symbols = dataParts
            ? Utils.htmlEscape(dataParts[1]) + '<span style="opacity:0.5;"> | '
                + Utils.htmlEscape(dataParts[2]) + ' &hellip;</span>'
            : Utils.htmlEscape(msg.data);
    }

    // Combine remaining attributes into a message
    var message = (
      (msg.distress? ' ' + Utils.htmlEscape(msg.distress) : '')
    + (msg.id?     ' SHIP ' + Utils.linkifyVessel(msg.id) : '')
    + (msg.loc?    ' AT ' + Utils.htmlEscape(msg.loc) : '')
    + (msg.num?    ' DIAL ' + Utils.htmlEscape(msg.num) : '')
    + (msg.rxfreq? ' RX ' + Utils.htmlEscape(Utils.printFreq(msg.rxfreq)) : '')
    + (msg.txfreq? ' TX ' + Utils.htmlEscape(Utils.printFreq(msg.txfreq)) : '')
    + symbols
    ).trim();

    // Append report
    var $b = $(this.el).find('tbody');
    $b.append($(
        '<tr>' +
            '<td class="timestamp">' + timestamp + '</td>' +
            '<td class="src">' + src + '</td>' +
            '<td class="dst">' + dst + '</td>' +
            '<td class="data" style="text-align:left;">' + data + '</td>' +
        '</tr>'
    ).css('background-color', bcolor).css('color', fcolor));

    // Append messsage if present
    if (message) {
        $b.append($(
            '<tr><td class="message" colspan="4">' + message + '</td></tr>'
        ));
    }

    // Jump list to the last received message
    this.scrollToBottom();
};

$.fn.dscMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new DscMessagePanel(this));
    }
    return this.data('panel');
};

IsmMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
    // These are basic message attributes
    this.basicInfo = ['mode', 'id', 'model', 'timestamp', 'freq', 'color'];
}

IsmMessagePanel.prototype = Object.create(MessagePanel.prototype);

IsmMessagePanel.prototype.supportsMessage = function(message) {
    return (message['mode'] === 'ISM') || (message['mode'] === 'WMBUS');
};

IsmMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="address">ID</th>' +
                '<th class="device">Device</th>' +
                '<th class="timestamp">Time</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

IsmMessagePanel.prototype.formatAttr = function(msg, key) {
    return('<td class="attr" colspan="2">' +
        '<div style="border-bottom:1px dotted;">' +
        '<span style="float:left;">' + Utils.htmlEscape(key) + '</span>' +
        '<span style="float:right;word-break:break-all;">' + Utils.htmlEscape(msg[key]) + '</span>' +
        '</div></td>'
    );
};

IsmMessagePanel.prototype.pushMessage = function(msg) {
    // Get basic information, assume white color if missing
    var address = msg.hasOwnProperty('id')? Utils.htmlEscape(msg.id) : '???';
    var device  = msg.hasOwnProperty('model')? Utils.htmlEscape(msg.model) : '';
    var tstamp  = msg.hasOwnProperty('timestamp')? Utils.HHMMSS(msg.timestamp) : '';
    var color   = safeMessageColor(msg.color, '#FFF');

    // Append message header (address, time, etc)
    var $b = $(this.el).find('tbody');
    $b.append($(
        '<tr>' +
            '<td class="address">' + address + '</td>' +
            '<td class="device">' + device + '</td>' +
            '<td class="timestamp" style="text-align:right;" colspan="2">' + tstamp + '</td>' +
        '</tr>'
    ).css('background-color', color).css('color', '#000'));

    // Append attributes in pairs, skip basic information
    var last = null;
    for (var key in msg) {
        if (this.basicInfo.indexOf(key) < 0) {
            var cell = this.formatAttr(msg, key);
            if (!last) {
                last = cell;
            } else {
                $b.append($('<tr>' + last + cell + '</tr>'));
                last = null;
            }
        }
    }

    // Last row
    if (last) $b.append($('<tr>' + last + '<td class="attr"/></tr>'));

    // Jump list to the last received message
    this.scrollToBottom();
};

$.fn.ismMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new IsmMessagePanel(this));
    }
    return this.data('panel');
};

SstvMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
}

SstvMessagePanel.prototype = Object.create(MessagePanel.prototype);

SstvMessagePanel.prototype.supportsMessage = function(message) {
    return message['mode'] === 'SSTV';
};

SstvMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="message">TV</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

SstvMessagePanel.prototype.pushMessage = function(msg) {
    var $b = $(this.el).find('tbody');
    if(msg.hasOwnProperty('message')) {
        // Append a new debug message text
// See service log for debug output instead
//        $b.append($('<tr><td class="message">' + msg.message + '</td></tr>'));
//        this.scrollToBottom();
    }
    else if(validImageDimensions(msg.width, msg.height) && !msg.hasOwnProperty('line')) {
        var f = msg.frequency>0? ' at ' + Math.floor(msg.frequency/1000) + 'kHz' : '';
        var label = [msg.timestamp, msg.width + 'x' + msg.height, msg.sstvMode, f].join(' ');
        var canvasId = 'sstv-frame-' + (++messageCanvasId);
        var filename = String(msg.filename || canvasId).replace(/[^a-z0-9_.-]/gi, '_');
        var $canvas = $('<canvas class="frame"></canvas>').attr({
            id: canvasId,
            width: msg.width,
            height: msg.height,
        });
        var $container = $('<div></div>').append($canvas).on('click', function() {
            Utils.saveCanvas(canvasId, filename);
        });
        var $cell = $('<td class="message"></td>').append($('<div></div>').text(label), $container);
        $b.append($('<tr></tr>').append($cell));
        $b.scrollTop($b[0].scrollHeight);
        // Save canvas context and dimensions for future use
        this.ctx    = $(this.el).find('canvas').get(-1).getContext("2d");
        this.width  = msg.width;
        this.height = msg.height;
    }
    else if(validImageDimensions(msg.width, msg.height) && msg.width === this.width && msg.line>=0 && msg.line<this.height && typeof msg.pixels === 'string' && msg.pixels.length <= msg.width * 4 && msg.hasOwnProperty('pixels')) {
        // Will copy pixels to img
        var pixels = decodeBoundedBase64(msg.pixels, msg.width * 4);
        if (pixels === null) return;
        if (pixels.length !== msg.width * 3 || !this.ctx) return;
        var img = this.ctx.createImageData(msg.width, 1);
        // Convert BMP BGR pixels into HTML RGBA pixels
        for (var x = 0; x < msg.width; x++) {
            img.data[x*4 + 0] = pixels.charCodeAt(x*3 + 2);
            img.data[x*4 + 1] = pixels.charCodeAt(x*3 + 1);
            img.data[x*4 + 2] = pixels.charCodeAt(x*3 + 0);
            img.data[x*4 + 3] = 0xFF;
        }
        // Render scanline
        this.ctx.putImageData(img, 0, msg.line);
    }
};

$.fn.sstvMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new SstvMessagePanel(this));
    }
    return this.data('panel');
};

FaxMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
}

FaxMessagePanel.prototype = Object.create(MessagePanel.prototype);

FaxMessagePanel.prototype.supportsMessage = function(message) {
    return message['mode'] === 'Fax';
};

FaxMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="message">Fax</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

FaxMessagePanel.prototype.pushMessage = function(msg) {
    var $b = $(this.el).find('tbody');
    if(msg.hasOwnProperty('message')) {
        // Append a new debug message text
// See service log for debug output instead
//        $b.append($('<tr><td class="message">' + msg.message + '</td></tr>'));
//        this.scrollToBottom();
    }
    else if(validImageDimensions(msg.width, msg.height) && !msg.hasOwnProperty('line')) {
        var f = msg.frequency>0? ' at ' + Math.floor(msg.frequency/1000) + 'kHz' : '';
        var label = [msg.timestamp, msg.width + 'x' + msg.height, msg.faxMode, f].join(' ');
        var canvasId = 'fax-frame-' + (++messageCanvasId);
        var filename = String(msg.filename || canvasId).replace(/[^a-z0-9_.-]/gi, '_');
        var $canvas = $('<canvas class="frame"></canvas>').attr({
            id: canvasId,
            width: msg.width,
            height: msg.height,
        });
        var $container = $('<div></div>').append($canvas).on('click', function() {
            Utils.saveCanvas(canvasId, filename);
        });
        var $cell = $('<td class="message"></td>').append($('<div></div>').text(label), $container);
        $b.append($('<tr></tr>').append($cell));
        this.scrollToBottom();
        // Save canvas context and dimensions for future use
        this.ctx    = $(this.el).find('canvas').get(-1).getContext("2d");
        this.width  = msg.width;
        this.height = msg.height;
    }
    else if(validImageDimensions(msg.width, msg.height) && msg.width === this.width && msg.line>0 && msg.line<=this.height && msg.ended && this.ctx) {
        const canvas  = $(this.el).find('canvas').get(-1);
        if (!canvas) return;
        const image   = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.height = msg.line;
        this.height   = msg.line;
        this.ctx.putImageData(image, 0, 0);
    }
    else if(validImageDimensions(msg.width, msg.height) && msg.width === this.width && msg.line>=0 && msg.line<this.height && typeof msg.pixels === 'string' && msg.pixels.length <= msg.width * 4 && msg.hasOwnProperty('pixels') && this.ctx) {
        // Will copy pixels to img
        var img = this.ctx.createImageData(msg.width, 1);
        var pixels;

        // Unpack RLE-compressed line of pixels
        if(!msg.rle) {
            pixels = decodeBoundedBase64(msg.pixels, msg.width * 4);
            if (pixels === null) return;
        } else {
            var rle = decodeBoundedBase64(msg.pixels, msg.width * 4);
            if (rle === null) return;
            pixels = '';
            for(var x=0 ; x<rle.length ; ) {
                var c = rle.charCodeAt(x);
                var run;
                if(c<128) {
                    run = rle.slice(x+1, x+c+2);
                    x += c + 2;
                } else {
                    run = rle.slice(x+1, x+2).repeat(c-128+2);
                    x += 2;
                }
                if (!run.length || pixels.length + run.length > msg.width * (msg.depth == 8 ? 1 : 3)) return;
                pixels += run;
            }
        }

        var expectedPixelBytes = msg.width * (msg.depth == 8 ? 1 : 3);
        if (pixels.length !== expectedPixelBytes) return;

        // Convert BMP BGR pixels into HTML RGBA pixels
        if(msg.depth==8) {
            for(var x=0, y=0; x<msg.width; x++) {
                var c = pixels.charCodeAt(x);
                img.data[y++] = c;
                img.data[y++] = c;
                img.data[y++] = c;
                img.data[y++] = 0xFF;
            }
        } else {
            for (var x = 0; x < msg.width; x++) {
                img.data[x*4 + 0] = pixels.charCodeAt(x*3 + 2);
                img.data[x*4 + 1] = pixels.charCodeAt(x*3 + 1);
                img.data[x*4 + 2] = pixels.charCodeAt(x*3 + 0);
                img.data[x*4 + 3] = 0xFF;
            }
        }

        // Render scanline
        this.ctx.putImageData(img, 0, msg.line);
    }
};

$.fn.faxMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new FaxMessagePanel(this));
    }
    return this.data('panel');
};

SkimmerMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.texts = [];

    // CLEAR button clears underlying texts storage
    var me = this;
    this.clearButton.on('click', function() { me.texts = []; });
}

SkimmerMessagePanel.prototype = Object.create(MessagePanel.prototype);

SkimmerMessagePanel.prototype.supportsMessage = function(message) {
    return (message['mode'] === 'CW') || (message['mode'] === 'RTTY');
};

SkimmerMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table width="100%">' +
            '<thead><tr>' +
                '<th class="freq">Freq</th>' +
                '<th class="text">Text</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

SkimmerMessagePanel.prototype.renderLine = function(data) {
    return(
        '<td class="freq">' +
            '<span class="db" style="width:0%;">&nbsp;</span>' +
            '<span>&nbsp;</span>' +
        '</td>' +
        '<td class="text">&nbsp;</td>'
    );
};

SkimmerMessagePanel.prototype.pushMessage = function(msg) {
    // Must have some text
    if (!msg.text) return;

    // Clear cache if requested
//    if (msg.changed) this.texts = [];

    // Current time and SnR
    var now = Date.now();
    var snr = msg.db || 0;

    // Skimmer table body
    var body = $(this.el).find('tbody')[0];

    // No need to recolor yet
    var needRecolor = this.texts.length;

    // Modify or add a new entry
    var j = this.texts.findIndex(function(x) { return x.freq >= msg.freq });
    if (j < 0) {
        // Append a new entry
        if (msg.text.trim().length > 0) {
            this.texts.push({ freq: msg.freq, text: msg.text, db: snr, ts: now });
            j = this.texts.length - 1;
            body.insertRow(j).innerHTML = this.renderLine(this.texts[j]);
            needRecolor = j;
        } else {
            return;
        }
    } else if (this.texts[j].freq == msg.freq) {
        // Update existing entry
        this.texts[j].text = (this.texts[j].text + msg.text).slice(-64);
        this.texts[j].db   = snr;
        this.texts[j].ts   = now;
    } else {
        // Insert a new entry
        if (msg.text.trim().length > 0) {
            this.texts.splice(j, 0, { freq: msg.freq, text: msg.text, db: snr, ts: now });
            body.insertRow(j).innerHTML = this.renderLine(this.texts[j]);
            needRecolor = j;
        } else {
            return;
        }
    }

    // Update row contents
    var f = Math.floor(this.texts[j].freq / 100.0) / 10.0;
    var d = Math.floor(Math.max(0, Math.min(100, 100.0 * this.texts[j].db / 30.0)));
    body.rows[j].cells[0].children[0].style.width = '' + d + '%';
    body.rows[j].cells[0].children[1].textContent = f.toFixed(1);
    body.rows[j].cells[1].textContent = this.texts[j].text;

    // Remove stale rows, recolor as needed
    for (var j = 0 ; j < this.texts.length ; j++) {
        // Limit the lifetime of entries depending on their length
        var cutoff = 5000 * this.texts[j].text.length;
        if (now - this.texts[j].ts >= cutoff) {
            body.deleteRow(j);
            needRecolor = j;
            this.texts.splice(j--, 1);
        } else if (j >= needRecolor) {
            body.rows[j].style = 'color:black;background-color:' + (j&1? '#E0FFE0':'#FFFFFF') + ';';
        }
    }
};

$.fn.skimmerMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new SkimmerMessagePanel(this));
    }
    return this.data('panel');
};

MeshtasticMessagePanel = function(el) {
    MessagePanel.call(this, el);
    this.initClearTimer();
}

MeshtasticMessagePanel.prototype = Object.create(MessagePanel.prototype);

MeshtasticMessagePanel.prototype.supportsMessage = function(message) {
    return message['mode'] === 'Meshtastic';
};

MeshtasticMessagePanel.prototype.render = function() {
    $(this.el).append($(
        '<table>' +
            '<thead><tr>' +
                '<th class="timestamp">Time</th>' +
                '<th class="src">From</th>' +
                '<th class="dst">To</th>' +
                '<th class="data">Data</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
        '</table>'
    ));
};

MeshtasticMessagePanel.prototype.makeAddr = function(addr) {
  return '!' + ('0000000' + addr.toString(16)).slice(-8);
};

MeshtasticMessagePanel.prototype.formatAttr = function(data, key, prefix = '') {
    var v = data[key];

    // If value is a dictionary, iterate over its contents
    if ((typeof(v) === 'object') && (Object.getPrototypeOf(v) === Object.prototype)) {
        var result = '';
        // prefix += key + '.';
        for (var key in v) {
            result += this.formatAttr(v, key, prefix);
        }
        return(result);
    }

    // Perform conversions
    switch (key) {
    case 'time':
    case 'timestamp':
        v = (new Date(v * 1000)).toUTCString();
        break;
    case 'latitude_i':
    case 'longitude_i':
        v = v / 10000000.0;
        break;
    case 'voltage':
    case 'ch1_voltage':
    case 'ch2_voltage':
        v = v.toFixed(2) + ' V';
        break;
    case 'ch1_current':
    case 'ch2_current':
        v = v.toFixed(3) + ' A';
        break;
    case 'battery_level':
    case 'channel_utilization':
    case 'air_util_tx':
    case 'relative_humidity':
        v = v.toFixed(0) + ' %';
        break;
    case 'temperature':
        v = v.toFixed(1) + ' &deg;C';
        break;
    case 'barometric_pressure':
        v = v.toFixed(1) + ' hPa';
        break;
    case 'macaddr':
        v = atob(v).split('').map(function(c) {
            return ('0' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('').toUpperCase();
        break;
    }

    // Output regular values as they are
    return('<tr><td colspan="4">' +
        '<div style="border-bottom:1px dotted;">' +
        '<span style="float:left;">' + Utils.htmlEscape(prefix + key) + '</span>' +
        '<span style="float:right;word-break:break-all;">' + Utils.htmlEscape(v) + '</span>' +
        '</div></td></tr>'
    );
};

MeshtasticMessagePanel.prototype.pushMessage = function(msg) {
    var bcolor = safeMessageColor(msg.color, '#000');
    var fcolor = bcolor === '#000' ? '#FFF' : '#000';
    var tstamp = msg.timestamp? Utils.HHMMSS(msg.timestamp) : '';
    var text   = msg.type || msg.longName || msg.comment || '';
    var id     = this.makeAddr(msg.src);
    var src    = Utils.linkToMap(id, msg.nickName || id);
    var dst    = msg.dst == 0xFFFFFFFF? 'ALL'
               : Utils.htmlEscape(msg.dstNickName || this.makeAddr(msg.dst));

    // Append report
    var $b = $(this.el).find('tbody');
    $b.append($(
        '<tr>' +
            '<td class="timestamp">' + tstamp + '</td>' +
            '<td class="src">' + src + '</td>' +
            '<td class="dst">' + dst + '</td>' +
            '<td class="data" style="text-align:left;">' + Utils.htmlEscape(text) + '</td>' +
        '</tr>'
    ).css('background-color', bcolor).css('color', fcolor));

    // Append message
    if (msg.message) {
        $b.append($(
            '<tr>' +
                '<td colspan="4">' + Utils.htmlEscape(msg.message) + '</td>' +
            '</tr>'
        ));
    }

    // Append data
    if (msg.data) {
        for (var key in msg.data) {
            $b.append($(this.formatAttr(msg.data, key)));
        }
    }

    // Jump list to the last received message
    this.scrollToBottom();
};

$.fn.meshtasticMessagePanel = function() {
    if (!this.data('panel')) {
        this.data('panel', new MeshtasticMessagePanel(this));
    }
    return this.data('panel');
};
