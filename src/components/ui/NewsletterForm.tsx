/**
 * Reusable newsletter signup form.
 * TODO: Replace the mock submit with a real email service call
 *       (Mailchimp, ConvertKit, Buttondown, etc.) when ready.
 *
 * Example integration (Mailchimp):
 *   POST https://us1.api.mailchimp.com/3.0/lists/{list_id}/members
 *   with { email_address, status: 'subscribed' }
 */
import { useState } from 'react';

interface Props {
  inputId?: string;
}

export default function NewsletterForm({ inputId = 'newsletter-email' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // TODO: POST to your email service API here.
    // For now, show a confirmation so the form is never a silent no-op.
    try {
      // Simulate async call
      await Promise.resolve();
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className="newsletter__confirm" role="status">
        ✓ You're on the list! We'll be in touch soon.
      </p>
    );
  }

  return (
    <form className="newsletter__form" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="sr-only">Email address</label>
      <input
        id={inputId}
        type="email"
        className="newsletter__input"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <button type="submit" className="btn btn-primary">
        Subscribe
      </button>
      {status === 'error' && (
        <p className="newsletter__error" role="alert">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
