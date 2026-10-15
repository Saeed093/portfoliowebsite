import { useEffect, useState } from 'react';
import { Wordmark } from './Editorial.jsx';

// Contact: the "every system" line, with direct details and a live availability clock beside it.

function ContactRow({ label, value, href, copyValue }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue || value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      const el = document.getElementById('cv-' + value);
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }
  };
  return (
    <div className="contact-row">
      <span className="contact-label">{label}</span>
      <a id={'cv-' + value} href={href} className="contact-value">{value}</a>
      <button type="button" className="copy" onClick={copy}>{done ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

// Subtle live clock: it's always a good time to reach out.
function Availability() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const time = t.toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: false });
  const hour = parseInt(time.slice(0, 2), 10);
  const awake = hour >= 8 && hour < 24;
  return (
    <div className="availability">
      <span className="av-dot" aria-hidden="true" />
      <p>
        <b>{time}</b> in Islamabad (PKT).{' '}
        {awake ? 'I’m around — message now.' : 'Late here, but I reply first thing.'}
        <br />
        <span>Any hour, any time zone.</span>
      </p>
    </div>
  );
}

export default function ContactSection({ contact }) {
  return (
    <section className="contact contact-v2 contact-v3" id="contact" data-domain="contact">
      <div className="cv-intro">
        <h2 className="cv-shipped">
          <span>Every system</span>
          <span className="i1">I’ve shipped</span>
          <span>started as</span>
          <span className="i2 out">nothing more</span>
          <span className="i3">than a requirement.</span>
        </h2>
        <div className="cv-side">
          <p className="contact-kicker">Write directly</p>
          <div className="contact-list">
            {contact.emails.map((e) => (
              <ContactRow key={e} label="Email" value={e} href={`mailto:${e}`} />
            ))}
            <ContactRow label="Phone / WhatsApp" value={contact.phone} copyValue={contact.phoneRaw} href={`tel:${contact.phoneRaw}`} />
          </div>
          <Availability />
        </div>
      </div>
      <Wordmark />
      <footer>
        <span>’{String(new Date().getFullYear()).slice(2)} © All rights reserved</span>
        <span>What did it cost? My sanity and a few months.</span>
      </footer>
    </section>
  );
}
