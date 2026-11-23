---
name: HydroTelemetry Precision Interface
colors:
  surface: '#101319'
  surface-dim: '#101319'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e13'
  surface-container-low: '#191c21'
  surface-container: '#1d2025'
  surface-container-high: '#272a30'
  surface-container-highest: '#32353b'
  on-surface: '#e1e2ea'
  on-surface-variant: '#bfc7d5'
  inverse-surface: '#e1e2ea'
  inverse-on-surface: '#2d3036'
  outline: '#89919e'
  outline-variant: '#3f4753'
  surface-tint: '#9fcaff'
  primary: '#9fcaff'
  on-primary: '#003259'
  primary-container: '#0099ff'
  on-primary-container: '#002f54'
  inverse-primary: '#0061a5'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#00e475'
  on-tertiary: '#003918'
  tertiary-container: '#00ac57'
  on-tertiary-container: '#003617'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#9fcaff'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#00497e'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#62ff96'
  tertiary-fixed-dim: '#00e475'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#101319'
  on-background: '#e1e2ea'
  surface-variant: '#32353b'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  metric-display-lg:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  metric-display-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  metric-display-md:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system serves mission-critical Industrial IoT (IIoT) infrastructure, SCADA systems, and municipal/industrial smart water utility monitoring. The interface prioritizes rapid situational awareness, absolute visual legibility under stressful operational conditions, and unequivocal telemetry verification.

The visual direction combines **Technical Precision Minimalism** with **Instrument-Grade High-Contrast Functionalism**. It avoids superficial visual decoration in favor of hyper-legible status indicators, distinct information density layers, and physical instrumentation metaphors reinterpreted through modern digital execution. 

Key attributes:
- **Operability First:** High visual signal-to-noise ratio where telemetry deltas, critical flow rates, and active faults surface instantly.
- **Architectural Rigor:** Strict grid alignment, compact padding, and sharp boundaries mirroring physical control panels and DIN-rail diagnostic terminals.
- **Instrument-grade Typography:** Monospaced data tags and tabulated metrics preventing layout shifting during sub-second telemetry streams.

## Colors

The system uses an engineered deep-slate dark palette (`#080B10`) as the foundational canvas to reduce retinal fatigue during extended shift work and maximize the luminescence of optical indicators.

### Functional Telemetry & State Palette:
- **Primary Telemetry (`#0099FF`)**: Electric Blue representing bulk volumetric telemetry, nominal reservoir levels, and baseline hydraulic flow.
- **Secondary Telemetry (`#00E5FF`)**: High-luminance Clean Cyan representing sensor interrogation, target thresholds, and dynamic flow gradients.
- **Operational / Normal (`#00E676`)**: High-visibility Emerald Green reserved strictly for active mechanical states: pump energization, open valves, and nominal flow continuity.
- **Advisory / Warning (`#FFB300`)**: Industrial Amber signifying cautionary operational bounds, mid-level reservoirs, or flow rate throttles.
- **Fault / Critical (`#FF1744`)**: High-contrast Crimson Red reserved exclusively for emergency pump trip, pipe pressure failure, contamination flags, and critical overflow thresholds.

### Surface Tiers:
- **Canvas Base:** `#080B10`
- **Surface Level 1 (Card/Panel Container):** `#0E131F`
- **Surface Level 2 (Elevated Display/Well):** `#141C2E`
- **Border / Metric Division:** `#1F2C45` with active accent overlays at 40% opacity.
- **Text & Telemetry Neutral:** `#F0F4F8` (Primary Metric), `#8FA0B8` (Secondary Label), `#4B5D78` (Static Structural Key).

## Typography

The type hierarchy employs a three-tier specialization:
1. **Space Grotesk** serves structural dashboard titles, node identification, and panel headers, providing modern architectural character without reducing readability.
2. **Inter** manages descriptive context, diagnostic logs, instructions, and continuous body text for rapid scanning.
3. **JetBrains Mono** governs all dynamic operational readouts, flow metrics (m³/h, PSI, bar, pH), timestamps, hexadecimal register tags, and status chips.

All dynamic values must use tabular numerals (`font-variant-numeric: tabular-nums`) to eradicate UI vibration during high-frequency telemetry updates. Uppercase tracking is applied universally to `label-xs` tokens to replicate physical industrial dial and chassis markings.

## Layout & Spacing

The layout philosophy follows a dense, technical **12-column fluid grid** system optimized for desktop monitoring centers, SCADA touch displays, and handheld site-inspection tablets.

- **Breakpoints:**
  - **Desktop (1440px and above):** 12-column grid, `gutter-desktop` (1.5rem / 24px), outer canvas `margin-desktop` (2rem / 32px).
  - **Field Tablet (768px – 1439px):** 8-column layout, `gutter` (1rem / 16px), outer margin `margin` (1rem / 16px).
  - **Handheld Inspection (below 768px):** 4-column layout; multi-node panels collapse into stacked sensor units. Outer margin: `1rem`.

