import { useEffect, useState } from 'preact/hooks';

interface Link { label: string; href: string }
interface Props {
  links: Link[];
  phone: string;
  phoneHref: string;
  cta: string;
}

export default function MobileMenu({ links, phone, phoneHref, cta }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div class="mm">
      <button
        class="mm__burger"
        aria-expanded={open}
        aria-label={open ? 'Закрыть меню' : 'Меню'}
        onClick={() => setOpen(!open)}
      >
        <span class={open ? 'mm__bars is-open' : 'mm__bars'} aria-hidden="true"><i /><i /><i /></span>
      </button>

      {open && (
        <div class="mm__sheet" role="dialog" aria-modal="true" aria-label="Меню">
          <nav class="mm__nav">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
          </nav>
          <a class="mm__phone" href={phoneHref}>{phone}</a>
          <a class="btn btn--block" href="#final" onClick={() => setOpen(false)}>{cta}</a>
        </div>
      )}
    </div>
  );
}
