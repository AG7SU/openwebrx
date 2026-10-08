# Receiver history

The modern receiver keeps a searchable history of completed decoder outputs in
the current browser's local storage. Each entry records the receive time,
frequency when available, decoder mode, receiver profile, and bounded decoded
content. The panel searches those fields and can clear the stored history.
Same-origin receiver panes refresh from browser storage events, so dual-tuner
sessions share the same browser-local list.

History is local to the browser profile and OpenWebRX origin; it is not sent to
the server or synchronized with other clients. The UI keeps at most 500 entries
and 2,048 characters of content per entry. Older entries are discarded when
the limit is reached. Browser storage limits still apply; if storage is full,
new receptions remain visible for the current page but may not persist after it
closes. Use **Clear history** on shared devices when appropriate.

The receiver only records decoded output events, not channel activity or
incomplete Data2G bursts. Data2G's separate activity panel continues to show
busy/idle and burst-state events. History content is rendered as text, never as
HTML.
