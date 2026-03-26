/**
 * FileHandler — 文件上传与拖放处理
 */
export class FileHandler {
  constructor({ fileAreaId, fileInputId, fileInfoId, onFileLoad }) {
    this.fileArea = document.getElementById(fileAreaId);
    this.fileInput = document.getElementById(fileInputId);
    this.fileInfo = document.getElementById(fileInfoId);
    this.onFileLoad = onFileLoad;

    this._bindEvents();
  }

  _bindEvents() {
    // Click to upload
    this.fileArea.addEventListener('click', () => this.fileInput.click());

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this._handleFile(file);
    });

    // Drag and drop
    this.fileArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.fileArea.style.borderColor = '#7eb8ff';
      this.fileArea.style.color = '#aaa';
    });

    this.fileArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.fileArea.style.borderColor = '';
      this.fileArea.style.color = '';
    });

    this.fileArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.fileArea.style.borderColor = '';
      this.fileArea.style.color = '';
      const file = e.dataTransfer.files[0];
      if (file) this._handleFile(file);
    });
  }

  _handleFile(file) {
    this.fileInfo.textContent = '解码中...';
    this.onFileLoad(file, {
      onProgress: (name, progress, dur, chLabel) => {
        this.fileInfo.textContent = '✅ ' + name + ' — 预处理: ' + Math.round(progress * 100) + '%';
      },
      onReady: (name, dur, chLabel) => {
        this.fileInfo.textContent = '✅ ' + name + ' (' + dur + 's, ' + chLabel + ') — 已就绪';
        this.fileArea.className = 'file-area loaded';
      },
      onError: (msg) => {
        this.fileInfo.textContent = '❌ ' + msg;
      }
    });
  }
}
