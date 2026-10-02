import Link from "next/link";
import { NON_AFFILIATION } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <main className="legal-page shell">
      <Link className="back-link" href="/">← Dandiyaa</Link>
      <div className="eyebrow gold">PRIVACY NOTICE</div>
      <h1>Your details are for the event, not for display.</h1>
      <p className="lede">Dandiyaa is designed so sensitive registration data never needs to become a public profile.</p>

      <section>
        <h2>What we collect</h2>
        <p>Name, selected college, study year, contact detail, PRN/roll number, partner preference, consent records, and—only if you choose to provide it—a social handle.</p>
      </section>
      <section>
        <h2>Why we use it</h2>
        <p>To prevent duplicate registrations, operate the countdown and college-specific matching, reveal your match privately, handle mutual acceptance, and respond to safety or deletion requests. A PRN/roll number entry is not an official college identity-verification service.</p>
      </section>
      <section>
        <h2>What other participants can see</h2>
        <p>Your PRN/roll number is never shown. Your contact and optional social handle remain hidden until both you and your current match accept one another.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>Participation is voluntary. You can reject a pairing, block or report a participant, and request deletion/withdrawal using your private registration code.</p>
      </section>
      <section>
        <h2>Independent program</h2>
        <p>{NON_AFFILIATION}</p>
      </section>
      <section>
        <h2>Contact / grievance</h2>
        <p>The operator should publish a monitored event-support contact before public launch. Until that is configured, the site should remain in pre-release mode.</p>
      </section>
    </main>
  );
}
