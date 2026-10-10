import { useEffect, useRef, useState } from "react";
import { CloudRain, Waves, Music2, Play, Pause, Volume2, Wind, Sparkles } from "lucide-react";

const soundOptions = [
  { id: "rain", label: "Gentle rain", detail: "A soft, steady rain-like sound", Icon: CloudRain },
  { id: "ocean", label: "Ocean waves", detail: "Slow, wave-like ambient noise", Icon: Waves },
  { id: "tones", label: "Soft tones", detail: "Quiet, mellow layered tones", Icon: Music2 }
];

function stopNodes(nodes) {
  if (!nodes) return;
  nodes.forEach((node) => {
    try { if (typeof node.stop === "function") node.stop(); } catch {}
    try { node.disconnect(); } catch {}
  });
}

export default function RelaxationSpace() {
  const [sound, setSound] = useState("rain");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(28);
  const [breathing, setBreathing] = useState(false);
  const contextRef = useRef(null);
  const nodesRef = useRef([]);
  const outputRef = useRef(null);

  function stopSound() {
    stopNodes(nodesRef.current);
    nodesRef.current = [];
    outputRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") context.close().catch(() => {});
    setIsPlaying(false);
  }

  async function startSound(selected = sound) {
    stopNodes(nodesRef.current);
    nodesRef.current = [];
    if (contextRef.current && contextRef.current.state !== "closed") {
      await contextRef.current.close().catch(() => {});
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    contextRef.current = context;
    await context.resume();
    const output = context.createGain();
    output.gain.value = volume / 100 * 0.22;
    output.connect(context.destination);
    outputRef.current = output;
    const nodes = [output];

    if (selected === "tones") {
      [174.61, 220, 261.63].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const toneGain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        toneGain.gain.value = index === 0 ? 0.22 : 0.12;
        oscillator.connect(toneGain);
        toneGain.connect(output);
        oscillator.start();
        nodes.push(oscillator, toneGain);
      });
    } else {
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.55;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = selected === "rain" ? "bandpass" : "lowpass";
      filter.frequency.value = selected === "rain" ? 1500 : 380;
      filter.Q.value = selected === "rain" ? 0.55 : 0.35;
      const textureGain = context.createGain();
      textureGain.gain.value = selected === "rain" ? 0.36 : 0.48;
      source.connect(filter);
      filter.connect(textureGain);
      textureGain.connect(output);
      source.start();
      nodes.push(source, filter, textureGain);

      if (selected === "ocean") {
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        lfo.type = "sine";
        lfo.frequency.value = 0.12;
        lfoGain.gain.value = 0.12;
        lfo.connect(lfoGain);
        lfoGain.connect(textureGain.gain);
        lfo.start();
        nodes.push(lfo, lfoGain);
      }
    }

    nodesRef.current = nodes;
    setIsPlaying(true);
  }

  useEffect(() => {
    if (outputRef.current && contextRef.current) {
      outputRef.current.gain.setTargetAtTime((volume / 100) * 0.22, contextRef.current.currentTime, 0.08);
    }
  }, [volume]);

  useEffect(() => () => {
    stopNodes(nodesRef.current);
    if (contextRef.current && contextRef.current.state !== "closed") contextRef.current.close().catch(() => {});
  }, []);

  async function toggleSound() {
    if (isPlaying) stopSound();
    else await startSound(sound);
  }

  async function chooseSound(id) {
    setSound(id);
    if (isPlaying) await startSound(id);
  }

  return (
    <section className="rest-section" id="rest">
      <div className="rest-wrap section-wrap">
        <div className="rest-heading">
          <span className="rest-eyebrow"><Sparkles size={14} /> A MOMENT JUST FOR YOU</span>
          <h2>Take some <span>rest.</span></h2>
          <p>You don't have to solve everything right now. Pause for a moment, find a sound you like, and let this be enough.</p>
        </div>

        <div className="rest-panel">
          <div className="rest-scene" aria-hidden="true">
            <div className="rest-moon" />
            <div className="rest-star star-a">✦</div><div className="rest-star star-b">✧</div><div className="rest-star star-c">·</div>
            <div className="rest-hill hill-back" /><div className="rest-hill hill-front" />
            <div className="rest-scene-copy"><span>YOU CAN SLOW DOWN</span><strong>One breath at a time.</strong></div>
          </div>
          <div className="rest-controls">
            <div className="rest-sound-top"><div><span className="eyebrow">CHOOSE YOUR AMBIENCE</span><h3>A softer soundscape</h3></div><span className={`rest-live ${isPlaying ? "is-playing" : ""}`}><i /> {isPlaying ? "Playing" : "Ready when you are"}</span></div>
            <div className="rest-sound-options">
              {soundOptions.map(({ id, label, detail, Icon }) => (
                <button type="button" key={id} className={`rest-sound-option ${sound === id ? "active" : ""}`} onClick={() => chooseSound(id)} aria-pressed={sound === id}>
                  <span className="rest-sound-icon"><Icon size={20} /></span><span className="rest-sound-label"><strong>{label}</strong><small>{detail}</small></span>
                </button>
              ))}
            </div>
            <div className="rest-player-row">
              <button type="button" className="rest-play-button" onClick={toggleSound} aria-label={isPlaying ? "Stop ambient sound" : "Play ambient sound"}>{isPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}{isPlaying ? "Pause sounds" : "Play sounds"}</button>
              <label className="rest-volume"><Volume2 size={17} /><span className="sr-only">Ambient sound volume</span><input type="range" min="0" max="70" value={volume} onChange={e => setVolume(Number(e.target.value))} aria-label="Ambient sound volume" /><span>{volume}%</span></label>
            </div>
            <p className="rest-audio-note"><Wind size={14} /> These are gentle, computer-generated ambient sounds, not recordings. Audio starts only when you press play.</p>
          </div>
        </div>

        <div className={`breath-card ${breathing ? "breath-active" : ""}`}>
          <div className="breath-copy"><span className="eyebrow">A GENTLE BREATHING PAUSE</span><h3>Let your shoulders soften.</h3><p>Follow the circle if it feels comfortable. Breathe naturally; you can stop whenever you like.</p><button type="button" className="rest-breath-button" onClick={() => setBreathing(value => !value)}>{breathing ? "Pause breathing guide" : "Start breathing guide"}</button></div>
          <div className="breath-visual" aria-label={breathing ? "Breathing animation active" : "Breathing animation paused"}><div className="breath-orbit"><div className="breath-circle"><span>{breathing ? "Breathe gently" : "Take a breath"}</span></div></div><small>{breathing ? "Inhale as it grows · exhale as it softens" : "Start when you're ready"}</small></div>
        </div>
        <p className="rest-disclaimer">A small pause, not a cure-all. If breathing exercises feel uncomfortable, stop and try simply noticing the room around you.</p>
      </div>
    </section>
  );
}
