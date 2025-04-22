(function(global){
  "use strict";
  const ACCOUNT_SID='ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const CALL_SID='CAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const STREAM_SID='MZXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const TRACKS=['inbound'];
  const MEDIA_FORMAT={encoding:'audio/x-mulaw',sampleRate:8000,channels:1};
  const CUSTOM_PARAMS={AccountSid:ACCOUNT_SID,ApiVersion:'2010-04-01',CallSid:CALL_SID,CallStatus:'ringing'};

  let isRecording=false;
  let ctx,micStream,sourceNode,recorderNode,ws;
  let seqNum=1,chunkCount=0,nextPlayTime=0,startTime=0;

  function muLawToLinear(u){u=(~u)&255;const s=u&128,e=(u>>4)&7,m=u&15;let sample=((m<<3)+132)<<e;sample=s?(132-sample):(sample-132);return sample/32768;}

  function log(m){console.log('[gVoiceAudio] '+m);}

  async function startStreaming(){
    if(isRecording) return;
    isRecording=true;
    log('▶ Mic capture…');
    micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true}});
    ctx=new AudioContext();
    await ctx.audioWorklet.addModule('recorderWorklet.js');
    sourceNode=ctx.createMediaStreamSource(micStream);
    recorderNode=new AudioWorkletNode(ctx,'recorder-processor');

    recorderNode.port.onmessage=e=>{
      if(ws&&ws.readyState===WebSocket.OPEN){
        const u8=new Uint8Array(e.data);
        const b64=btoa(String.fromCharCode(...u8));
        ws.send(JSON.stringify({event:'media',sequenceNumber:(seqNum++).toString(),media:{track:'inbound',chunk:++chunkCount,timestamp:Date.now()-startTime,payload:b64},streamSid:STREAM_SID}));
      }
    };
    sourceNode.connect(recorderNode).connect(ctx.destination);
    recorderNode.port.postMessage({command:'start'});

    ws=new WebSocket('wss://api.g-booking.com/gws/audio');
    ws.binaryType='arraybuffer';
    ws.onopen=()=>{
      log('🔗 WS open');
      startTime=Date.now();
      nextPlayTime=ctx.currentTime+.3;
      ws.send(JSON.stringify({event:'start',sequenceNumber:seqNum++,start:{accountSid:ACCOUNT_SID,callSid:CALL_SID,customParameters:CUSTOM_PARAMS,mediaFormat:MEDIA_FORMAT,streamSid:STREAM_SID,tracks:TRACKS},streamSid:STREAM_SID}));
    };
    ws.onmessage=ev=>{
      const msg=JSON.parse(ev.data);
      if(msg.event!=='media'||!msg.media?.payload)return;
      const bin=atob(msg.media.payload);
      const buf=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);
      const pcm=new Float32Array(buf.length);
      for(let i=0;i<buf.length;i++)pcm[i]=muLawToLinear(buf[i]);
      const abuf=ctx.createBuffer(1,pcm.length,8000);abuf.copyToChannel(pcm,0);
      const src=ctx.createBufferSource();src.buffer=abuf;src.connect(ctx.destination);src.start(nextPlayTime);
      nextPlayTime+=pcm.length/8000;
    };
    ws.onerror=e=>log('❌ WS error '+e.message);
    ws.onclose=()=>log('🔒 WS closed');
  }

  function stopStreaming(){
    if(!isRecording)return;
    recorderNode.port.postMessage({command:'stop'});
    micStream.getTracks().forEach(t=>t.stop());
    recorderNode.disconnect();sourceNode.disconnect();
    ws.close();ctx.close();
    isRecording=false;log('⏹ stopped');
  }

  global.gVoiceAudio={startStreaming,stopStreaming,isRecording:()=>isRecording};
})(window);
