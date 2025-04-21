let isRecording = false;
let ctx, micStream, sourceNode, recorderNode, gainNode, scriptNode, ws;
let sequenceNumber = 1;
let chunkCounter = 1;
let startTime;
const playbackQueue = [];

/* ---------- globals ---------- */
let playerNode;        // NEW – AudioWorkletNode for playback



const ACCOUNT_SID = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const CALL_SID    = 'CAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const STREAM_SID  = 'MZXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TRACKS      = ['inbound'];
const MEDIA_FORMAT = { encoding: 'audio/x-mulaw', sampleRate: 8000, channels: 1 };
// Expanded Twilio-style custom parameters
const CUSTOM_PARAMS = {
  AccountSid:   ACCOUNT_SID,
  ApiVersion:   '2010-04-01',
  CallSid:      CALL_SID,
  CallStatus:   'ringing',
  Called:       'sip:mk-taxi.sip.dublin.twilio.com++0@mk-taxi.sip.twilio.com;transport=tls',
  Caller:       'sip:mk-taxi-1@mk-taxi.sip.twilio.com',
  CallerName:   'g-booking',
  Direction:    'inbound',
  From:         'sip:mk-taxi-1@mk-taxi.sip.twilio.com',
  SipCallId:    '940fc5ccc67748e3bfbef60386f29191',
  SipDomain:    'mk-taxi.sip.twilio.com',
  SipDomainSid: 'SD483303cea700b3beaba55febf067dd2b',
  SipSourceIp:  '84.68.185.54',
  To:           'sip:mk-taxi.sip.dublin.twilio.com++0@mk-taxi.sip.twilio.com;transport=tls',
  g_voice_check: 'G_VOICE_CHECKING_GOES_HERE_TOKEN'
};

const logDiv = document.getElementById('log');
const btn = document.getElementById('recordBtn');
const BUFFER_SIZE = 4096;

function log(msg) {
  console.log(msg);
  logDiv.textContent += msg + '\n';
  logDiv.scrollTop = logDiv.scrollHeight;
}



// μ-law decode helper
function muLawToLinear(uVal) {
  uVal = ~uVal;
  const sign = uVal & 0x80;
  const exponent = (uVal >> 4) & 0x07;
  const mantissa = uVal & 0x0F;
  let sample = ((mantissa << 4) + 0x08) << exponent;
  sample = sample - 0x84;
  return (sign ? -sample : sample) / 32768;
}

btn.addEventListener('click', async () => {
  if (!isRecording) {
    btn.textContent = 'Stop Recording';
    await startStreaming();
  } else {
    btn.textContent = 'Start Recording';
    stopStreaming();
  }
  isRecording = !isRecording;
});

async function startStreaming() {
  log('▶ Requesting mic…');
  micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });

  ctx = new AudioContext({ sampleRate: 8000 });
  await ctx.audioWorklet.addModule('recorderWorklet.js');

  sourceNode = ctx.createMediaStreamSource(micStream);
  recorderNode = new AudioWorkletNode(ctx, 'recorder-processor');

  recorderNode.port.onmessage = e => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const uint8 = new Uint8Array(e.data);
      let binary = '';
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const b64 = btoa(binary);

      const message = {
        event: 'media',
        sequenceNumber: (sequenceNumber++).toString(),
        media: {
          track: 'inbound',
          chunk: chunkCounter++,
          timestamp: Math.floor(Date.now() - startTime),
          payload: b64
        },
        streamSid: STREAM_SID
      };
      ws.send(JSON.stringify(message));
    }
  };
  recorderNode.port.postMessage({ command: 'start' });

  gainNode = new GainNode(ctx, { gain: 0 });
  sourceNode.connect(recorderNode).connect(gainNode).connect(ctx.destination);

  // Playback processor
  scriptNode = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);
  scriptNode.onaudioprocess = e => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
      output[i] = playbackQueue.length ? playbackQueue.shift() : 0;
    }
  };
  scriptNode.connect(ctx.destination);

  ws = new WebSocket('wss://api.g-booking.com/gws/audio');
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    log('🔗 WS open');
    startTime = Date.now();
    const startMsg = {
      event: 'start',
      sequenceNumber: sequenceNumber++,
      start: {
        accountSid:       ACCOUNT_SID,
        callSid:          CALL_SID,
        customParameters: CUSTOM_PARAMS,
        mediaFormat:      MEDIA_FORMAT,
        streamSid:        STREAM_SID,
        tracks:           TRACKS
      },
      streamSid: STREAM_SID
    };
    ws.send(JSON.stringify(startMsg));
  };

  ws.onmessage = evt => {
    try {
      const msg = JSON.parse(evt.data);
      if (msg.event === 'media' && msg.media && msg.media.payload) {
        const b64 = msg.media.payload;
        const binary = atob(b64);
        const len = binary.length;
        const buf = new Uint8Array(len);
        for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
        for (let i = 0; i < buf.length; i++) {
          playbackQueue.push(muLawToLinear(buf[i]));
        }
      }
    } catch (err) {
      console.error('Playback decode error', err);
    }
    const size = evt.data.byteLength || evt.data.length;
    log(`◀ Received ${size} bytes`);
  };

  ws.onerror = err => log('❌ WS error: ' + err.message);
  ws.onclose = () => log('🔒 WS closed');

  log('🛠 Recording started');
}

function stopStreaming() {
  recorderNode.port.postMessage({ command: 'stop' });
  micStream.getTracks().forEach(t => t.stop());
  recorderNode.disconnect();
  gainNode.disconnect();
  scriptNode.disconnect();
  ws.close();
  ctx.close();
  log('⏹ Recording stopped');
}