# MQTT reporting and automations

OpenWebRX+ already includes an optional MQTT reporter for reception reports and
selected integrations. It can authenticate to a broker with a username and
password and can use TLS. The broker provides authentication and authorization;
the MQTT connection is disabled by default. Install the `python3-paho-mqtt`
package and restart OpenWebRX if the MQTT settings are unavailable.

## Configure the connection

In **Settings → Reporting → MQTT settings**:

1. Enable MQTT reporting and enter the broker hostname, with an optional port.
   The defaults are 1883 without TLS and 8883 with TLS; an explicit port takes
   precedence.
2. Set the broker username and password together. Configure **Use SSL** when the
   broker offers TLS with a certificate trusted by the receiver host.
3. Choose a topic root. The default is `openwebrx`.
4. Enable only the inbound integrations you use. Chat and aircraft, marine,
   APRS, WSJT, radiosonde, and Meshtastic subscriptions are independently
   selectable.

The reporter publishes JSON reception reports routed through the existing
`ReportingEngine`. Reports with a `mode` use `<topic-root>/<mode>`; other reports
use `<topic-root>`. MQTT's default publish QoS and retain settings are used, so
consumers should treat these as transient events rather than a durable history.
Only reports emitted by a decoder's reporting path are published; ordinary
browser-only decoder output is not automatically mirrored.

## Connect Node-RED, n8n, or Home Assistant

Create a separate, least-privilege broker account for OpenWebRX+. Give it publish
permission for the chosen topic root and only the subscription permissions
needed by enabled inbound integrations. Use another account for automation
consumers, restricted to subscribing to the required topic subtree. Require TLS
for connections crossing untrusted networks, and avoid anonymous/public brokers
for callsigns, decoded messages, client activity, or location-bearing reports.

In Node-RED, use an MQTT-in node for the topic root or a narrower mode topic. In
n8n, use an MQTT Trigger with the same topic filter. In Home Assistant, consume
the JSON topic through an MQTT sensor or automation. These integrations use the
broker's own credentials and ACLs; they do not require an OpenWebRX admin login.

The reporter also supports selected MQTT-to-OpenWebRX inputs. Keep those
settings disabled unless needed and restrict the OpenWebRX account's
subscriptions to the corresponding topics. MQTT broker authentication, topic
ACLs, and TLS behavior depend on the configured broker and should be verified
there after setup.

The Python Paho client uses system-trusted certificate authorities and requires
valid broker certificates when this integration enables `tls_set()`; see the
[Paho TLS API documentation](https://eclipse.dev/paho/files/paho.mqtt.python/html/client.html#tls_set).
