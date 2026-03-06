import json

REMOVE_MATCHES = {
    "apple": {"jack"},
    "back": {"ache"}
}

with open("compounds-clean.json", "r", encoding="utf-8") as f:
    data = json.load(f)

new_data = []

for entry in data:
    base = entry["base"]
    matches = entry["matches"]

    if base in REMOVE_MATCHES:
        matches = [
            m for m in matches
            if m["partner"] not in REMOVE_MATCHES[base]
        ]

    if matches:
        new_data.append({
            "base": base,
            "matches": matches
        })

with open("compounds-clean-edited.json", "w", encoding="utf-8") as f:
    json.dump(new_data, f, indent=2)

print("Saved compounds-clean-edited.json")