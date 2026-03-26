import { BaseMode } from './base-mode.js';
import { getMusicShifts } from '../utils/freq-distribution.js';

export class MusicSSBMode extends BaseMode {
  constructor() {
    super('music');
    this.analyticChannels = null;
    this.analyticReady = false;
    this.ssbWorkletNode = null;
    this.workletReady = false;
    this.precomputeWorker = null;
    this.musicBuffer = null;
    this.volNode = null;
    this.fallbackProcessor = null;
  }

  /** 加载并预处理音频文件 */
  loadFile(file, ctx, onProgress, onReady, onError) {
    this.analyticReady = false;
    this.analyticChannels = null;

    const reader = new FileReader();
    reader.onload = (e) => {
      ctx.decodeAudioData(e.target.result, (buffer) => {
        this.musicBuffer = buffer;
        const dur = buffer.duration.toFixed(1);
        const numCh = buffer.numberOfChannels;
        const chLabel = numCh > 1 ? '立体声' : '单声道';

        const channels = [];
        for (let ch = 0; ch < numCh; ch++) {
          channels.push(buffer.getChannelData(ch).slice());
        }

        if (this.precomputeWorker) {
          this.precomputeWorker.terminate();
          this.precomputeWorker = null;
        }

        this.precomputeWorker = new Worker('js/workers/hilbert-worker.js');

        this.precomputeWorker.onmessage = (msg) => {
          if (msg.data.type === 'progress') {
            onProgress(file.name, msg.data.progress, dur, chLabel);
          } else if (msg.data.type === 'done') {
            this.analyticChannels = msg.data.results;
            this.analyticReady = true;
            onReady(file.name, dur, chLabel);
            this.precomputeWorker.terminate();
            this.precomputeWorker = null;
          } else if (msg.data.type === 'error') {
            onError('预处理失败: ' + msg.data.message);
            this.precomputeWorker.terminate();
            this.precomputeWorker = null;
          }
        };

        this.precomputeWorker.onerror = (err) => {
          onError('预处理失败: ' + err.message);
          this.precomputeWorker = null;
        };

        const transfer = channels.map(ch => ch.buffer);
        this.precomputeWorker.postMessage({ channels }, transfer);
      }, (err) => {
        onError('解码失败: ' + err);
      });
    };
    reader.readAsArrayBuffer(file);
  }

  async _ensureWorklet(ctx) {
    if (this.workletReady) return true;
    if (!ctx.audioWorklet) return false;
    try {
      await ctx.audioWorklet.addModule('js/workers/ssb-worklet.js');
      this.workletReady = true;
      return true;
    } catch (e) {
      console.warn('AudioWorklet unavailable, using fallback:', e);
      return false;
    }
  }

  async _doStart(ctx, params) {
    if (!this.analyticReady || !this.analyticChannels) {
      throw new Error('请先选择音频文件并等待预处理完成');
    }
    const vol = params.volume / 100;
    const shifts = getMusicShifts(params.beat, params.dist);
    const loop = params.loop;

    const canWorklet = await this._ensureWorklet(ctx);
    if (canWorklet) {
      this._startWorklet(ctx, vol, shifts, loop);
    } else {
      this._startFallback(ctx, vol, shifts, loop);
    }
  }

  _startWorklet(ctx, vol, shifts, loop) {
    const chData = this.analyticChannels;
    const stereo = chData.length >= 2;

    this.ssbWorkletNode = new AudioWorkletNode(ctx, 'ssb-processor', {
      numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2]
    });

    const rl = new Float32Array(chData[0].real);
    const il = new Float32Array(chData[0].imag);
    const msg = { type: 'load', realL: rl, imagL: il };
    const xfer = [rl.buffer, il.buffer];
    if (stereo) {
      const rr = new Float32Array(chData[1].real);
      const ir = new Float32Array(chData[1].imag);
      msg.realR = rr; msg.imagR = ir;
      xfer.push(rr.buffer, ir.buffer);
    }
    this.ssbWorkletNode.port.postMessage(msg, xfer);
    this.ssbWorkletNode.port.postMessage({ type: 'shifts', shiftL: shifts.left, shiftR: shifts.right });
    this.ssbWorkletNode.port.postMessage({ type: 'loop', loop });

