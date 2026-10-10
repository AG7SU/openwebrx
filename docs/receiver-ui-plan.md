# Receiver UI polish and UX plan

Date: 2026-10-09
Status: proposed; based on current source inspection. Rendered desktop/mobile
and deployed receiver behavior have not been reviewed for this plan.

## Product direction

Make the receiver feel like a well-designed radio instrument: prominent tuning,
immediate audio control, a generous waterfall, and quiet supporting tools.
The primary journey is choose receiver → start listening → tune → adjust mode
and bandwidth → save or inspect a reception.

## Findings in the current implementation

- `ReceiverIsland.svelte` puts identity, bookmark, dual tuner, separate window,
  and RF controls in one grid column. Those actions inflate the main control area.
- Mode selection precedes frequency in the markup. Audio occupies a subsequent
  row, separated from the core tuning interaction.
- The desktop grid has 870px of minimum column widths before gaps and padding,
  but its mobile breakpoint starts at 760px. Intermediate widths need attention.
- Several controls and feedback messages use 10–11px type. Buttons have similar
  visual emphasis, while status occupies a substantial part of the main grid.
- Mode selection uses a native datalist plus a separate Set mode action.
  Availability explanations need predictable presentation across browsers.
- Saved layouts contain only frequency and modulation, scoped to a profile.
  They overlap conceptually with bookmarks and should be called tuning presets.
- History and Data2G activity live inside the control section above the waterfall.
  Expanding supporting content can push the listening surface down the page.
- Modern component styles and legacy panel styles both participate in the page.
  Polish requires shared visual rules across that boundary.

## Proposed layout

Desktop reading order:

1. Compact header: receiver/profile selector, concise connection status, tools.
2. Listening bar: prominent frequency and step controls, mode, bandwidth,
   start/mute, volume, bookmark. Secondary recording action remains accessible.
3. Waterfall toolbar: zoom, fit spectrum, automatic levels, display options.
4. Spectrum and waterfall: the largest continuous area of the initial viewport.
5. Supporting workspace: tabs for decoded activity, history, and saved stations.
   RF controls open in a side panel with an explicit close action.

On phones, use two compact control rows and a full-width waterfall. Place
secondary tools in a sheet. Keep frequency and mute accessible when inspecting
results, and account for the on-screen keyboard and safe areas. At intermediate
widths, wrap deliberately rather than shrinking labels or overflowing.

## Delivery order

### 1. Hierarchy and responsive foundation — highest priority

- Reorganize the listening bar around frequency, mode, and audio.
- Move separate window and dual-view launch into a receiver tools menu.
- Move history and presets below the waterfall; preserve their saved data.
- Keep receiver/profile selection discoverable in the header.
- Introduce shared spacing, typography, surface, border, radius, and focus tokens.
- Use neutral charcoal surfaces, restrained cyan for selection/focus, amber for
  actionable warnings, and red for faults or active recording.
- Use readable 14–16px control text, tabular frequency digits, consistent 44px
  touch targets, and clear primary/secondary/quiet button treatments.
- Add layout transitions driven by available space, including the current
  760–1000px gap. Avoid permanent floating panels covering tuning targets.

Acceptance: at 390×844, 768×1024, 1024×768, and 1440×900, frequency, mode,
audio control, and a useful waterfall area are visible without opening a panel;
there is no page-level horizontal overflow. Target at least half of the desktop
viewport for spectrum/waterfall in the default listening view, then validate
against real receiver content.

### 2. Tuning and listening interactions

- Make frequency editing explicit: visible unit, Enter to tune, Escape to cancel,
  inline validation, and no overwrite while the user is typing.
- Show and allow selection of the tuning step beside the nudge controls.
- Keep wheel tuning scoped to an intentional tuning target; page scrolling must
  not accidentally retune the receiver.
- Replace the mode datalist with an accessible searchable picker. Group analog
  and digital modes, explain unavailable modes, and apply an explicit selection
  immediately. Free text alone must not change the receiver mode.
- Expose bandwidth near mode when applicable, with advanced filter controls in
  RF controls. Extend the typed bridge where current APIs are insufficient.
