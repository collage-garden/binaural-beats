/**
 * BaseMode — 所有音频模式的抽象基类 (Template Method Pattern)
 * 子类需要实现: _doStart, _doStop, _doUpdate, getChannelInfo
 */
export class BaseMode {
  constructor(name) {
    this.name = name;
    this.nodes = [];
  }

  async start(ctx, params) {
    await this._doStart(ctx, params);
  }

  stop(ctx) {
    const now = ctx ? ctx.currentTime : 0;
    this._doStop(ctx, now);
    this.nodes.forEach(n => {
      try {
        if (n.stop) n.stop(now + 0.05);
        else if (n.disconnect) n.disconnect();
      } catch (e) { /* already stopped */ }
    });
    this.nodes = [];
  }

  update(ctx, params) {
    this._doUpdate(ctx, params);
  }

  getChannelInfo(params) {
    return { left: '左耳: —', right: '右耳: —' };
  }

  // Template methods for subclasses
  async _doStart(ctx, params) { throw new Error('Not implemented'); }
  _doStop(ctx, now) { /* optional override */ }
  _doUpdate(ctx, params) { throw new Error('Not implemented'); }
}
