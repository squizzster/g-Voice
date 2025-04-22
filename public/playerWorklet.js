/** AudioWorkletProcessor: queues Float32 samples and outputs at hardware rate */
class PlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = new Float32Array(0);
    this.port.onmessage = (e) => {
      // receive Float32Array of decoded PCM
      const incoming = new Float32Array(e.data);
      const q = new Float32Array(this.queue.length + incoming.length);
      q.set(this.queue);
      q.set(incoming, this.queue.length);
      this.queue = q;
    };
  }

  process(inputs, outputs) {
    const out = outputs[0][0];
    const q = this.queue;
    const len = out.length;
    // fill output and shrink queue
    for (let i = 0; i < len; i++) {
      out[i] = q.length > 0 ? q[i] : 0;
    }
    // remove consumed samples
    this.queue = q.slice(len);
    return true;
  }
}

registerProcessor('player-processor', PlayerProcessor);
