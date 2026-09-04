import { useEffect } from "react";
import PublicBookingWizard from "@/components/booking/PublicBookingWizard";

function BookingShell() {
  useEffect(() => {
    document.title = "Book a Consultation | Nanak Migration Group";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "Book a consultation with a MARA-registered migration agent (MARN 2619467). Choose a time that suits you — no login required.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="book-public-page">
      <header className="book-public-header">
        <div className="book-public-header-inner">
          <div>
            <div className="book-public-brand">Nanak Migration Group</div>
            <div className="book-public-marn">MARA-registered · MARN 2619467</div>
          </div>
          <a className="book-public-site-link" href="https://www.nanakmigration.com.au" rel="noopener noreferrer">
            nanakmigration.com.au
          </a>
        </div>
      </header>

      <main className="book-public-main">
        <div className="book-public-intro">
          <p className="book-public-eyebrow">Self-serve booking</p>
          <h1 className="book-public-title">
            Book your consultation <span>in a few steps</span>
          </h1>
          <p className="book-public-deck">
            Pick a service, choose a time, and tell us a little about your situation. You’ll get confirmation by email —
            no account required.
          </p>
        </div>

        <PublicBookingWizard className="book-public-widget" />

        <p className="book-public-disclaimer">
          This booking form collects your details so Nanak Migration Group can arrange a consultation. Information
          provided is general only and is not immigration assistance or legal advice. Registered Migration Agent Navpreet
          Aulakh · MARN 2619467 · ABN 54 674 937 476.
        </p>
      </main>

      <footer className="book-public-footer">
        <span>© {new Date().getFullYear()} Nanak Migration Group</span>
        <a href="mailto:visa@nanakmigration.com.au">visa@nanakmigration.com.au</a>
        <a href="tel:1300644728">1300 644 728</a>
      </footer>
    </div>
  );
}

/** Public route — no login, no admin chrome. */
export default function PublicBookingPage() {
  return <BookingShell />;
}
