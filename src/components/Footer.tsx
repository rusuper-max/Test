import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/40">
      <Container className="py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="font-serif text-xl">
            Studio <span className="text-accent-grad">Contrast</span>
          </div>

          {/* neutralna poruka (ne samo B/W) */}
          <p className="text-white/70">
            Prirodni momenti — foto &amp; video u boji i crno-belo.
          </p>

          <nav className="mt-1 flex flex-wrap items-center justify-center gap-6">
            <Link href="/portfolio" className="navlink navlink--accent">Portfolio</Link>
            <Link href="/ponude" className="navlink navlink--accent">Ponude</Link>
            <Link href="/kontakt" className="navlink navlink--accent">Kontakt</Link>
            <a
              href="https://www.instagram.com/studio_contrast_031/"
              target="_blank"
              rel="noopener noreferrer"
              className="navlink navlink--accent inline-flex items-center gap-2"
              aria-label="Instagram — otvara se u novom tabu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a6 6 0 1 1 0 12a6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM18 6.2a1 1 0 1 1 0 2a1 1 0 0 1 0-2z"/>
              </svg>
              Instagram
            </a>
          </nav>

          <div className="divider w-full max-w-5xl" />

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Studio Contrast — Dostupni širom regiona
          </p>
        </div>
      </Container>
    </footer>
  );
}