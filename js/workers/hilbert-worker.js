'use strict';

function fft(re, im, N) {
  let j = 0;
  for (let i = 0; i < N - 1; i++) {
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
    let k = N >> 1;
    while (k <= j) { j -= k; k >>= 1; }
    j += k;
  }
  for (let len = 2; len <= N; len *= 2) {
    const half = len >> 1;
    const ang = -2 * Math.PI / len;
    const wR = Math.cos(ang), wI = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let tR = 1, tI = 0;
      for (let jj = 0; jj < half; jj++) {
        const idx = i + jj, idx2 = idx + half;
        const uR = re[idx], uI = im[idx];
        const vR = re[idx2] * tR - im[idx2] * tI;
        const vI = re[idx2] * tI + im[idx2] * tR;
        re[idx] = uR + vR; im[idx] = uI + vI;
        re[idx2] = uR - vR; im[idx2] = uI - vI;
        const nR = tR * wR - tI * wI;
        tI = tR * wI + tI * wR;
        tR = nR;
      }
    }
  }
}

function ifft(re, im, N) {
  for (let i = 0; i < N; i++) im[i] = -im[i];
  fft(re, im, N);
  for (let i = 0; i < N; i++) { re[i] /= N; im[i] = -im[i] / N; }
}

self.onmessage = function(e) {
  try {
    const channels = e.data.channels;
    const totalCh = channels.length;
    const results = [];

    for (let ch = 0; ch < totalCh; ch++) {
      const data = channels[ch];
      const origLen = data.length;
      const CHUNK = 32768, OVERLAP = 4096, GOOD = CHUNK - 2 * OVERLAP;
      const realOut = new Float32Array(origLen);
      const imagOut = new Float32Array(origLen);
      const totalChunks = Math.ceil(origLen / GOOD);
      let ci = 0;

      for (let outStart = 0; outStart < origLen; outStart += GOOD) {
        const inStart = outStart - OVERLAP;
        const re = new Float32Array(CHUNK);
        const im = new Float32Array(CHUNK);
        for (let i = 0; i < CHUNK; i++) {
          const s = inStart + i;
          re[i] = (s >= 0 && s < origLen) ? data[s] : 0;
        }
        fft(re, im, CHUNK);
        for (let i = 1; i < CHUNK / 2; i++) { re[i] *= 2; im[i] *= 2; }
        for (let i = CHUNK / 2 + 1; i < CHUNK; i++) { re[i] = 0; im[i] = 0; }
        ifft(re, im, CHUNK);
        const goodLen = Math.min(GOOD, origLen - outStart);
        for (let i = 0; i < goodLen; i++) {
          realOut[outStart + i] = re[OVERLAP + i];
          imagOut[outStart + i] = im[OVERLAP + i];
        }
        ci++;
        if (ci % 4 === 0 || ci === totalChunks) {
          self.postMessage({ type: 'progress', progress: (ch + ci / totalChunks) / totalCh });
        }
      }
      results.push({ real: realOut, imag: imagOut });
    }

    const transfer = [];
    for (let i = 0; i < results.length; i++) {
      transfer.push(results[i].real.buffer, results[i].imag.buffer);
    }
    self.postMessage({ type: 'done', results }, transfer);
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err) });
  }
};
