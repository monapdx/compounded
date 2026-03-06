import json
import sys

INPUT_FILE = "compounds-clean.json"


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    lookup = {entry["base"]: entry["matches"] for entry in data}

    if len(sys.argv) < 2:
        print("Usage: python inspect_compounds.py apple")
        return

    base = sys.argv[1].strip().lower()

    matches = lookup.get(base)
    if not matches:
        print(f"No matches found for: {base}")
        return

    print(f"{base} ({len(matches)} matches)")
    for m in matches:
        print(f"- {m['partner']} -> {m['compound']}")


if __name__ == "__main__":
    main()