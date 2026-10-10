# Waterfall-first receiver workspace

Implemented locally on 2026-10-10. The spectrum, frequency scale, and waterfall
fill the viewport below a compact receiver header. Controls no longer occupy
multiple full-width rows above the display.

- **Receiver:** source/profile, frequency, mode, audio/recording, receiver health,
  signal strength, and expandable RF controls (tuning step, squelch, noise reduction).
  Collapse the card using its title or the header's Receiver action.
- **Display:** zoom, levels, waterfall palette, and spectrum visibility.
- **Preferences:** appearance and pointer/gesture settings.
- **Saved stations:** existing browser-local frequency/mode presets. Storage
  keys and profile scoping are retained.
- **History:** browser-local reception search and management.
- **Activity:** Data2G messages, frames, and channel activity.
- **Tools:** dual tuner and separate-window actions.
- **Clear view:** collapses cards and hides the legacy decoder/chat/status overlays.
  Open Receiver or a supporting card to bring those overlays back.

Supporting cards open above the bottom dock, one at a time, with bounded scrolling.
Escape closes RF controls first, otherwise the supporting card, and returns focus
to its opener. Narrow screens use two rows of dock controls and a bounded receiver
card. Dual receivers retain independent iframe streams, each with its own display
and cards. Spectrum is enabled for fresh browser settings; saved visibility is
honored.

`frontend/receiver-modern/src/workspace.ts` relocates the existing legacy DOM
controls without cloning them. The demodulator root and squelch remain together
for scanner and keyboard handling. Source/profile and waterfall controls retain
their IDs and existing handlers. Relocations are reversed on component teardown.

Validation: Svelte type checking and Vite build; receiver adapter smoke checks
using the actual legacy receiver markup; card collapse, exclusive support cards,
Escape, tuning/audio/recording, saved stations/history/Data2G, dual receiver and
separate window behavior; existing receiver event, demodulator factory, and
recording/profile checks. No connected browser was available for rendered
layout inspection. Live SDR/audio/RF behavior and deployment are not verified.