Component padding is restrained to maintain maximum viewport efficiency:
- Sensor readouts and telemetry cards enforce strict vertical alignment with internal padding driven by `space-md` (12px) and card separation driven by `gutter`.
- Data streams avoid negative or excessive space; informational density remains high, prioritizing visibility over decorative breathing room.

## Elevation & Depth

This design system avoids soft, decorative drop shadows. Depth and visual hierarchy are communicated strictly through **Tonal Surface Layering** and **Technical Optical Borders**:

- **Level 0 (Chassis Ground):** `#080B10` canvas.
- **Level 1 (Telemetry Cards & Gauges):** `#0E131F` with a crisp 1px perimeter border of `#1F2C45`.
- **Level 2 (Active Monitors & Nested Visualizers):** `#141C2E` inset with a 1px border.
- **Optical Luminescence (State Accent Glows):** Instead of ambient drop shadows, active operational components use focused, localized glow strokes:
  - Nominal running pump: `0 0 12px rgba(0, 230, 118, 0.15)` coupled with a 1px `#00E676` border.
  - Critical fault alert: `0 0 16px rgba(255, 23, 68, 0.25)` coupled with a 1px `#FF1744` border.
- **Z-Index Layering:** Modals, manual override drawers, and diagnostic inspector sheets float on Level 3 (`#1A243B`) with a hard 1px outline of `#2D4063`.

## Shapes

The interface employs a **Soft Technical Precision (`roundedness: 1`)** shape language:
- Standard cards, module containers, chart regions, and action controls carry a precise `0.25rem` (4px) corner radius.
- Embedded telemetry wells, metric pill tags, and register indicators use `0.125rem` (2px) or `0.25rem` (4px).
- Large operational modal overlays use `0.5rem` (8px).

This controlled curvature prevents the UI from appearing brutal or unstyled, while deliberately steering clear of consumer-style circularity that reduces screen area on data-dense consoles.

## Components

### Telemetry Cards & Vessel Gauges
- **Structure:** Surface Level 1 (`#0E131F`), 1px `#1F2C45` border, `space-md` internal padding.
- **Header:** Features station/sensor ID in `label-xs` uppercase (`#8FA0B8`) accompanied by a real-time heartbeat dot indicator.
- **Readout:** Displays primary metric in `metric-display-lg` with engineering unit appended in `code-sm` (`#00E5FF`).
- **Water Level Gauge:** Vertical pill bar or segmented graduated reservoir displaying electric blue (`#0099FF`) fill with a high-luminance cyan (`#00E5FF`) meniscus indicator line.

### Status Badges & Hardware Indicators
- **Structure:** Inline containers with 2px corner radius, height 20px, horizontal padding `space-xs`.
- **Active / Running:** `#00E676` background at 12% opacity, 1px border of `#00E676`, text in `label-xs` with a solid 6px pulsing green beacon.
- **Advisory / Mid-Level:** `#FFB300` background at 12% opacity, 1px border of `#FFB300`.
- **Fault / Stop:** `#FF1744` background at 16% opacity, 1px border of `#FF1744`, text in `label-xs` high-contrast crimson.

### Buttons & Industrial Actuators
- **Primary Operational Action:** Solid `#0099FF`, text `#080B10` in `JetBrains Mono` weight 600. Hover state introduces `#00E5FF` fill; active state shifts to inset compression.
- **Emergency / Isolation Switch (Stop Pump):** Solid `#FF1744` with high-contrast `#FFFFFF` label. Surrounded by a 2px offset border for unmistakable affordance.
- **Secondary / Calibration Button:** Ghost button with `#141C2E` background, 1px border of `#1F2C45`, text `#F0F4F8`.

### Input Fields & Setpoint Controllers
- **Structure:** Level 2 surface (`#141C2E`), 1px `#1F2C45` border, height 36px.
- **Text:** `code-sm` for values. Focus state replaces border with `#00E5FF` and a 1px glow ring.
- **Stepper Overrides:** Segmented `+` and `-` actuators integrated on the right flank, providing immediate physical-like increment feedback.

### Real-Time Activity Charts & Trend Visualizers
- **Background:** Inset `#0B0F17` grid with `#162033` Cartesian reference markers at 20px intervals.
- **Data Series:** 2px high-luminance continuous stroke lines (`#00E5FF` for dynamic pressure, `#0099FF` for volume flow). Minimal vertical gradients underneath series lines with 15% opacity to 0% fade.
- **Crosshairs:** 1px dashed `#8FA0B8` snapping line with dynamic floating tag showing localized timestamp and reading in `code-sm`.

### Checkboxes, Toggles & Solenoid Switches
- **Switches:** 32px × 18px enclosure. Active state changes handle track to `#00E676` (running) or `#0099FF` (enabled), inactive track sits at `#1F2C45`. Handle is a sharp 14px square pill with 2px radius.
- **Data Selection Checkboxes:** 16px × 16px square, Level 2 background, 1px `#1F2C45` border. Checked state renders a crisp check glyph in `#00E5FF`.