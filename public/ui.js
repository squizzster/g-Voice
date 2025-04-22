// ui.js – Consolidated UI logic

// --- Configuration ---
const micButtonAppearDuration = 70; // seconds

// --- Particle Configurations ---
const originalParticleOptions = {
  fpsLimit: 60,
  particles: {
    number: { value: 150, density: { enable: true, area: 1000 } },
    color: { value: ['#a45bff', '#c46cff', '#ffffff', '#8a2be2'] },
    shape: { type: ['circle', 'triangle'] },
    opacity: { value: { min: 0.1, max: 0.6 }, animation: { enable: true, speed: 0.8, minimumValue: 0.1 } },
    size:    { value: { min: 1, max: 4 },     animation: { enable: true, speed: 4, minimumValue: 0.5 } },
    move:    { enable: true, speed: 2.5, random: true, straight: false,
               outModes: { default: 'out' },
               trail:    { enable: true, length: 8, fillColor: '#050509' }
             },
    links:   { enable: true, distance: 100, color: 'random', opacity: 0.4, width: 1.5 }
  },
  interactivity: {
    events: { onHover: { enable: true, mode: 'repulse' } },
    modes:  { repulse: { distance: 120, duration: 0.4 } }
  },
  detectRetina: true,
  background:   { color: '#050509' }
};

const crazyParticleOptions1 = {
  fpsLimit: 60,
  particles: {
    number: { value: 250, density: { enable: true, area: 800 } },
    color:  { value: ['#a45bff','#c46cff','#ffffff','#ff80ff','#8a2be2'] },
    shape:  { type: ['circle','triangle','star'] },
    opacity:{ value:{min:0.2,max:0.8}, animation:{enable:true,speed:1.2,minimumValue:0.2} },
    size:   { value:{min:1,max:5},          animation:{enable:true,speed:6,minimumValue:0.5} },
    move:   { enable:true, speed:5, random:true, straight:false,
              outModes:{default:'out'},
              trail:   { enable:true, length:10, fillColor:'#050509' }
            },
    links:  { enable:true, distance:120, color:'random', opacity:0.6, width:2 }
  },
  interactivity: {
    events:{ onHover:{ enable:true, mode:'repulse' }},
    modes:{ repulse:{ distance:150, duration:0.4 }}
  },
  detectRetina:true,
  background:{ color:'#050509' }
};

const crazyParticleOptions2 = {
  fpsLimit: 60,
  particles: {
    number: { value:300, density:{enable:true,area:600} },
    color:  { value:['#ff0000','#ff7f00','#ffff00','#00ff00','#00ffff','#ff00ff','#ffffff'] },
    shape:  { type:'circle' },
    opacity:{ value:{min:0.5,max:1.0} },
    size:   { value:{min:2,max:4} },
    move: {
      enable: true, speed:18, direction:'none', random:true, straight:false,
      outModes:{default:'bounce'},
      attract:{enable:false},
      trail:{enable:false}
    },
    links:{ enable:false }
  },
  interactivity:{
    events:{ onHover:{enable:true,mode:'bubble'}},
    modes:{ bubble:{ distance:100, size:10, opacity:0.8 } }
  },
  detectRetina:true,
  background:{ color:'#050509' }
};

const crazyParticleOptions3 = {
  fpsLimit: 60,
  particles: {
    number: { value:80, density:{enable:true,area:800} },
    color:  { value:['#00ffff','#00ff80','#40e0d0','#ffffff'] },
    shape:  { type:'star' },
    opacity:{ value:{min:0.3,max:0.9} },
    size:   { value:{min:4,max:8}, animation:{enable:true,speed:5,minimumValue:3} },
    move: {
      enable:true, speed:4, direction:'none', random:false, straight:false,
      outModes:{default:'out'},
      attract:{enable:true,rotateX:1200,rotateY:1200,distance:200},
      gravity:{enable:true,acceleration:2},
      trail:{enable:true,length:5,fillColor:'#050509'}
    },
    links:{ enable:false }
  },
  interactivity:{
    events:{ onHover:{enable:true,mode:'push'}},
    modes:{ push:{ quantity:4 } }
  },
  detectRetina:true,
  background:{ color:'#050509' }
};

