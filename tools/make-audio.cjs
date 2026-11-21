#!/usr/bin/env node
// Makes the audio files for Lenni's Animals using ElevenLabs, then rewrites audio-manifest.js.
//
//   node tools/make-audio.cjs --list-voices             show available voices
//   node tools/make-audio.cjs --voice "Name" [--only lion,cow] [--force]
//                                                        narrator files -> voice/<id>.mp3
//   node tools/make-audio.cjs --voice "Name" --more      "Tell me more" files -> voice/<id>-more.mp3
//   node tools/make-audio.cjs --voice "Name" --game      sound game lines -> voice/game-<id>.mp3 and game-ask/again/done
//                                                        (--more / --game replace the sleep narration for that run)
//   node tools/make-audio.cjs --dry-run ...              show what would be made and the character cost, spend nothing
//   node tools/make-audio.cjs --sfx [--only lion] [--force]
//                                                        generated animal sounds -> sounds/<id>.mp3
//                                                        (skips animals that already have a real recording)
//   node tools/make-audio.cjs --manifest                 just rescan folders and rewrite audio-manifest.js
//
// API key: env ELEVENLABS_API_KEY, or the file ~/.elevenlabs-key (never commit it).

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const { ANIMALS, narration, moreNarration, gameNarration, GAME_LINES } = require("../animals.js");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const flag = f => args.includes(f);
const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const only = opt("--only") ? new Set(opt("--only").split(",")) : null;
const force = flag("--force");
const dry = flag("--dry-run");
const API = "https://api.elevenlabs.io/v1";

function key() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const f = path.join(os.homedir(), ".elevenlabs-key");
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf8").trim();
  console.error("No API key. Put it in ~/.elevenlabs-key or set ELEVENLABS_API_KEY.");
  process.exit(1);
}

async function call(url, body) {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { "xi-api-key": key(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res;
}

// Even out loudness so voices and animal sounds play at a similar volume
function normalise(file) {
  try {
    const tmp = file + ".tmp.mp3";
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-b:a", "96k", tmp]);
    fs.renameSync(tmp, file);
  } catch { /* ffmpeg missing: keep the file as is */ }
}

async function save(res, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  normalise(file);
}

const pickList = list => list.filter(a => !only || only.has(a.id));

async function listVoices() {
  const { voices } = await (await call(`${API}/voices`)).json();
  for (const v of voices) {
    const l = v.labels || {};
    console.log(`${v.name.padEnd(28)} ${[l.accent, l.gender, l.age, l.description || l.descriptive].filter(Boolean).join(", ").padEnd(45)} ${v.voice_id}`);
  }
}

// Each job is { file, text }: which narration set to make this run
function voiceJobs() {
  const animals = pickList(ANIMALS);
  if (flag("--more")) return animals.map(a => ({ file: `${a.id}-more`, text: moreNarration(a) }));
  if (flag("--game")) return [
    ...Object.entries(GAME_LINES).filter(([k]) => !only || only.has(k)).map(([k, text]) => ({ file: `game-${k}`, text })),
    ...animals.filter(a => !a.silent).map(a => ({ file: `game-${a.id}`, text: gameNarration(a) }))
  ];
  return animals.map(a => ({ file: a.id, text: narration(a) }));
}

async function makeVoice(name) {
  const todo = voiceJobs().filter(j => force || !fs.existsSync(path.join(ROOT, "voice", j.file + ".mp3")));
  const chars = todo.reduce((n, j) => n + j.text.length, 0);
  if (dry) {
    for (const j of todo) console.log(`  ${j.file.padEnd(18)} ${j.text}`);
    console.log(`Dry run: ${todo.length} files, about ${chars} characters. Nothing generated.`);
    return;
  }
  const { voices } = await (await call(`${API}/voices`)).json();
  const v = voices.find(x => x.voice_id === name || x.name.toLowerCase().startsWith(name.toLowerCase()));
  if (!v) throw new Error(`Voice "${name}" not found. Run --list-voices.`);
  console.log(`Voice: ${v.name}. ${todo.length} files, about ${chars} characters.`);
  for (const j of todo) {
    const res = await call(`${API}/text-to-speech/${v.voice_id}?output_format=mp3_44100_128`, {
      text: j.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3 }
    });
    await save(res, path.join(ROOT, "voice", j.file + ".mp3"));
    console.log("  voice", j.file);
  }
}

async function makeSfx() {
  const todo = pickList(ANIMALS).filter(a => a.sfx && (force || !fs.existsSync(path.join(ROOT, "sounds", a.id + ".mp3"))));
  console.log(`${todo.length} sound effects to generate.`);
  if (dry) { todo.forEach(a => console.log(`  ${a.id.padEnd(18)} ${a.sfx}`)); return; }
  for (const a of todo) {
    const res = await call(`${API}/sound-generation?output_format=mp3_44100_128`, {
      text: a.sfx, duration_seconds: 3, prompt_influence: 0.5
    });
    await save(res, path.join(ROOT, "sounds", a.id + ".mp3"));
    console.log("  sound", a.id);
  }
}

function writeManifest() {
  const ids = dir => {
    const d = path.join(ROOT, dir);
    return fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith(".mp3")).map(f => f.slice(0, -4)).sort() : [];
  };
  const m = { sounds: ids("sounds"), voice: ids("voice") };
  fs.writeFileSync(path.join(ROOT, "audio-manifest.js"),
    `// Generated by tools/make-audio.cjs. Lists which audio files exist.\nwindow.AUDIO = ${JSON.stringify(m, null, 2)};\n`);
  console.log(`Manifest: ${m.sounds.length} sounds, ${m.voice.length} voice files.`);
}

(async () => {
  try {
    if (flag("--list-voices")) return await listVoices();
    if (opt("--voice")) await makeVoice(opt("--voice"));
    if (flag("--sfx")) await makeSfx();
    if (!dry) writeManifest();
  } catch (e) { console.error("Error:", e.message); process.exit(1); }
})();
