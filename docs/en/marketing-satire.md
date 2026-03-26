# Marketing Satire Edition — Design Document

[中文版](../zh/marketing-satire.md)

## Purpose

By creating an "over-marketed edition" that uses the **exact same audio engine** as the science edition — differing only in UI copy and visual style — users can switch with one click and viscerally feel how dramatically packaging and expectations alter perception of identical audio.

**Core satire: what you're paying premium prices for might just be a different label.**

## Edition Toggle

| Location | Button Text | Direction |
|----------|-----------|-----------|
| Science Edition | 🛒 See the Snake Oil Version | → Marketing |
| Marketing Edition | 📉 Downgrade to Soulless Version | → Science |

## Visual Contrast

| Dimension | Science Edition | Marketing Edition |
|-----------|----------------|-------------------|
| Background | Dark blue-gray `#0a0a1a` | Deep purple-black gradient (cosmic) |
| Accent color | Cool blue `#7eb8ff` | Gold/purple `#d4af37` / `#9b59b6` |
| Title | Binaural Beat Explorer Pro | NeuroTune™ Brain Wave Master |
| Subtitle | Objective description | "Awaken Your Brain's Hidden Potential" |
| Play button | ▶ Put on headphones, tap to start | ✨ Begin Your Awakening Journey |
| Volume label | Volume | Energy Intensity |
| Beat label | Beat Frequency | Brain Wave Tuning Frequency™ |
| Distribution | Symmetric etc. | Hemisphere Calibration™ etc. |
| Info panel | Physical bands + factual descriptions | "Brain waves syncing..." pseudo-science |

## Marketing Presets

| Freq | Science Name | Marketing Name |
|------|-------------|----------------|
| 2 Hz | Delta · Deep | 💎 Deep Repair · DNA Healing |
| 6 Hz | Theta · Meditate | 🔮 Pineal Activation · Third Eye |
| 10 Hz | Alpha · Relax | 🧘 Super Meditation · Cosmic Link |
| 18 Hz | Beta · Focus | 🧠 Genius Mode · IQ Boost |
| 30 Hz | Limit · Rough | ⚡ Ultimate Awakening · ESP |
| 42 Hz | Beyond · Compare | 🌟 Akashic Records · Higher Dimension |

## Marketing Band Descriptions

| Band | Marketing Copy |
|------|---------------|
| Delta 1-4 Hz | "Resonating with the universal source frequency, DNA helix receiving repair instructions..." |
| Theta 4-8 Hz | "Pineal gland activated, third eye opening, consciousness breaking through 3D limitations..." |
| Alpha 8-13 Hz | "Brain waves entering super-meditation state, harmonizing with 7.83 Hz Schumann resonance..." |
| Beta 13-30 Hz | "Neural synapses rapidly remodeling, IQ rising, genius brain wave pattern activated..." |
| Collapse 30-40 Hz | "Beyond conventional consciousness limits, ESP channel opening..." |
| Over >40 Hz | "Transcended human perception limits, higher-dimensional consciousness gateway opening..." |

## Marketing Mode Names

| Original | Marketing Name |
|----------|---------------|
| Pure Tone | 🌟 Pure Consciousness Wave |
| Music SSB | 🎵 Immersive Neuro-Music |
| Drone | 🕉 Cosmic Resonance Drone |

## Marketing Distribution Names

| Original | Marketing Name |
|----------|---------------|
| Symmetric | 🧠 Hemisphere Balance Calibration™ (recommended) |
| Right only | 🔮 Right-Brain Creativity Activation™ |
| Left only | 📐 Left-Brain Logic Enhancement™ |
| Alternating | 🔄 Whole-Brain Synergistic Resonance™ (master-recommended) |

## Marketing Status Panel

The info panel shows fabricated "real-time status" instead of physics:

```
🧠 Brain Wave Sync: 87.3%  ████████░░
✨ Pineal Activation: 92.1%
🔮 Consciousness Dimension: 5.2D
💫 Accumulated Energy: +2,847 photon units

⚡ Neural Calibration: Deep synchronization in progress...
📡 Receiving universal source frequency signal...
```

These numbers are randomly generated and have zero correlation with audio processing — that's the point.

## Implementation

- **Zero audio code changes** — AudioEngine, AudioWorklet, Web Worker completely untouched
- CSS theme via `body.marketing` class toggle
- Marketing copy as additional i18n packs (`zh-marketing.js` / `en-marketing.js`)
- Edition state in `localStorage('bb-edition')`
- URL param `?edition=marketing` for direct sharing
