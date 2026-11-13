import { useEffect, useRef, useState } from 'react';
import { LOCATIONS } from '../data.js';

const fmtCoords = (lat, lon) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

export default function Panel({ idx, onClose }) {
  const open = idx != null;
  const lastIdx = useRef(0);
  if (open) lastIdx.current = idx; // keep content while sliding out
  const shownIdx = lastIdx.current;
  const loc = LOCATIONS[shownIdx];
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [idx]);

  const v = loc.status === 'verified';
  const dx = 0.7, dy = 0.45;
  const mapSrc = open
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${loc.lon - dx},${loc.lat - dy},${loc.lon + dx},${loc.lat + dy}&layer=mapnik`
    : undefined;

  return (
    <aside className={'panel' + (open ? ' is-open' : '')} aria-label="Discovery details" aria-hidden={!open}>
      <div className="panel__grip" aria-hidden="true" />
      <div className="panel__top">
        <span className="mono">Discovery {String(shownIdx + 1).padStart(2, '0')} / {String(LOCATIONS.length).padStart(2, '0')}</span>
        <span className={'tag ' + (v ? 'tag--v' : 'tag--c')}>{v ? 'Verified' : 'Candidate'}</span>
        <button className="x" onClick={onClose} aria-label="Close discovery" tabIndex={open ? 0 : -1}>✕</button>
      </div>
      <h3>{loc.name}</h3>
      <p className="panel__sub">{loc.flag} {loc.country} · <span className="mono">{fmtCoords(loc.lat, loc.lon)}</span></p>
      <span className={'chip chip--' + loc.type}>{loc.type === 'mars' ? 'Mars analog' : 'Moon analog'}</span>
      <dl className="spec">
        <div><dt>Terrain</dt><dd>{loc.terrain}</dd></div>
        <div><dt>Climate</dt><dd>{loc.climate}</dd></div>
        <div><dt>Mineralogy</dt><dd>{loc.mineral}</dd></div>
        <div><dt>Notable</dt><dd>{loc.feature}</dd></div>
      </dl>
      <h4>Why scientists care</h4>
      <p id="pWhy">{loc.why}</p>
      {!v && <p className="note">Identified by data analysis. Field validation pending.</p>}
      <div className="map">
        <iframe title="Map preview" src={mapSrc} loading="lazy" referrerPolicy="no-referrer" />
        <i className="map__pin" />
      </div>
      <div className="panel__act">
        <a className="btn" target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}
          href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lon}#map=8/${loc.lat}/${loc.lon}`}>Explore on map ↗</a>
        <button className="link link--cy" aria-expanded={more} onClick={() => setMore((m) => !m)}>More details</button>
      </div>
      {more && (
        <div className="more">
          {[['Elevation', loc.stats[0]], ['Climate class', loc.stats[1]], ['Surface', loc.stats[2]], ['Source', loc.source]].map(([a, b]) => (
            <div key={a}><span>{a}</span><span>{b}</span></div>
          ))}
        </div>
      )}
    </aside>
  );
}
