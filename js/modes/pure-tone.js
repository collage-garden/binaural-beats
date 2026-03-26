import { BaseMode } from './base-mode.js';
import { getPureFreqs } from '../utils/freq-distribution.js';

export class PureToneMode extends BaseMode {
  constructor() {
    super('pure');
    this.oscL = null;
    this.oscR = null;
    this.gainL = null;
    this.gainR = null;
  }

  async _doStart(ctx, params) {
    const { carrier, beat, dist, volume } = params;
    const vol = volume / 100;
    const freqs = getPureFreqs(carrier, beat, dist);

    const merger = ctx.createChannelMerger(2);
    this.gainL = ctx.createGain();
    this.gainR = ctx.createGain();
    this.gainL.gain.setValueAtTime(vol, ctx.currentTime);
    this.gainR.gain.setValueAtTime(vol, ctx.currentTime);

    this.oscL = ctx.createOscillator();
    this.oscR = ctx.createOscillator();
    this.oscL.type = 'sine';
    this.oscR.type = 'sine';
    this.oscL.frequency.setValueAtTime(freqs.left, ctx.currentTime);
    this.oscR.frequency.setValueAtTime(freqs.right, ctx.currentTime);

    this.oscL.connect(this.gainL); this.gainL.connect(merger, 0, 0);
    this.oscR.connect(this.gainR); this.gainR.connect(merger, 0, 1);
    merger.connect(ctx.destination);

    this.oscL.start();
    this.oscR.start();

    this.nodes.push(this.oscL, this.oscR, this.gainL, this.gainR, merger);
  }

  _doUpdate(ctx, params) {
    const { carrier, beat, dist, volume } = params;
    const vol = volume / 100;
    const freqs = getPureFreqs(carrier, beat, dist);
    const now = ctx.currentTime;

    if (this.oscL) this.oscL.frequency.setValueAtTime(freqs.left, now);
    if (this.oscR) this.oscR.frequency.setValueAtTime(freqs.right, now);
    if (this.gainL) this.gainL.gain.setValueAtTime(vol, now);
    if (this.gainR) this.gainR.gain.setValueAtTime(vol, now);
  }

  _doStop() {
    this.oscL = null;
    this.oscR = null;
    this.gainL = null;
    this.gainR = null;
  }

  getChannelInfo(params) {
    const freqs = getPureFreqs(params.carrier, params.beat, params.dist);
    return {
      left: '左耳: ' + freqs.left.toFixed(1) + ' Hz',
      right: '右耳: ' + freqs.right.toFixed(1) + ' Hz'
    };
  }
}