- Provide a clear Start audio action for browser playback gating. Distinguish
  muted, waiting for stream, and playback blocked states.
- Show active recording persistently, with elapsed time and a clear stop action;
  confirm file handoff using actual recorder state.
- Make waterfall hover/touch tuning feedback and passband selection legible.
  Offer a visible equivalent for any essential gesture or keyboard shortcut.

Acceptance: a new listener can start audio, tune, change mode, adjust volume,
and save a station without opening advanced tools. Keyboard navigation completes
the same flow without focus loss or accidental tuning.

### 3. Feedback and recovery

- Collapse healthy diagnostics into one concise listening status. Expand details
  on demand; keep actionable faults visible beside the affected control.
- Model connecting, connected, audio blocked, muted, source unavailable,
  reconnecting, and decoder failure separately. Never infer audio success solely
  from a connected socket.
- Preserve user edits and tuning intent during reconnects; show when controls
  cannot act and reconcile displayed values with actual receiver state.
- Use transient confirmations for successful saves and persistent inline errors
  for failures. Reserve space where needed to prevent layout jumps.
- Keep Data2G listening/activity/incomplete burst/decoded message states distinct.
  Put raw KISS payloads and worker diagnostics behind Details.
- Avoid alarming permanent sample-drop totals in the main bar; use recent health
  evidence when available and keep cumulative counts in diagnostics.
- Add visible focus states, text alongside status colors, reduced-motion support,
  and controlled live-region announcements that do not read every decode.

Acceptance: each failure state explains what happened and offers an appropriate
next action. Focus stays predictable when menus and panels open or close.

### 4. Saved stations, decoding, and dual receivers

- Rename Saved layouts to Tuning presets immediately. Then design one Saved
  stations surface for bookmarks and presets, retaining origin/profile metadata
  and existing storage compatibility until an explicit migration is implemented.
- Show station name, frequency, mode, and a direct Tune action. Surface successful
  saves without requiring the user to open another panel.
- Make decoder output easy to scan using consistent timestamps, callsigns, and
  message spacing. Add pause-follow and a new-items indicator when reading older
  output; do not force-scroll the reader back to the latest message.
- Distinguish empty history from no search results. Explain browser-local storage.
  Confirm destructive clearing or provide a genuine recoverable undo.
- Give dual receivers explicit A/B identity, source, frequency, and audio state.
  Default the newly opened pane to muted and make simultaneous audio intentional.
  Verify actual source independence and resource errors through existing bridge
  and iframe boundaries before claiming independent hardware operation.
- On mobile, present A/B as switchable panes with persistent audio indicators.

Acceptance: saving and recalling a station is obvious, incoming messages do not
disrupt reading, and users can tell which tuner they are hearing at all times.

## Implementation boundaries

Split `ReceiverIsland.svelte` into focused components for the listening bar,
status, waterfall toolbar, saved stations, reception workspace, and receiver
tools as those areas change. Use `receiver-bridge.ts` for receiver actions and
state; expand that contract for new capabilities. Share tokens with
`htdocs/css/receiver-modern.css`, and preserve legacy panel behavior while
adapting its appearance. Keep generated `htdocs/modern/receiver-ui.js` and CSS
synchronized with source when implementation is built.

Deliver in four reviewable slices matching the order above. The first slice
should establish the full default desktop and phone composition before adding
new interactions. Defer extra themes, decorative motion, and customizable panel
layouts until this primary workflow is sound.

## Verification during implementation

- Capture the existing rendered receiver at desktop, tablet, and phone sizes.
  Compare the same states after each relevant slice.
- Run frontend type/build checks and targeted browser checks for changed flows.
- Exercise long profile names, unavailable modes, no source, playback gating,
  connection loss, decoder errors, empty/populated history, and open RF controls.
- Check keyboard-only use, focus return, 200% zoom, contrast, touch targets, and
  mobile keyboard behavior. Verify the deployed bundle matches the reviewed build.
- Compare waterfall responsiveness and audio interruptions before/after on the
  same receiver. Avoid rerendering the whole control area for every activity event.
- Validate actual tuning, audio, recording download, decoding, and dual-source
  behavior on the live receiver. Static/browser fixtures alone do not establish
  SDR or RF behavior.
