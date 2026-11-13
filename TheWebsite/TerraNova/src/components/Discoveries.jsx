import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { LOCATIONS } from '../data.js';
import { D } from '../motion.js';

const VARIANTS = ['chap--a', 'chap--b', 'chap--c'];

function Scene({ loc }) {
  const [a, b, c] = loc.palette;
  const [hasImg, setHasImg] = useState(true);
  return (
    <div className="scene">
      <div className="sky" style={{ background: `radial-gradient(ellipse at 70% 30%,${c} 0,${b} 38%,${a} 85%)` }} />
      <svg className="ridge" viewBox="0 0 1200 300" preserveAspectRatio="none" height="55%" aria-hidden="true">
        <path d="M0 300V190L110 140L210 185L330 90L450 170L560 120L700 200L820 110L960 175L1080 130L1200 190V300Z" fill={a} opacity=".95" />
        <path d="M0 300V235L140 200L280 240L430 190L600 245L760 205L920 250L1060 215L1200 245V300Z" fill="#05070f" />
      </svg>
      {hasImg && <img src={`${import.meta.env.BASE_URL}assets/loc/${loc.id}.jpg`} alt="" loading="lazy" onError={() => setHasImg(false)} />}
    </div>
  );
}

function Badges({ loc }) {
  const v = loc.status === 'verified';
  return (
    <div className="badges">
      <span className={'chip chip--' + loc.type}>{loc.type === 'mars' ? 'Mars analog' : 'Moon analog'}</span>
      <span className={'tag ' + (v ? 'tag--v' : 'tag--c')}>{v ? 'Verified' : 'Candidate'}</span>
    </div>
  );
}

function Chapter({ loc, idx, onExplore }) {
  return (
    <article className={'chap ' + VARIANTS[idx]}>
      <div className="chap__media"><Scene loc={loc} /></div>
      <div className="chap__num" aria-hidden="true">{String(idx + 1).padStart(2, '0')}</div>
      <div className="chap__txt">
        <Badges loc={loc} />
        <h3>{loc.name}</h3>
        <p className="ctry">{loc.flag} {loc.country}</p>
        <p className="d">{loc.why}</p>
        <div className="strip">
          <div>Elevation<b>{loc.stats[0]}</b></div>
          <div>Climate<b>{loc.stats[1]}</b></div>
          <div>Surface<b>{loc.stats[2]}</b></div>
          <small>Source · {loc.source}</small>
        </div>
        <button className="btn" onClick={() => onExplore(idx)}>Explore location →</button>
      </div>
    </article>
  );
}

export default function Discoveries({ onExplore }) {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.chap').forEach((c) => {
        gsap.to(c.querySelector('.scene'), { scale: 1, yPercent: -3, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(c.querySelectorAll('.chap__txt > *'), { y: 34, autoAlpha: 0, duration: D(1), stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 65%' } });
      });
      gsap.from('.disc__head > *', { y: 30, autoAlpha: 0, duration: D(1), stagger: 0.1, scrollTrigger: { trigger: '.disc__head', start: 'top 80%' } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="disc" id="discoveries" ref={root}>
      <header className="disc__head">
        <p className="eyebrow">Our discoveries</p>
        <h2>Places where Earth impersonates other worlds.</h2>
        <p className="lede">Identified through scientific analysis of NASA datasets. Verified sites are established in research; candidates await field validation.</p>
      </header>
      <div>
        {LOCATIONS.slice(0, 3).map((loc, i) => <Chapter key={loc.id} loc={loc} idx={i} onExplore={onExplore} />)}
      </div>
      <div className="gallery" aria-label="More discoveries">
        {LOCATIONS.slice(3).map((loc, j) => (
          <article className="gcard" key={loc.id}>
            <div className="chap__media"><Scene loc={loc} /></div>
            <div className="chap__txt">
              <Badges loc={loc} />
              <h3>{loc.name}</h3>
              <p className="ctry" style={{ marginBottom: 10 }}>{loc.flag} {loc.country}</p>
              <p className="d" style={{ fontSize: 14, marginBottom: 14 }}>{loc.why.split('. ')[0]}.</p>
              <button className="btn" onClick={() => onExplore(j + 3)}>Explore →</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
