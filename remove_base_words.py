import json

REMOVE_BASES = {"dis", "over", "pro", "anti", "out", "super", "para", "con"}

with open("compounds-clean.json", "r", encoding="utf-8") as f:
    data = json.load(f)

data = [entry for entry in data if entry["base"] not in REMOVE_BASES]

with open("compounds-clean-edited.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Saved compounds-clean-edited.json")