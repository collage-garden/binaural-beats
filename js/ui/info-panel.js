/**
 * InfoPanel — 频段信息面板
 */
import { DIST_LABELS } from '../utils/freq-distribution.js';

export class InfoPanel {
  constructor(elementId) {
    this.el = document.getElementById(elementId);
  }

  update(beat, modeName, dist) {
    let bandHtml, desc;
    if (beat <= 4) {
      bandHtml = '<span class="band-delta">Delta (δ) 1–4 Hz</span>';
      desc = '深沉起伏，搏动缓慢如呼吸。';
    } else if (beat <= 8) {
      bandHtml = '<span class="band-theta">Theta (θ) 4–8 Hz</span>';
      desc = '明显的节奏搏动，冥想频段。';
    } else if (beat <= 13) {
      bandHtml = '<span class="band-alpha">Alpha (α) 8–13 Hz</span>';
      desc = '搏动清晰稳定，放松频段。';
    } else if (beat <= 30) {
      bandHtml = '<span class="band-beta">Beta (β) 13–30 Hz</span>';
      desc = '快速搏动→颤动→粗糙感。';
    } else if (beat <= 40) {
      bandHtml = '<span class="band-collapse">瓦解区 30–40 Hz</span>';
      desc = '脑干锁相极限，搏动开始瓦解。';
    } else {
      bandHtml = '<span class="band-collapse">超出范围 >40 Hz</span>';
      desc = '双耳拍消失，听到两个独立的音。';
    }

    const distLabel = DIST_LABELS[dist] || dist;
    const modeMap = {
      music: '📌 音乐模式: SSB线性频移 · ' + distLabel,
      drone: '📌 持续音模式: 全部泛音线性频移 · ' + distLabel,
      pure: '📌 纯音模式: 最经典的双耳拍体验 · ' + distLabel
    };

    this.el.innerHTML = bandHtml + ' — ' + desc +
      '<br>当前差频 <strong>' + beat + ' Hz</strong>' +
      '<br>' + (modeMap[modeName] || modeMap.pure);
  }
}
