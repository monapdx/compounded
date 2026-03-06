import json
import nltk
from nltk.corpus import wordnet as wn


OUTPUT_FILE = "noun_words.json"


def main():
    print("Downloading WordNet if needed...")
    nltk.download("wordnet")
    nltk.download("omw-1.4")

    noun_words = set()

    print("Building noun set from WordNet...")
    for syn in wn.all_synsets("n"):
        for lemma in syn.lemma_names():
            word = lemma.lower().replace("_", "")
            if word.isalpha():
                noun_words.add(word)

    noun_list = sorted(noun_words)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(noun_list, f)

    print(f"Saved {OUTPUT_FILE}")
    print(f"Noun count: {len(noun_list):,}")


if __name__ == "__main__":
    main()