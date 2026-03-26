# Satire Edition Design Document (Marketing + Mystic)

[中文版](../zh/marketing-satire.md)

## Purpose

By creating an "over-marketed edition" that uses the **exact same audio engine** as the science edition — differing only in UI copy and visual style — users can switch with one click and viscerally feel how dramatically packaging and expectations alter perception of identical audio.

**Core satire: what you're paying premium prices for might just be a different label.**

## Edition Toggle

Three editions can freely switch between each other. Each edition shows two buttons pointing to the other two:

| Edition | Button 1 | Button 2 |
|---------|----------|----------|
| Science | 🛒 See the Snake Oil Version → Marketing | 🔮 See the Spiritual Guru Version → Mystic |
| Marketing | 🔮 Not Enough? Try the Blessed Version → Mystic | 📉 Downgrade to Soulless Version → Science |
| Mystic | 🛒 Downgrade to Unblessed Snake Oil → Marketing | 📉 Downgrade to Soulless Version → Science |

Direct links via URL params:
- Science: `?edition=science`
- Marketing: `?edition=marketing`
- Mystic: `?edition=mystic`

When accessed via `?edition` param, edition switch buttons are automatically hidden to let visitors focus on the current experience.

## Visual Contrast

| Dimension | Science Edition | Marketing Edition | Mystic Edition |
|-----------|----------------|-------------------|----------------|
| Background | Dark blue-gray `#0a0a1a` | Deep purple-black gradient (cosmic) | Deep amber/sandalwood gradient |
| Accent color | Cool blue `#7eb8ff` | Gold/purple `#d4af37` / `#9b59b6` | Amber orange `#ff9900` / `#daa520` |
| Title | Binaural Beat Explorer Pro | NeuroTune™ Brain Wave Master | Divine Frequency™ Awakening Portal |
| Subtitle | Objective description | "Awaken Your Brain's Hidden Potential" | "Connect to Source · Chakra Purification" |
| Play button | ▶ Put on headphones, tap to start | ✨ Begin Your Awakening Journey | 🙏 Namaste · Connect to Source |
| Volume label | Volume | Energy Intensity | Spiritual Power |
| Beat label | Beat Frequency | Brain Wave Tuning Frequency™ | Soul Body Vibration Frequency |
| Distribution | Symmetric etc. | Hemisphere Calibration™ etc. | ☢️ Yin-Yang Tai Chi / 7-Chakra etc. |
| Info panel | Physical bands + factual descriptions | "Brain waves syncing..." pseudo-science | "Kundalini rising along the spine..." spiritual guru |

## Presets

| Freq | Science Name | Marketing Name | Mystic Name |
|------|-------------|----------------|-------------|
| 2 Hz | Delta · Deep | 💎 Deep Repair · DNA Healing | 🙏 Root Chakra Cleanse · Grounding |
| 6 Hz | Theta · Meditate | 🔮 Pineal Activation · Third Eye | 👁 Third Eye Opening · Clairvoyance |
| 10 Hz | Alpha · Relax | 🧘 Super Meditation · Cosmic Link | 💜 Heart Chakra · Unconditional Love |
| 18 Hz | Beta · Focus | 🧠 Genius Mode · IQ Boost | 🌈 Light Body Activation · Ascension |
| 30 Hz | Limit · Rough | ⚡ Ultimate Awakening · ESP | ⚡ Kundalini Awakening · Atman-Brahman |
| 42 Hz | Beyond · Compare | 🌟 Akashic Records · Higher Dimension | 🕉 Akashic Access · Past-Life Recall |

## Band Descriptions

| Band | Marketing Copy | Mystic Copy |
|------|---------------|-------------|
| Delta 1-4 Hz | "...DNA helix receiving repair instructions..." | "Root chakra purifying, soul body connecting with Mother Gaia..." |
| Theta 4-8 Hz | "Pineal gland activated, third eye opening..." | "Third eye slowly opening, pineal gland releasing DMT..." |
| Alpha 8-13 Hz | "...harmonizing with 7.83 Hz Schumann resonance..." | "Heart chakra lotus blooming, universal unconditional love..." |
| Beta 13-30 Hz | "Neural synapses rapidly remodeling, IQ rising..." | "Soul vibration surging, DNA transforming to crystalline..." |
| Collapse 30-40 Hz | "Beyond conventional consciousness limits..." | "Kundalini fire serpent rising violently! Crown chakra opening!" |
| Over >40 Hz | "Transcended human perception limits..." | "Congratulations! If you see a white light tunnel, walk through bravely..." |

## Mode Names

| Original | Marketing Name | Mystic Name |
|----------|---------------|-------------|
| Pure Tone | 🌟 Pure Consciousness Wave | 🙏 Sacred Chant |
| Music SSB | 🎵 Immersive Neuro-Music | 🎵 Soul Sound Bath |
| Drone | 🕉 Cosmic Resonance Drone | 🕉 Om Mani Padme Hum |

## Distribution Names

| Original | Marketing Name | Mystic Name |
|----------|---------------|-------------|
| Symmetric | 🧠 Hemisphere Balance Calibration™ | ☢️ Yin-Yang Tai Chi — Dual Cultivation |
| Right only | 🔮 Right-Brain Creativity Activation™ | 👁 Third Eye Focus |
| Left only | 📐 Left-Brain Logic Enhancement™ | 💜 Heart Chakra Focus |
| Alternating | 🔄 Whole-Brain Synergistic Resonance™ | 🔄 Sequential 7-Chakra — Kundalini Rising |

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

## Mystic Status Panel

The mystic edition has a completely different set of fabricated metrics:

```
🙏 Chakra Activation: Level 5 · Throat  █████░░
👁 Third Eye Aperture: 73.2%
🌟 Astral Projection: 61.8%
🔮 Past-Life Fragments: 12 fragments
📡 Spirit Guide Signal: Transmitting
☸️ Karma Purification: 82.5%

🕉 Kundalini energy rising along the spine...
```

## Implementation

- **Zero audio code changes** — AudioEngine, AudioWorklet, Web Worker completely untouched
- CSS theme via `body.marketing` / `body.mystic` class toggle
- Copy as additional i18n packs (`zh-marketing.js` / `en-marketing.js` / `zh-mystic.js` / `en-mystic.js`)
- Edition state in `localStorage('bb-edition')`
- URL param `?edition=marketing` or `?edition=mystic` for direct sharing
- Edition switch buttons auto-hidden when accessed via URL param
