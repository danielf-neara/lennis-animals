# Lenni's Animals

Tap-an-animal game for Lenni (5). 64 animals. Each tile plays the animal's sound. After the sound, big icon buttons appear: 🛏️ Sleep, 🍎 Food, 🍼 Baby, 🏠 Home, ⭐ Wow. Each shows and reads out one fact. Single `index.html`, no build step.

- **Sound game:** "Who makes this sound?" button. 5 rounds: hear a sound, tap the right animal out of 3. Only uses animals with a real or AI sound file (not the silent ones). Sound-alike animals (dog/wolf/fox etc, see `ALIKE` in `index.html`) are never offered together
- **Pictures:** Apple/system emoji, plus hand-drawn SVGs for animals with no emoji (stingray, lemur, springbok, kookaburra, wombat, platypus, emu, echidna)
- **Animal sounds:** `sounds/<id>.mp3`. 28 are real Wikimedia Commons recordings (trimmed, levelled; see `credits.html`). 13 are ElevenLabs AI sound effects. The 5 newest silent animals (butterfly, ladybird, snail, crab, echidna) have no sound file yet, so the device voice says their line
- **Narration:** every spoken line is a recorded file, because iPads mute the built-in device voice when the silent switch is on. Sleep facts for the original 52 animals: ElevenLabs "Alice" (`voice/<id>.mp3`). Everything else is the free macOS "Karen" voice: food/baby/home/wow (`voice/<id>-eats|baby|home|fun.mp3`), the new animals' sleep facts, game lines (`voice/game-*.mp3`) and quiet animals' sound lines (`voice/<id>-say.mp3`). To swap Karen for Alice later: `node tools/make-audio.cjs --voice Alice --more --force` (needs ~12,000 ElevenLabs characters)
- **Regenerate audio:** `node tools/make-audio.cjs --help` style flags are documented at the top of `tools/make-audio.cjs`. API key lives in `~/.elevenlabs-key` (never commit it). `audio-manifest.js` lists which files exist
- **Print as a book:** button at the bottom prints one animal per A4 page (cover + 64 pages), including all the facts
- **Add an animal:** add an entry to `ANIMALS` and a matching entry to `MORE` in `animals.js`, then run `node tools/make-audio.cjs --voice Alice --sfx`
- **Check cost first:** add `--dry-run` to any command to see files and character count without spending credits. Free tier is 10,000 characters a month; the food/baby/home/wow facts for all animals are about 12,000 on their own

Sleep facts were written from general knowledge and simplified for a 5 year old. Key ones: upside-down jellyfish sleep-like state (Nath et al., Current Biology, 2017); dolphins' half-brain sleep; fat-tailed dwarf lemur hibernation; sea otters holding hands.
