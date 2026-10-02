import { randomInt } from "node:crypto";

export type ParticipantForMatching = {
  id: string;
  college: "pccoe" | "dyp";
  year: number;
  preference: "senior" | "junior" | "same_year" | "any";
};

export type Pair = {
  participantA: string;
  participantB: string;
  college: "pccoe" | "dyp";
  score: number;
};

export function pairKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

function preferenceScore(
  person: ParticipantForMatching,
  candidate: ParticipantForMatching
) {
  if (person.preference === "any") return 2;
  if (person.preference === "same_year") return person.year === candidate.year ? 3 : 0;
  if (person.preference === "senior") return candidate.year > person.year ? 3 : 0;
  if (person.preference === "junior") return candidate.year < person.year ? 3 : 0;
  return 0;
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pairCollege(
  pool: ParticipantForMatching[],
  excludedPairs: ReadonlySet<string>
) {
  const waiting = shuffle(pool);
  const pairs: Pair[] = [];
  const unmatched: ParticipantForMatching[] = [];

  while (waiting.length >= 2) {
    const current = waiting.shift()!;
    const eligible = waiting
      .map((candidate, index) => ({
        candidate,
        index,
        score:
          preferenceScore(current, candidate) +
          preferenceScore(candidate, current)
      }))
      .filter(({ candidate }) => !excludedPairs.has(pairKey(current.id, candidate.id)));

    if (!eligible.length) {
      unmatched.push(current);
      continue;
    }

    let best = eligible[0];
    for (const option of eligible.slice(1)) {
      if (
        option.score > best.score ||
        (option.score === best.score && randomInt(2) === 1)
      ) {
        best = option;
      }
    }

    const [partner] = waiting.splice(best.index, 1);
    pairs.push({
      participantA: current.id,
      participantB: partner.id,
      college: current.college,
      score: Math.max(best.score, 0)
    });
  }

  unmatched.push(...waiting);
  return { pairs, unmatched };
}

export function generatePairs(
  participants: ParticipantForMatching[],
  excludedPairs: ReadonlySet<string> = new Set()
) {
  const pccoe = participants.filter((p) => p.college === "pccoe");
  const dyp = participants.filter((p) => p.college === "dyp");

  const a = pairCollege(pccoe, excludedPairs);
  const b = pairCollege(dyp, excludedPairs);

  return {
    pairs: [...a.pairs, ...b.pairs],
    unmatched: [...a.unmatched, ...b.unmatched]
  };
}
