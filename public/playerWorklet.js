/** AudioWorkletProcessor that
 *  • takes raw µ‑Law (8 kHz mono) chunks from the main thread
 *  • decodes to float32 PCM
 *  • resamples to the AudioContext’s rate with linear interpolation
 *  • serves audio after at least 2 000 bytes have been buffered
 */
class PlayerProcessor extends AudioWorkletProcessor {
  constructor () {
    super();
    /* input / output sample‑rates */
    this.inRate   = 8000;
    this.outRate  = sampleRate;
    this.ratio    = this.outRate / this.inRate;

    /* 2 s ring‑buffer = plenty for jitter‑domination */
    this.buf      = new Float32Array(this.outRate * 2);
    this.w        = 0;          // write index
    this.r        = 0;          // read  index
    this.ready    = false;      // start only when enough buffered

    this.port.onmessage = ({data}) => this.enqueue(new Uint8Array(data));
  }

  /* ---------- µ‑Law decoder (pre‑computed LUT) ---------- */
  static get lut () {
    if (this._lut) return this._lut;
    const table = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = ~i & 0xFF;
      const sign = c & 0x80;
      const exp  = (c >> 4) & 0x07;
      const man  =  c       & 0x0F;
      let pcm = ((man << 4) + 0x08) << exp;
      pcm -= 0x84;
      table[i] = (sign ? -pcm : pcm) / 32768;
    }
    this._lut = table;
    return table;
  }

  /* ---------- helpers ---------- */
  enqueue (u8) {                             // µ‑Law → PCM → resample → buffer
    const pcm8k = new Float32Array(u8.length);
    const lut   = PlayerProcessor.lut;
    for (let i = 0; i < u8.length; i++) pcm8k[i] = lut[u8[i]];

    /* linear resample to ctx rate */
    const outLen = Math.floor(pcm8k.length * this.ratio);
    const resamp = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const src = i / this.ratio;
      const idx = src | 0;
      const frac = src - idx;
      const a = pcm8k[idx];
      const b = pcm8k[Math.min(idx + 1, pcm8k.length - 1)];
      resamp[i] = a + (b - a) * frac;
    }

    /* write into ring buffer */
    for (let i = 0; i < resamp.length; i++) {
      this.buf[this.w] = resamp[i];
      this.w = (this.w + 1) % this.buf.length;
    }
  }

  process (inputs, outputs) {
    const out = outputs[0][0];
    const wantPreload = 2000;                                   // bytes
    const have = (this.w - this.r + this.buf.length) % this.buf.length;

    if (!this.ready && have >= wantPreload * this.ratio) this.ready = true;

    for (let i = 0; i < out.length; i++) {
      if (!this.ready || this.r === this.w) {
        out[i] = 0;                                             // underrun = silence
      } else {
        out[i] = this.buf[this.r];
        this.r = (this.r + 1) % this.buf.length;
      }
    }
    return true;
  }
}

registerProcessor('player-processor', PlayerProcessor);
