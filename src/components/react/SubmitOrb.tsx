import { useEffect, useState } from 'react';
import { ThinkingOrb } from 'thinking-orbs';

// Puente simple evento-DOM -> estado de React: el form vive en un <script>
// vanilla (Astro, sin React), así que en vez de props hidratadas pasamos el
// estado de "enviando" vía CustomEvent — ContactForm.astro lo dispara antes
// del fetch y al terminar.
export default function SubmitOrb({ label }: { label: string }) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onSubmitting = (event: Event) => {
      setSubmitting(Boolean((event as CustomEvent<boolean>).detail));
    };
    document.addEventListener('contact-form:submitting', onSubmitting);
    return () => document.removeEventListener('contact-form:submitting', onSubmitting);
  }, []);

  if (!submitting) return null;
  return <ThinkingOrb state="working" size={20} theme="light" aria-label={label} />;
}
