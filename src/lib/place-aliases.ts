/**
 * Common South African place aliases so a shopper typing "JHB" still finds
 * Johannesburg stockists. Keys and values are compared lower-case.
 */
const ALIASES: Record<string, string[]> = {
  jhb: ["johannesburg", "gauteng"],
  joburg: ["johannesburg"],
  jozi: ["johannesburg"],
  egoli: ["johannesburg"],
  cpt: ["cape town", "western cape"],
  "kaapstad": ["cape town"],
  "mother city": ["cape town"],
  pta: ["pretoria", "tshwane", "gauteng"],
  tshwane: ["pretoria"],
  pretoria: ["tshwane"],
  dbn: ["durban", "kwazulu-natal"],
  durbs: ["durban"],
  ethekwini: ["durban"],
  pe: ["port elizabeth", "gqeberha", "eastern cape"],
  gqeberha: ["port elizabeth"],
  "port elizabeth": ["gqeberha"],
  bloem: ["bloemfontein", "free state"],
  pmb: ["pietermaritzburg", "kwazulu-natal"],
  gp: ["gauteng"],
  wc: ["western cape"],
  ec: ["eastern cape"],
  kzn: ["kwazulu-natal"],
  nc: ["northern cape"],
  nw: ["north west"],
  fs: ["free state"],
  mp: ["mpumalanga"],
  lp: ["limpopo"],
};

/** The search term plus any aliases it implies. All lower-case, deduplicated. */
export function expandSearchTerms(raw: string): string[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const terms = new Set<string>([q]);
  for (const alias of ALIASES[q] ?? []) terms.add(alias);
  // Also match when the typed value is an alias target, e.g. "johannesburg" → "jhb".
  for (const [key, targets] of Object.entries(ALIASES)) {
    if (targets.includes(q)) terms.add(key);
  }
  return [...terms];
}

/** True when any expanded term appears in the haystack. */
export function matchesSearch(haystack: string, raw: string): boolean {
  const terms = expandSearchTerms(raw);
  if (terms.length === 0) return true;
  const hay = haystack.toLowerCase();
  return terms.some((t) => hay.includes(t));
}
