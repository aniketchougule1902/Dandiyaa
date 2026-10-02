import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { ScrollFrames } from "@/components/ScrollFrames";
import { AGE_NOTICE, NON_AFFILIATION } from "@/lib/constants";

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/">DANDIYAA<span>.</span></Link>
        <div className="nav-links">
          <Link href="/match">My match</Link>
          <Link className="pill small" href="/register">Join the night</Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow gold">TWO COLLEGES • TWO DANCE FLOORS • ZERO AWKWARD MIXING</div>
          <h1>Your <em>dandiya</em> partner is one countdown away.</h1>
          <p className="lede">
            Join your own college pool, choose who you&apos;d vibe with, and let the night do the rest.
            Your contact stays private until both of you say yes.
          </p>
          <div className="hero-actions">
            <Link className="pill primary" href="/register">Enter the dance floor</Link>
            <Link className="text-link" href="/match">Already registered? Find my match →</Link>
          </div>
          <div className="trust-row">
            <span>18+ only</span>
            <span>Same-college matching</span>
            <span>Mutual contact reveal</span>
          </div>
        </div>
        <ScrollFrames />
      </section>

      <section className="shell countdown-wrap">
        <Countdown />
      </section>

      <section className="shell story-grid">
        <article className="story-card accent">
          <span>01</span>
          <h2>Pick your college</h2>
          <p>PCCOE Nigdi dancers stay with PCCOE. D. Y. Patil Akurdi dancers stay with DYP. The pools never merge.</p>
        </article>
        <article className="story-card">
          <span>02</span>
          <h2>Set your vibe</h2>
          <p>Choose senior, junior, same-year, or anyone. It is a preference—not a guarantee—so nobody gets stranded when numbers are uneven.</p>
        </article>
        <article className="story-card">
          <span>03</span>
          <h2>Both say yes</h2>
          <p>Your match can see your basic profile first. Contact or optional social details unlock only after mutual acceptance.</p>
        </article>
      </section>

      <section className="shell safety-panel">
        <div>
          <div className="eyebrow">BUILT FOR A FUN NIGHT, NOT A PRESSURE TEST</div>
          <h2>You always keep the exit door.</h2>
        </div>
        <div className="safety-points">
          <p>Reject or rematch if the pairing does not feel right.</p>
          <p>Block and report are available from the match screen.</p>
          <p>{AGE_NOTICE}</p>
        </div>
      </section>

      <footer className="footer shell">
        <div>
          <div className="brand">DANDIYAA<span>.</span></div>
          <p>{NON_AFFILIATION}</p>
        </div>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Event rules</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </footer>
    </main>
  );
}