    this.volNode = ctx.createGain();
    this.volNode.gain.setValueAtTime(vol, ctx.currentTime);
    this.ssbWorkletNode.connect(this.volNode);
    this.volNode.connect(ctx.destination);
    this.nodes.push(this.volNode);
  }

  _startFallback(ctx, vol, shifts, loop) {
    const chData = this.analyticChannels;
    const stereo = chData.length >= 2;
    const sr = ctx.sampleRate;
    const dataLen = chData[0].real.length;
    const cfLen = 2048;
    const processor = ctx.createScriptProcessor(4096, 0, 2);

    let pos = 0, phaseL = 0, phaseR = 0;
    let curSL = shifts.left, curSR = shifts.right, curLoop = loop;
    processor._setShifts = (sL, sR) => { curSL = sL; curSR = sR; };

    const aLR = chData[0].real, aLI = chData[0].imag;
    const aRR = stereo ? chData[1].real : aLR;
    const aRI = stereo ? chData[1].imag : aLI;
    const TWO_PI = 2 * Math.PI;

    processor.onaudioprocess = (e) => {
      const outL = e.outputBuffer.getChannelData(0);
      const outR = e.outputBuffer.getChannelData(1);
      const len = outL.length;
      const sL = curSL, sR = curSR;
      const pIL = TWO_PI * sL / sr, pIR = TWO_PI * sR / sr;

      for (let i = 0; i < len; i++) {
        if (pos >= dataLen) {
          if (curLoop) { pos = cfLen; }
          else { outL[i] = 0; outR[i] = 0; continue; }
        }
        let rL = aLR[pos], hL = aLI[pos];
        let rR = aRR[pos], hR = aRI[pos];

        if (curLoop && pos >= dataLen - cfLen && dataLen > cfLen * 2) {
          const fo = (dataLen - pos) / cfLen, fi = 1 - fo;
          const wp = pos - (dataLen - cfLen);
          rL = rL * fo + aLR[wp] * fi; hL = hL * fo + aLI[wp] * fi;
          rR = rR * fo + aRR[wp] * fi; hR = hR * fo + aRI[wp] * fi;
        }

        if (sL === 0) outL[i] = rL;
        else outL[i] = rL * Math.cos(phaseL) - hL * Math.sin(phaseL);

        if (sR === 0) outR[i] = rR;
        else outR[i] = rR * Math.cos(phaseR) - hR * Math.sin(phaseR);

        phaseL += pIL; phaseR += pIR;
        if (phaseL > TWO_PI) phaseL -= TWO_PI;
        else if (phaseL < -TWO_PI) phaseL += TWO_PI;
        if (phaseR > TWO_PI) phaseR -= TWO_PI;
        else if (phaseR < -TWO_PI) phaseR += TWO_PI;
        pos++;
      }
    };

    this.fallbackProcessor = processor;
    this.volNode = ctx.createGain();
    this.volNode.gain.setValueAtTime(vol, ctx.currentTime);
    processor.connect(this.volNode);
    this.volNode.connect(ctx.destination);
    this.nodes.push(processor, this.volNode);
  }

  _doStop() {
    if (this.ssbWorkletNode) {
      try {
        this.ssbWorkletNode.port.postMessage({ type: 'stop' });
        this.ssbWorkletNode.disconnect();
      } catch (e) { /* already stopped */ }
      this.ssbWorkletNode = null;
    }
    this.fallbackProcessor = null;
    this.volNode = null;
  }

  _doUpdate(ctx, params) {
    const vol = params.volume / 100;
    const shifts = getMusicShifts(params.beat, params.dist);

    if (this.ssbWorkletNode) {
      this.ssbWorkletNode.port.postMessage({ type: 'shifts', shiftL: shifts.left, shiftR: shifts.right });
    }
    if (this.fallbackProcessor && this.fallbackProcessor._setShifts) {
      this.fallbackProcessor._setShifts(shifts.left, shifts.right);
    }
    if (this.volNode) {
      this.volNode.gain.setValueAtTime(vol, ctx.currentTime);
    }
  }

  getChannelInfo(params) {
    const shifts = getMusicShifts(params.beat, params.dist);
    if (params.dist === 'symmetric') {
      return {
        left: '左耳: 频移 ' + shifts.left.toFixed(1) + ' Hz',
        right: '右耳: 频移 +' + shifts.right.toFixed(1) + ' Hz'
      };
    } else if (params.dist === 'left') {
      return {
        left: '左耳: 频移 ' + shifts.left.toFixed(1) + ' Hz',
        right: '右耳: 原始音频'
      };
    }
    return {
      left: '左耳: 原始音频',
      right: '右耳: 频移 +' + shifts.right.toFixed(1) + ' Hz'
    };
  }

  get isReady() {
    return this.analyticReady;
  }
}
