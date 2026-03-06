import json
from collections import defaultdict

INPUT_FILE = "wordlist.txt"
NOUN_FILE = "noun_words.json"
OUTPUT_FILE = "compounds-clean.json"

MIN_LEFT_LEN = 3
MIN_RIGHT_LEN = 3
MIN_COMPOUND_LEN = 6
MIN_MATCHES_PER_BASE = 5
MAX_MATCHES_PER_BASE = 499

BAD_PARTS = {
    "ing", "ed", "er", "ers", "est", "ly", "ness", "ment", "ments",
    "tion", "tions", "sion", "sions", "able", "ible", "al", "ial",
    "y", "ty", "ity", "ies", "es", "s", "ism", "ist", "ists",
    "ship", "ships", "hood", "less", "ful", "ward", "wards",
    "dom", "ive", "ous", "ion", "ions", "ance", "ence"
}


def normalize_word(line: str):
    word = line.strip().lower()

    if not word:
        return None

    if word.endswith(","):
        word = word[:-1].strip()

    if len(word) >= 2 and word[0] == '"' and word[-1] == '"':
        word = word[1:-1].strip()

    if not word.isalpha():
        return None

    return word


def load_words(path):
    words = set()

    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            word = normalize_word(line)
            if not word:
                continue
            if len(word) < min(MIN_LEFT_LEN, MIN_RIGHT_LEN):
                continue
            if word in BAD_PARTS:
                continue
            words.add(word)

    return words


def load_nouns(path):
    with open(path, "r", encoding="utf-8") as f:
        noun_list = json.load(f)
    return set(noun_list)


def singularize_simple(word: str) -> str:
    if len(word) <= 3:
        return word

    if word.endswith("ies") and len(word) > 4:
        return word[:-3] + "y"

    if word.endswith("es") and len(word) > 4:
        return word[:-2]

    if word.endswith("s") and not word.endswith("ss") and len(word) > 3:
        return word[:-1]

    return word


def partner_group_key(partner: str) -> str:
    return singularize_simple(partner)


def choose_better_match(existing, candidate):
    existing_partner = existing["partner"]
    candidate_partner = candidate["partner"]

    existing_singular = singularize_simple(existing_partner)
    candidate_singular = singularize_simple(candidate_partner)

    existing_is_exact = existing_partner == existing_singular
    candidate_is_exact = candidate_partner == candidate_singular

    if candidate_is_exact and not existing_is_exact:
        return candidate
    if existing_is_exact and not candidate_is_exact:
        return existing

    if len(candidate_partner) < len(existing_partner):
        return candidate
    if len(existing_partner) < len(candidate_partner):
        return existing

    if len(candidate["compound"]) < len(existing["compound"]):
        return candidate
    if len(existing["compound"]) < len(candidate["compound"]):
        return existing

    return min(existing, candidate, key=lambda x: (x["partner"], x["compound"]))


def find_compounds(words, nouns):
    grouped = defaultdict(list)

    for compound in words:
        if len(compound) < MIN_COMPOUND_LEN:
            continue

        # compound itself must be a noun
        if compound not in nouns:
            continue

        for i in range(MIN_LEFT_LEN, len(compound) - MIN_RIGHT_LEN + 1):
            left = compound[:i]
            right = compound[i:]

            if left not in words or right not in words:
                continue

            if left in BAD_PARTS or right in BAD_PARTS:
                continue

            # both halves must be nouns
            if left not in nouns or right not in nouns:
                continue

            grouped[left].append({
                "partner": right,
                "compound": compound
            })

    return grouped


def clean_grouped(grouped):
    output = []

    for base, matches in grouped.items():
        exact_seen = set()
        exact_matches = []

        for m in matches:
            key = (m["partner"], m["compound"])
            if key in exact_seen:
                continue
            exact_seen.add(key)
            exact_matches.append(m)

        collapsed = {}

        for m in exact_matches:
            group_key = partner_group_key(m["partner"])
            if group_key not in collapsed:
                collapsed[group_key] = m
            else:
                collapsed[group_key] = choose_better_match(collapsed[group_key], m)

        clean_matches = list(collapsed.values())
        clean_matches.sort(key=lambda x: (x["partner"], x["compound"]))

        if len(clean_matches) > MAX_MATCHES_PER_BASE:
            continue

        if len(clean_matches) >= MIN_MATCHES_PER_BASE:
            output.append({
                "base": base,
                "matches": clean_matches
            })

    output.sort(key=lambda x: (-len(x["matches"]), x["base"]))
    return output


def main():
    print("Loading dictionary words...")
    words = load_words(INPUT_FILE)
    print(f"Loaded words: {len(words):,}")

    print("Loading noun set...")
    nouns = load_nouns(NOUN_FILE)
    print(f"Loaded nouns: {len(nouns):,}")

    print("Finding noun+noun compounds where compound is also a noun...")
    grouped = find_compounds(words, nouns)

    result = clean_grouped(grouped)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    total_bases = len(result)
    total_matches = sum(len(entry["matches"]) for entry in result)

    print(f"\nSaved {OUTPUT_FILE}")
    print(f"Base words: {total_bases:,}")
    print(f"Compound matches: {total_matches:,}")

    print("\nSample entries:")
    for entry in result[:15]:
        partners = ", ".join(m["partner"] for m in entry["matches"][:5])
        print(f"{entry['base']}: {partners}")


if __name__ == "__main__":
    main()