const crazyParticleOptions4 = {
  fpsLimit: 60,
  particles: {
    number: { value:100, density:{enable:true,area:1000} },
    color:  { value:['#ffffff','#c0c0c0','#87cefa'] },
    shape:  { type:'circle' },
    opacity:{ value:1.0 },
    size:   { value:2 },
    move: {
      enable:true, speed:{min:15,max:25}, direction:'top', random:false, straight:true,
      outModes:{default:'destroy',top:'out'},
      attract:{enable:false},
      trail:{enable:true,length:30,fillColor:'#050509'}
    },
    links:{ enable:false }
  },
  interactivity:{ events:{ onHover:{enable:false}} },
  detectRetina:true,
  background:{ color:'#050509' }
};

const specialEffects = [
  crazyParticleOptions1,
  crazyParticleOptions2,
  crazyParticleOptions3,
  crazyParticleOptions4
];

// Everything runs once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 1) Particles + Tilt
  tsParticles.load('tsparticles', originalParticleOptions);
  VanillaTilt.init(document.querySelector('.container'));

  // 2) Entrance animations
  gsap.from('.logo',     { y:-50, opacity:0, duration:1,    ease:'power3.out' });
  gsap.from('.strapline',{ y: 50, opacity:0, duration:1,delay:0.5, ease:'power3.out' });
  gsap.to(  '.mic-btn',  { scale:1, opacity:1, duration:micButtonAppearDuration, delay:1, ease:'power2.out' });

  // 3) Typing sequence
  const lines = [
    "The future isn't scripted",
    "Conversations are not flow-charts",
    "You need digital consciousness",
    "Conversational intelligence",
    "The DNA of conversation"
  ];
  const taglineEl = document.querySelector('.tagline');
  function typeText(text, speed, done) {
    taglineEl.textContent = '';
    taglineEl.style.borderRight = '.15em solid rgba(196,108,255,0.8)';
    let i = 0;
    const iv = setInterval(() => {
      taglineEl.textContent += text[i++];
      if (i === text.length) {
        clearInterval(iv);
        taglineEl.style.borderRight = 'none';
        done && done();
      }
    }, speed);
  }
  function showLine(idx) {
    const txt = lines[idx];
    const speed = txt === lines[4] ? 300 : 100;
    if (txt === lines[4]) {
      tsParticles.load('tsparticles', specialEffects[0]); //Math.floor(Math.random()*specialEffects.length)]);
    }
    typeText(txt, speed, () => {
      if (txt === lines[4]) tsParticles.load('tsparticles', originalParticleOptions);
      if (idx < lines.length-1) setTimeout(()=>showLine(idx+1), 5000);
      else taglineEl.style.whiteSpace = 'normal';
    });
  }
  showLine(0);

  // 4) Audio animation & streaming
  const micBtn   = document.querySelector('.mic-btn');
  let   audioCtx, analyser, dataArr, isAnimating=false, waveCount=0;
  const MAX_WAVES = 5;

  function animateVoice() {
    if (!audioCtx || audioCtx.state==='closed') {
      gsap.to(micBtn, { scale:1, duration:0.3 });
      isAnimating = false;
      return;
    }
    requestAnimationFrame(animateVoice);
    analyser.getByteFrequencyData(dataArr);
    const avg = dataArr.reduce((a,b)=>a+b,0)/dataArr.length;
    gsap.to(micBtn, { scale:1+(avg/255)*0.3, duration:0.1 });
    if (avg>100 && Math.random()>0.85 && waveCount<MAX_WAVES) {
      waveCount++;
      const w = document.createElement('div');
      w.className = 'wave animate';
      micBtn.appendChild(w);
      w.addEventListener('animationend', () => { w.remove(); waveCount--; });
    }
  }
// UI.js — add these two helpers
function showRecordingUI() {
  micBtn.classList.add('recording');
}

function hideRecordingUI() {
  micBtn.classList.remove('recording');
}

async function startCall() {
  if (!window.gVoiceAudio.isRecording()) {
    // === START RECORDING ===
    await window.gVoiceAudio.startStreaming();
    showRecordingUI();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const src    = audioCtx.createMediaStreamSource(stream);
    analyser     = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    dataArr = new Uint8Array(analyser.frequencyBinCount);
    if (!isAnimating) { isAnimating = true; animateVoice(); }

  } else {
    // === STOP RECORDING ===
    window.gVoiceAudio.stopStreaming();
    hideRecordingUI();
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    isAnimating = false;
  }
}

  micBtn.addEventListener('click', startCall);
  window.addEventListener('beforeunload', () => { if (audioCtx) audioCtx.close(); });
});
