/**
 * AudioEngine — 音频引擎 Facade
 * 管理 AudioContext 生命周期、模式切换、统一 start/stop/update 接口
 */
import { PureToneMode } from './modes/pure-tone.js';
import { MusicSSBMode } from './modes/music-ssb.js';
import { DroneMode } from './modes/drone.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentModeName = 'pure';

    this.modes = {
      pure: new PureToneMode(),
      music: new MusicSSBMode(),
      drone: new DroneMode(),
    };
  }

  getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  }

  getMode(name) {
    return this.modes[name || this.currentModeName];
  }

  get activeMode() {
    return this.modes[this.currentModeName];
  }

  get musicMode() {
    return this.modes.music;
  }

  async start(params) {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    await this.activeMode.start(ctx, params);
    this.isPlaying = true;
  }

  stop() {
    if (this.isPlaying) {
      this.activeMode.stop(this.ctx);
      this.isPlaying = false;
    }
  }

  update(params) {
    if (this.isPlaying) {
      this.activeMode.update(this.ctx, params);
    }
  }

  switchMode(name) {
    if (this.isPlaying) this.stop();
    this.currentModeName = name;
  }

  getChannelInfo(params) {
    return this.activeMode.getChannelInfo(params);
  }
}
