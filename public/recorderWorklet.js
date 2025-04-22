/** AudioWorkletProcessor: 48 kHz → 8 kHz ↓ + G.711 µ‑law encode */
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.recording   = false;
    this.inputRate   = sampleRate;
    this.outputRate  = 8000;
    this.ratio       = this.inputRate / this.outputRate;
    this.inResidual  = new Float32Array(0);
    this.outResidual = new Uint8Array(0);
    this.port.onmessage = ({ data }) => {
      if      (data.command === 'start') this.recording = true;
      else if (data.command === 'stop')  this.recording = false;
    };
  }

  static linearToMuLaw(x) {
    const MU = 255;
    const sign = x < 0 ? 0x80 : 0;
    x = Math.min(1, Math.abs(x));
    const mag = Math.log1p(MU * x) / Math.log1p(MU);
    const idx = Math.min(127, Math.floor(mag * 127 + 0.5));
    return (sign | (idx & 0x7F)) ^ 0xFF;
  }

  process(inputs) {
    if (!this.recording) return true;
    const inChan = inputs[0][0];
    if (!inChan?.length) return true;

    // concat leftover + new
    const pcm = new Float32Array(this.inResidual.length + inChan.length);
    pcm.set(this.inResidual);
    pcm.set(inChan, this.inResidual.length);

    // downsample & µ‑law encode
    const outLen = Math.floor((pcm.length - 1) / this.ratio);
    const muBuf  = new Uint8Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const f    = i * this.ratio;
      const idx  = f | 0;
      const frac = f - idx;
      const s    = pcm[idx] * (1 - frac) + pcm[idx + 1] * frac;
      muBuf[i]   = RecorderProcessor.linearToMuLaw(s);
    }

    // stash leftover PCM
    const used = Math.floor(outLen * this.ratio);
    this.inResidual = pcm.slice(used);

    // frame into 160‑byte packets
    const combined = new Uint8Array(this.outResidual.length + muBuf.length);
    combined.set(this.outResidual);
    combined.set(muBuf, this.outResidual.length);

    const FRAME = 160, full = (combined.length / FRAME) | 0;
    for (let i = 0; i < full; i++) {
      const chunk = combined.slice(i * FRAME, (i + 1) * FRAME);
      this.port.postMessage(chunk.buffer, [chunk.buffer]);
    }
    this.outResidual = combined.slice(full * FRAME);

    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
