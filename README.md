# Lenni's Animals

Tap-an-animal game for Lenni (5). Each tile plays the animal's sound, then reads out whether it sleeps plus a short fact. Single `index.html`, no build step.

- **Pictures:** Apple/system emoji, plus hand-drawn SVGs for stingray, lemur and springbok (no emoji exists)
- **Animal sounds:** `sounds/<id>.mp3`. 21 are real Wikimedia Commons recordings (trimmed, levelled; see `credits.html`). The other 13 are ElevenLabs AI sound effects
- **Narration:** `voice/<id>.mp3`, ElevenLabs voice "Alice". Falls back to the device voice if a file is missing
- **Regenerate audio:** `node tools/make-audio.cjs --help` style flags are documented at the top of `tools/make-audio.cjs`. API key lives in `~/.elevenlabs-key` (never commit it). `audio-manifest.js` lists which files exist
- **Print as a book:** button at the bottom prints one animal per A4 page (cover + 18 pages)
- **Add an animal:** add an entry to `ANIMALS` in `animals.js`, then run `node tools/make-audio.cjs --voice Alice --sfx`

Sleep facts were written from general knowledge and simplified for a 5 year old. Key ones: upside-down jellyfish sleep-like state (Nath et al., Current Biology, 2017); dolphins' half-brain sleep; fat-tailed dwarf lemur hibernation; sea otters holding hands.
