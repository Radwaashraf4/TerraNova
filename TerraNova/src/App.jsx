import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createEngine } from './engine.js';
import { LOCATIONS, WORLDS } from './data.js';
import { reduce, D } from './motion.js';
import { Nav, Rail } from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Robot from './components/Robot.jsx';
import Panel from './components/Panel.jsx';
import Speaks from './components/Speaks.jsx';
import Discoveries from './components/Discoveries.jsx';
import { Resources, Footer } from './components/Resources.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const canvasRef = useRef(null);
  const tagRef = useRef(null);
  const engine = useRef(null);
  const timers = useRef([]);
  const [ready, setReady] = useState(false);
  const [world, setWorld] = useState(null);   // null | 'earth' | 'mars' | 'moon'
  const [locIdx, setLocIdx] = useState(null); // null | index into LOCATIONS

  /* Create / destroy the Three.js engine */
  useEffect(() => {
    engine.current = createEngine(canvasRef.current, {
      tagEl: tagRef.current,
      onReady: () => setReady(true),
      onSelectWorld: (key) => { setWorld(key); setLocIdx(null); },
      onOpenLocation: (idx) => setLocIdx(idx)
    });
    return () => { engine.current?.destroy(); engine.current = null; };
  }, []);

  /* Sync React state into the engine (world first, then location) */
  useEffect(() => { engine.current?.setWorld(world); }, [world]);
  useEffect(() => { engine.current?.focusLocation(locIdx); }, [locIdx]);

  /* Body hooks the stylesheet relies on */
  useEffect(() => { document.body.dataset.world = world ?? 'none'; }, [world]);
  useEffect(() => { document.body.classList.toggle('panel-open', locIdx != null); }, [locIdx]);

  /* Escape closes the discovery */
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setLocIdx(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Fade the canvas and pause rendering once the hero is scrolled away */
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#home', start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: (self) => engine.current?.setScroll(self.progress)
      });
    });
    return () => ctx.revert();
  }, []);

  /* Hero copy entrance once textures are in */
  useEffect(() => {
    if (!ready) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.hero__copy > *', { y: 26, autoAlpha: 0, duration: D(1), stagger: 0.12, delay: 0.7, ease: 'power3.out' });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [ready]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const selectWorld = useCallback((key) => { setWorld(key); setLocIdx(null); }, []);
  const reset = useCallback(() => { setWorld(null); setLocIdx(null); }, []);

  /* "Explore location" from the Discoveries section */
  const explore = useCallback((idx) => {
    timers.current.forEach(clearTimeout);
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    engine.current?.setScroll(0);
    timers.current = [
      setTimeout(() => setWorld('earth'), reduce ? 0 : 700),
      setTimeout(() => setLocIdx(idx), reduce ? 50 : 1900)
    ];
  }, []);

  /* Robot script follows the current state */
  const script = useMemo(() => {
    if (locIdx != null) {
      const loc = LOCATIONS[locIdx];
      return {
        lines: [loc.line, `Verdict: ${loc.type === 'mars' ? 'Mars' : 'Moon'} analog. ${loc.status === 'verified' ? 'Verified by research.' : 'Still a candidate. Needs field research.'}`],
        during: 'discovery', after: 'explaining'
      };
    }
    if (world) {
      const w = WORLDS[world];
      return { lines: w.intro, during: w.mood, after: world === 'earth' ? 'explaining' : 'speaking' };
    }
    return null;
  }, [world, locIdx]);

  return (
    <>
      <canvas id="scene" ref={canvasRef} aria-hidden="true" />
      <div className={'boot' + (ready ? ' is-off' : '')}><span>PLANETARY EXPLORERS</span></div>
      <Nav />
      <Rail />
      <main>
        <Hero world={world} onSelect={selectWorld} onBack={reset} tagRef={tagRef}>
          <Robot script={script} scriptKey={`${world}:${locIdx}`} />
        </Hero>
        <Speaks />
        <Discoveries onExplore={explore} />
        <Resources />
      </main>
      <Footer />
      <Panel idx={locIdx} onClose={() => setLocIdx(null)} />
    </>
  );
}
