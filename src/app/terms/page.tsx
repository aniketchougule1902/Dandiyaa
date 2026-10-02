import Link from "next/link";
import { NON_AFFILIATION } from "@/lib/constants";

export default function TermsPage() {
  return (
    <main className="legal-page shell">
      <Link className="back-link" href="/">← Dandiyaa</Link>
      <div className="eyebrow gold">EVENT RULES</div>
      <h1>Keep it fun. Keep it voluntary.</h1>
      <p className="lede">Dandiyaa makes introductions. It does not create an obligation to meet, dance, share contact information, or continue communication.</p>

      <section><h2>18+ participation</h2><p>You may register only if you are at least 18 years old.</p></section>
      <section><h2>College selection</h2><p>Select only your actual college. PCCOE Nigdi and D. Y. Patil Akurdi are maintained as separate matching pools.</p></section>
      <section><h2>Preferences</h2><p>Senior, junior, same-year and anyone choices are preferences. They are not guarantees and the system may use a fallback pairing when required to complete a pool.</p></section>
      <section><h2>Respect and safety</h2><p>Harassment, intimidation, impersonation, stalking, or attempts to bypass another participant&apos;s rejection are not acceptable. Use block/report when needed.</p></section>
      <section><h2>Non-affiliation</h2><p>{NON_AFFILIATION} College names are used only to identify the matching pool. Official logos, crests and endorsement claims are not part of the experience unless separately authorized.</p></section>
    </main>
  );
}
