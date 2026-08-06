import { useState, FormEvent } from 'react';

const WEBHOOK_URL = 'https://removable-seventh-duck-reviewer.trycloudflare.com/webhook/itinerary-request';

export default function ItineraryFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data: Record<string, string> = {};
    new FormData(e.currentTarget).forEach((v, k) => { data[k] = v as string; });
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      alert('Something went wrong — please email larielles818@gmail.com with your trip details.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: 'linear-gradient(160deg,#0d1b2a,#1a3a5c)', color: '#fff', textAlign: 'center', padding: '3rem 1.5rem 2.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Payment confirmed — thank you!</h1>
        <p style={{ color: '#a8c4d4', fontFamily: 'sans-serif', fontWeight: 300, margin: 0 }}>Fill out your trip details below and your itinerary will arrive within 24 hours.</p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {submitted ? (
          <div style={{ background: '#fff', border: '1px solid #c9a84c', borderRadius: 10, padding: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#0d1b2a', marginBottom: '0.75rem' }}>We've got your trip details! 🌍</h2>
            <p style={{ color: '#555', fontFamily: 'sans-serif', lineHeight: 1.6 }}>Your custom itinerary will be in your inbox within 24 hours.<br />Questions? Email <a href="mailto:larielles818@gmail.com">larielles818@gmail.com</a></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {card('About you', <>
              <Field label="Your name" name="name" type="text" placeholder="First name is fine" required />
              <Field label="Your email address" name="email" type="email" placeholder="We'll send your itinerary here" required />
            </>)}

            {card('Your trip', <>
              <Field label="Destination" name="destination" type="text" placeholder="e.g. Bali, Indonesia — or be specific: Ubud + Seminyak" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Arrival date" name="start_date" type="date" required />
                <Field label="Departure date" name="end_date" type="date" required />
              </div>
              <Field label="Number of travelers" name="group_size" type="number" defaultValue="2" min="1" max="20" required />
              <SelectField label="Who's traveling?" name="group_type" options={['Solo','Couple','Family with young kids','Family with older kids / teens','Group of friends','Business / bleisure']} required />
            </>)}

            {card('Your style & budget', <>
              <SelectField label="Travel vibe" name="vibe" options={['Adventure / outdoors','Culture / history / museums','Food & restaurants','Relaxation / beach / spa','Nightlife & social','Mix of everything']} required />
              <SelectField label="Preferred pace" name="pace" options={['Packed — I want to see everything','Balanced — busy days with downtime','Relaxed — quality over quantity']} required />
              <SelectField label="Daily budget per person (USD)" name="budget" options={['Under $75/day — budget traveler','$75–$150/day — mid-range','$150–$300/day — comfortable','$300+/day — luxury']} required />
            </>)}

            {card('Anything else?', <>
              <label style={labelStyle}>Special requests, dietary needs, must-see places, things to avoid</label>
              <textarea name="notes" rows={4} style={inputStyle} placeholder="e.g. We have a 4-year-old so nothing too intense. My partner is vegetarian." />
              <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.25rem', fontFamily: 'sans-serif' }}>Optional but helpful — the more detail, the better the itinerary.</p>
            </>)}

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', background: '#c9a84c', color: '#0d1b2a', fontFamily: 'sans-serif', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: 5, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1 }}>
              {submitting ? 'Sending…' : 'Send my trip details →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888', marginTop: '1rem', fontFamily: 'sans-serif' }}>Your itinerary arrives within 24 hours.</p>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.35rem', marginTop: '1rem', fontFamily: 'sans-serif' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d0c9be', borderRadius: 5, fontFamily: 'sans-serif', fontSize: '0.95rem', color: '#1a1a1a', background: '#faf8f5', boxSizing: 'border-box' };

function Field({ label, name, type, placeholder, required, defaultValue, min, max }: { label: string; name: string; type: string; placeholder?: string; required?: boolean; defaultValue?: string; min?: string; max?: string }) {
  return <>
    <label style={labelStyle}>{label}</label>
    <input type={type} name={name} placeholder={placeholder} required={required} defaultValue={defaultValue} min={min} max={max} style={inputStyle} />
  </>;
}

function SelectField({ label, name, options, required }: { label: string; name: string; options: string[]; required?: boolean }) {
  return <>
    <label style={labelStyle}>{label}</label>
    <select name={name} required={required} style={inputStyle} defaultValue="">
      <option value="" disabled>— Select —</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </>;
}

function card(title: string, children: React.ReactNode) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0d9ce', borderRadius: 10, padding: '2rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#0d1b2a', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e0d9ce', marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  );
}