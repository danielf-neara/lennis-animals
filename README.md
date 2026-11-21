# Lenni's Animals

Tap-an-animal game for Lenni (5). 64 animals. Each tile plays the animal's sound, then reads out whether it sleeps plus a short fact. "Tell me more" on each card adds food, baby name, home and a wow fact. Single `index.html`, no build step.

- **Sound game:** "Who makes this sound?" button. 5 rounds: hear a sound, tap the right animal out of 3. Only uses animals with a real or AI sound file (not the silent ones). Sound-alike animals (dog/wolf/fox etc, see `ALIKE` in `index.html`) are never offered together
- **Pictures:** Apple/system emoji, plus hand-drawn SVGs for animals with no emoji (stingray, lemur, springbok, kookaburra, wombat, platypus, emu, echidna)
- **Animal sounds:** `sounds/<id>.mp3`. 28 are real Wikimedia Commons recordings (trimmed, levelled; see `credits.html`). 13 are ElevenLabs AI sound effects. The 5 newest silent animals (butterfly, ladybird, snail, crab, echidna) have no sound file yet, so the device voice says their line
- **Narration:** `voice/<id>.mp3` (sleep), `voice/<id>-more.mp3` (Tell me more), `voice/game-*.mp3` (game lines). ElevenLabs voice "Alice". Anything missing falls back to the device voice
- **Regenerate audio:** `node tools/make-audio.cjs --help` style flags are documented at the top of `tools/make-audio.cjs`. API key lives in `~/.elevenlabs-key` (never commit it). `audio-manifest.js` lists which files exist
- **Print as a book:** button at the bottom prints one animal per A4 page (cover + 64 pages), including the Tell me more facts
- **Add an animal:** add an entry to `ANIMALS` and a matching entry to `MORE` in `animals.js`, then run `node tools/make-audio.cjs --voice Alice --sfx`
- **Check cost first:** add `--dry-run` to any command to see files and character count without spending credits. Free tier is 10,000 characters a month; "Tell me more" for all animals is about 12,000 on its own

Sleep facts were written from general knowledge and simplified for a 5 year old. Key ones: upside-down jellyfish sleep-like state (Nath et al., Current Biology, 2017); dolphins' half-brain sleep; fat-tailed dwarf lemur hibernation; sea otters holding hands.
