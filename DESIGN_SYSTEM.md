# JARVIS UI/UX Blueprint

## Art direction

**Design language:** Cinematic personal AI command center, not a ChatGPT clone. A deep-black midnight-blue environment; controlled cyan ionized light; narrow violet accents; restrained amber highlights. Futuristic, readable, and welcoming rather than noisy.

### Visual system

| Token | Value | Use |
|---|---|---|
| Background | `#060b14` | Dark, distraction-free canvas |
| Sidebar | `#070c15` | Navigation depth separation |
| Panel | `#101a2a` | Elevated surfaces |
| Luminous cyan | `#53d9ff` | Neural link, focus, core visual |
| Luminous violet | `#8f80ff` | Accents on animated 3D ring geometry |
| Warm spark | `#fdc480` | Energy accents and visual contrast |
| Positive | `#6ee4bc` | Active connection indicator |
| Alert | `#ff818c` | Errors and destructive actions |
| Main text | `#ecf5ff` | Legible high-contrast typography |
| Muted text | `#8293a9` | Secondary details |

**Typography:** Outfit headings; DM Sans body; Space Mono for technical metadata. Automatic fallbacks are provided if external font downloads are blocked.

**Depth and material:** Semi-transparent glass-like overlays, 1px translucent borders, subtle dark blue gradients, bloom around the core and gentle HUD lines. Do not overuse neon on information text.

## Animated neural core

The scene uses an original dependency-free Canvas renderer that computes 3D points, rotations and a perspective projection. It's animated geometry rather than a static image. Components:

1. **Central plasma sphere**: radial optical gradient, breathing scale and luminous edge.
2. **Geodesic shell**: wireframe latitude/longitude surface rotating in 3D.
3. **Four orbital trajectories**: continuous animated 3D rings, each with its own speed and tilt.
4. **Particle field**: slowly pulsing photonic dots.
5. **Outer telemetry**: circular scan arc, ticks, axis crosshairs and energy markers.
6. **Mode changes**: idle, listening, thinking and speaking use different energy pulse timing.
7. **Mouse parallax**: pointer position affects orbital geometry tilt.
8. **Reduced motion**: disables active rendering if the user opts out in settings.

The original generated WebP assets form a cinematic depth layer behind the procedural animation. The UI doesn't depend on the image for motion.

## Primary screens

**Home/standby**: neural core, standby telemetry, personalized assistant welcome, three prompt suggestions, fixed chat composer. The core is the visual focal point.

**Conversation**: ChatGPT-style thread, compact user messages, assistant answers with formatted text and source references, copy/listen controls, sticky composer.

**Sidebar**: logo, new conversation, search, voice session shortcut, locally saved chat history grouped by date, pin/rename/delete, user settings and connection status.

**Voice screen**: full-viewport neural projection, mode label, transcription, listening/hang-up controls, browser speech recognition and text-to-speech. This is a voice interface prototype, not streaming telephony.

**Settings panel**: animation preferences, speech playback, research defaults, export/import/delete browser history, secure backend configuration status and lock action.

**Mobile**: condensed top bar, slide-out sidebar, adaptive orb scale, two-column suggestion buttons, compact sticky composer, full-screen voice experience.

## Interaction rules

- The `+` icon opens files and research tools.
- `Enter` sends, `Shift+Enter` adds a line break.
- The mic transcribes speech into the composer, subject to browser availability.
- The headset launches a voice conversation screen.
- The Send button is disabled during an outstanding request.
- Tool modes are saved in browser preferences and sent to the secure API proxy with each request.
- Chat titles are inferred from the first question and can be edited later.
- All chat data can be exported or imported by the owner.
- No false source links or made-up live research responses are shown in demo mode.
- Secret API keys must remain on the server, never in browser JavaScript.

## State and motion

| Mode | Visual behavior |
|---|---|
| Idle | Gentle breathing, slow orbital rotation |
| Listening | Faster cyan pulse and expanded active halo |
| Thinking | Deliberate scanning pulse |
| Speaking | Rapid violet/cyan breathing effect |
| Paused/reduced | Stationary procedural render |

## Current implementation vs planned capabilities

| Feature | This build | Later integration |
|---|---|---|
| Animated orbital 3D core | Working | WebGL shader and spatial audio refinement |
| Responsive sidebar | Working | Cross-device account sync |
| Local history | Working | Encrypted server database and search index |
| Prompt composer | Working | Streaming partial tokens |
| Research modes and effort | UI + request payload | n8n-aware tool policy and workflows |
| Text files | Extracted and forwarded | Vector documents / RAG indexing |
| Images and PDFs | Attach/preview only | Vision/PDF extraction |
| Voice | Browser speech prototype | Low-latency real-time bidirectional model |
| Phone calling | Not included | Authenticated telephony API with safeguards |
| Personal identity | Owner passcode with signed HttpOnly cookie | Passwordless/email multi-device account |
| n8n response | Proxy written; not connected to working agent yet | Fix model rate limit and publish webhook |

## Suggested next iteration

- **Phase 1 (current):** Test UI with demo, fix n8n workflow with teacher, publish production webhook, set backend secrets and connect live responses.
- **Phase 2:** Permanent chat history using authenticated database, synchronization across laptop and mobile, file/image analysis and source citation renderer.
- **Phase 3:** Higher fidelity Three.js/WebGL shader orb with GPU particle system, listening/voice state transitions and voice latency improvements.
- **Phase 4:** App connections like Gmail, Calendar and task automations with explicit approval for sending, deleting, financial or irreversible actions.

The chosen assistant name **JARVIS** is temporary and can be replaced consistently in UI strings, title and branding later. Avoid using copyrighted branding assets associated with existing fictional products.
