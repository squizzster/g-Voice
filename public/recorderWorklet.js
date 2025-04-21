/** AudioWorkletProcessor that resamples 48 kHz → 8 kHz with a very small
 *  linear‑interpolation low‑pass and emits 20 ms (160‑sample) µ‑law frames
 *  to the main thread.
 */
class RecorderProcessor extends AudioWorkletProcessor {
  constructor () {
    super();
    this.recording   = false;
    this.inputRate   = sampleRate;   // whatever the browser runs at (48 k on Chrome)
    this.outputRate  = 8000;
    this.ratio       = this.inputRate / this.outputRate;
    this.inResidual  = new Float32Array(0);    // raw PCM left over from last call
    this.outResidual = new Uint8Array(0);      // µ‑law not yet posted

    this.port.onmessage = ({data}) => {
      if      (data.command === 'start') this.recording = true;
      else if (data.command === 'stop')  this.recording = false;
    };
  }

  /* G.711 µ‑law encoder */
  static linearToMuLaw (x) {
    const MU = 255;
    const sign = x < 0 ? 0x80 : 0;
    x = Math.min(1, Math.abs(x));
    const mag = Math.log1p(MU * x) / Math.log1p(MU);
    return (sign | (mag * 127) & 0x7F) ^ 0xFF;
  }

  process (inputs) {
    if (!this.recording) return true;
    const inChan = inputs[0][0];
    if (!inChan?.length) return true;

    /* -------- concat with residual from last callback -------- */
    const pcm = new Float32Array(this.inResidual.length + inChan.length);
    pcm.set(this.inResidual);
    pcm.set(inChan, this.inResidual.length);

    /* -------- high‑quality down‑sample with linear interpolation -------- */
    const outLen = Math.floor((pcm.length - 1) / this.ratio);
    const muBuf  = new Uint8Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const idxF = i * this.ratio;
      const idx  = idxF | 0;                  // floor
      const frac = idxF - idx;
      const sample = pcm[idx] * (1 - frac) + pcm[idx + 1] * frac;
      muBuf[i] = RecorderProcessor.linearToMuLaw(sample);
    }

    /* -------- remember unused source samples for next turn -------- */
    const usedSamples = Math.floor(outLen * this.ratio);
    this.inResidual = pcm.slice(usedSamples);

    /* -------- prepend leftover µ‑law and chunk into 160‑byte frames -------- */
    let combined = new Uint8Array(this.outResidual.length + muBuf.length);
    combined.set(this.outResidual);
    combined.set(muBuf, this.outResidual.length);

    const FRAME = 160;                        // 20 ms @ 8 kHz
    const fullFrames = (combined.length / FRAME) | 0;
    for (let f = 0; f < fullFrames; f++) {
      const chunk = combined.slice(f * FRAME, (f + 1) * FRAME);
      this.port.postMessage(chunk.buffer, [chunk.buffer]);
    }
    this.outResidual = combined.slice(fullFrames * FRAME);
    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
