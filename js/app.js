/**
 * App — 应用入口，连接所有模块
 */
import { AudioEngine } from './audio-engine.js';
import { DRONE_TYPES } from './modes/drone.js';
import { Visualizer } from './ui/visualizer.js';
import { InfoPanel } from './ui/info-panel.js';
import { FileHandler } from './ui/file-handler.js';
import { Controls } from './ui/controls.js';

class App {
  constructor() {
    this.engine = new AudioEngine();
    this.controls = new Controls();
    this.visualizer = new Visualizer('waveCanvas');
    this.infoPanel = new InfoPanel('infoPanel');

    this._initFileHandler();
    this._bindControls();
    this._initPresets();

    // 初始状态
    this.updateParams();
    this.visualizer.clear();
  }

  _initFileHandler() {
    this.fileHandler = new FileHandler({
      fileAreaId: 'fileArea',
      fileInputId: 'fileInput',
      fileInfoId: 'fileInfo',
      onFileLoad: (file, callbacks) => {
        const ctx = this.engine.getCtx();
        this.engine.musicMode.loadFile(file, ctx,
          callbacks.onProgress,
          callbacks.onReady,
          callbacks.onError
        );
      }
    });
  }

  _bindControls() {
    this.controls.bindAll(
      () => this.updateParams(),
      () => this._onDroneTypeChange(),
      () => this.togglePlay(),
      (mode) => this.switchMode(mode)
    );
  }

  _initPresets() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const freq = parseFloat(btn.dataset.beat);
        if (!isNaN(freq)) {
          this.controls.setBeat(freq);
          this.updateParams();
        }
      });
    });
  }

  async togglePlay() {
    if (this.engine.isPlaying) {
      this.engine.stop();
      this.controls.setPlaying(false);
      this.visualizer.stop();
    } else {
      try {
        const params = this.controls.getParams(this.engine.currentModeName);
        await this.engine.start(params);
        this.controls.setPlaying(true);
        this.visualizer.start(
          () => this.controls.getParams(this.engine.currentModeName),
          this.engine.currentModeName
        );
        this.updateParams();
      } catch (e) {
        console.error('Start audio error:', e);
        alert(e.message || '音频启动失败');
      }
    }
  }

  switchMode(mode) {
    this.engine.switchMode(mode);
    this.controls.setPlaying(false);
    this.visualizer.stop();

    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    document.querySelectorAll('.panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + mode);
    });

    this.updateParams();
  }

  updateParams() {
    const modeName = this.engine.currentModeName;
    const params = this.controls.getParams(modeName);

    this.controls.updateLabels(params, modeName);

    // 更新引擎
    if (this.engine.isPlaying) {
      this.engine.update(params);
    }

    // 更新频道信息
    const info = this.engine.getChannelInfo(params);
    this.controls.updateChannelInfo(info);

    // 更新信息面板
    this.infoPanel.update(params.beat, modeName, params.dist);
  }

  _onDroneTypeChange() {
    const type = this.controls.els.droneType.value;
    const def = DRONE_TYPES[type];
    this.controls.els.droneFreq.value = def.baseFreq;
    this.controls.els.droneFreqVal.textContent = def.baseFreq + ' Hz';

    if (this.engine.isPlaying && this.engine.currentModeName === 'drone') {
      this.engine.stop();
      this.togglePlay();
    }
  }
}

// 启动应用
new App();
