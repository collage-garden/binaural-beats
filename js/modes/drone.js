import { BaseMode } from './base-mode.js';
import { getDroneFreqs } from '../utils/freq-distribution.js';

export const DRONE_TYPES = {
  tambura: {
    baseFreq: 130,
    partials: [
      { ratio: 1, amp: 0.45 }, { ratio: 2, amp: 0.55 }, { ratio: 3, amp: 0.4 },
      { ratio: 4, amp: 0.3 }, { ratio: 5, amp: 0.18 }, { ratio: 6, amp: 0.12 },
      { ratio: 7, amp: 0.07 }, { ratio: 8, amp: 0.04 },
    ]
  },
  bowl: {
    baseFreq: 220,
    partials: [
      { ratio: 1, amp: 0.55 }, { ratio: 2.71, amp: 0.35 },
      { ratio: 4.8, amp: 0.2 }, { ratio: 7.2, amp: 0.12 },
    ]
  },
  organ: {
    baseFreq: 130,
    partials: [
      { ratio: 1, amp: 0.5 }, { ratio: 2, amp: 0.4 }, { ratio: 3, amp: 0.32 },
      { ratio: 4, amp: 0.22 }, { ratio: 5, amp: 0.12 }, { ratio: 6, amp: 0.08 },
      { ratio: 8, amp: 0.05 },
    ]
  },
  pad: {
    baseFreq: 180,
    partials: [
      { ratio: 1, amp: 0.5 }, { ratio: 1.002, amp: 0.45 }, { ratio: 0.998, amp: 0.45 },
      { ratio: 2, amp: 0.25 }, { ratio: 2.003, amp: 0.22 },
      { ratio: 3, amp: 0.12 },
    ]
  }
};

export class DroneMode extends BaseMode {
  constructor() {
    super('drone');
    this.oscillators = [];
    this.masterGain = null;
  }

  async _doStart(ctx, params) {
    const { droneType, droneFreq, beat, dist, volume } = params;
    const def = DRONE_TYPES[droneType];
    const baseFreq = droneFreq;
    const vol = volume / 100;

    const merger = ctx.createChannelMerger(2);
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(vol, ctx.currentTime);

    // LFO for gentle breathing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.masterGain.gain);
    lfo.start();

    this.oscillators = [];

    def.partials.forEach(p => {
      const freqs = getDroneFreqs(baseFreq, p.ratio, beat, dist);

      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(freqs.left, ctx.currentTime);
      oscR.frequency.setValueAtTime(freqs.right, ctx.currentTime);

      const gL = ctx.createGain();
      const gR = ctx.createGain();
      gL.gain.setValueAtTime(p.amp, ctx.currentTime);
      gR.gain.setValueAtTime(p.amp, ctx.currentTime);

      oscL.connect(gL); gL.connect(merger, 0, 0);
      oscR.connect(gR); gR.connect(merger, 0, 1);

      oscL.start(); oscR.start();

      this.oscillators.push({ oscL, oscR, gL, gR, ratio: p.ratio });
      this.nodes.push(oscL, oscR, gL, gR);
    });

    merger.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    this.nodes.push(merger, this.masterGain, lfo, lfoGain);
  }

  _doStop() {
    this.oscillators = [];
    this.masterGain = null;
  }

  _doUpdate(ctx, params) {
    const { droneFreq, beat, dist, volume } = params;
    const vol = volume / 100;
    const now = ctx.currentTime;

    this.oscillators.forEach(d => {
      const freqs = getDroneFreqs(droneFreq, d.ratio, beat, dist);
      d.oscL.frequency.setValueAtTime(freqs.left, now);
      d.oscR.frequency.setValueAtTime(freqs.right, now);
    });

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(vol, now);
    }
  }

  getChannelInfo(params) {
    const { droneType, droneFreq, beat, dist } = params;
    const partials = DRONE_TYPES[droneType].partials;
    const lowest = droneFreq * Math.min(...partials.map(p => p.ratio));

    if (dist === 'symmetric') {
      return {
        left: '左耳: 基频 ' + lowest.toFixed(0) + ' Hz -' + (beat / 2) + ' Hz',
        right: '右耳: 基频 ' + lowest.toFixed(0) + ' Hz +' + (beat / 2) + ' Hz'
      };
    } else if (dist === 'left') {
      return {
        left: '左耳: 全部 -' + beat + ' Hz 线性频移',
        right: '右耳: 基频 ' + lowest.toFixed(0) + ' Hz + 泛音'
      };
    }
    return {
      left: '左耳: 基频 ' + lowest.toFixed(0) + ' Hz + 泛音',
      right: '右耳: 全部 +' + beat + ' Hz 线性频移'
    };
  }
}
