# RSPduo dual-tuner support

## Current finding

OpenWebRX+ identifies SDRplay devices as including the RSPduo, but the
SDRplay-specific device description inherited the generic Soapy channel count
of one. The receiver connector selects one Soapy channel for each source. The
application can host multiple SDR sources, so the intended path for two
independently tuned receivers is two source entries, one for each RSPduo tuner.

The SDRplay device form now offers an RSPduo operating mode and tuner/input.
`Master` / `Master at 8 MHz` configure the first source; `Slave` configures a
second source. Tuner selections become the SoapySDRPlay3 antenna argument, and
the selected operating mode becomes the device query's `mode` value. Automatic
mode remains the default and preserves any mode explicitly supplied in the
device identifier.

At application startup, OpenWebRX initializes always-on SDRplay Master sources
before Slave sources even when the saved source entries are in the opposite
order. The configured source/profile order remains unchanged. For changes made
while the application is running, stop or remove the Slave first, then the
Master; start the Master before the Slave. The maintained [SoapySDRPlay3 fork used
by this project's build script](https://github.com/luarvique/SoapySDRPlay3) maps
the `MA`, `MA8`, and `SL` mode values and reports `StopPending` while a Slave
remains active ([mode selection](https://github.com/luarvique/SoapySDRPlay3/blob/master/Settings.cpp),
[stream shutdown](https://github.com/luarvique/SoapySDRPlay3/blob/master/Streaming.cpp)).
OpenWebRX now stops Slave sources before other sources during orderly global
shutdown. When changing or disabling the pair through settings, stop or remove
the Slave first, then the Master; start the Master before the Slave.

This exposes configuration only. It does not yet prove the two streams can run
concurrently through the installed SDRplay API and Soapy driver, or that the
web receiver can show and operate both tuners together. The native Soapy
`Dual Tuner` mode is also distinct: it supplies two channels in one Soapy device
and is generally used for same-frequency diversity. OpenWebRX+'s connector
currently consumes one channel per source, so this mode is not presented in the
new form as the two-independent-frequency solution.

`buildall.sh` now pins the `luarvique/SoapySDRPlay3` source to commit
`34d26b366d64968d48f2f032d6413ef8f69fb237`, with the existing ARM packaging
path pinned to `0641ead2bf082583d7f16a02ed59f855cf4fe6d7`. Both revisions map the
`ST`, `DT`, `MA`, `MA8`, and `SL` mode codes used by the settings. Deployments
that use a distribution-provided driver may have a different version; treat
non-automatic modes as RSPduo-only and verify that driver before enabling them.

## Configuration procedure to verify on hardware

1. Add the Master SDRplay source first, then add the Slave source with the same
   RSPduo serial number.
2. Set the first to `Master` (or `Master at 8 MHz`) and select tuner 1.
3. Set the second to `Slave` and select tuner 2.
4. Enable both sources and keep both running while the pair is active.
5. Verify independent center-frequency control, IQ/audio continuity, and
   simultaneous clients on both profiles.
6. Stop the Slave, then the Master; restart the Master, then the Slave. Confirm
   a failed or stopped tuner does not leave the SDRplay API service or the other
   receiver unusable.

## Software-only multi-client check

Once both source entries are configured and enabled, OpenWebRX+'s websocket
profile list identifies a profile as `source-id|profile-id`. Open that profile
in one browser session, then select the other source's profile in a second
session. Each websocket connection retains its selected source/profile, so this
is a useful way to exercise the existing per-client tuning and audio paths
before the dedicated side-by-side receiver interface exists. Confirm the two
sessions can tune independently and that disconnecting one does not change the
other session's selected profile. This checks application behavior only; it
does not establish that a specific SDRplay API/driver combination can stream
both tuners concurrently.

The modern receiver now offers a `Dual tuner view` when another source is
available. It creates a same-origin receiver pane in the current page and
selects a profile from a different source ID, so two profiles from one tuner
cannot be mistaken for the two-tuner setup. Each pane owns an independent
websocket, waterfall, tuning state, mode, and audio controls. The second pane
can be removed to release its receiver connection. On narrow screens, the panes
stack vertically. This uses the existing per-client source/profile contract;
the two-source hardware lifecycle and real simultaneous audio still need
verification.

`Open separate window` remains available for independent sessions outside the
combined view. The second-window launcher uses the same different-source
selection rule. If only one enabled source is configured, configure the
second RSPduo tuner as a separate source entry first.

Do not mark the RSPduo track complete until both sources are observed running
simultaneously on the target hardware and their frequencies can be changed
independently. Verify diversity mode separately if it becomes a product goal.
