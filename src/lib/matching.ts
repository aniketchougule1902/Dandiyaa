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

function pairCollege(pool: ParticipantForMatching[]) {
  const waiting = shuffle(pool);
  const pairs: Pair[] = [];

  while (waiting.length >= 2) {
    const current = waiting.shift()!;
    let bestIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < waiting.length; i += 1) {
      const candidate = waiting[i];
      const score =
        preferenceScore(current, candidate) +
        preferenceScore(candidate, current);

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      } else if (score === bestScore && randomInt(2) === 1) {
        bestIndex = i;
      }
    }

    const [partner] = waiting.splice(bestIndex, 1);
    pairs.push({
      participantA: current.id,
      participantB: partner.id,
      college: current.college,
      score: Math.max(bestScore, 0)
    });
  }

  return { pairs, unmatched: waiting };
}

export function generatePairs(participants: ParticipantForMatching[]) {
  const pccoe = participants.filter((p) => p.college === "pccoe");
  const dyp = participants.filter((p) => p.college === "dyp");

  const a = pairCollege(pccoe);
  const b = pairCollege(dyp);

  return {
    pairs: [...a.pairs, ...b.pairs],
    unmatched: [...a.unmatched, ...b.unmatched]
  };
}
