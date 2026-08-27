"""
TRANSCRIPTION PIPELINE
Reads the sidecar text of a Warrior Codex program document and emits the
program JSON the app consumes. No human retypes a session, so no human
invents one either.
"""
import re, json, os, glob, sys, zipfile, tempfile

# ── how a written exercise name maps to a movement id ────────
ALIASES = {
    "hindu push-up": "dand", "hindu pushup": "dand",
    "pike push-up": "pike", "diamond push-up": "diamond", "clap push-up": "clap",
    "archer push-up": "archer", "handstand push-up": "handstandpushup",
    "finger push-up": "fingerpushup", "fingertip push-up": "fingerpushup",
    "plank hold": "plank", "plank": "plank", "side plank": "sideplank",
    "shaolin hollow hold": "hollow", "hollow hold": "hollow",
    "bow draw hold": "bowdraw", "dragon flag": "dragonflag",
    "windshield wipers": "wipers",
    "inverted row": "invertedrow", "dead hang": "deadhang",
    "chin-up": "chinup", "chin up": "chinup",
    "pull-up": "pullup", "pull up": "pullup", "pull-ups": "pullup",
    "pull-up attempts": "pullup", "commando pull-up": "commando", "typewriter pull-up": "typewriter",
    "muscle-up": "muscleup", "towel grip pull-up": "towelpullup",
    "towel grip dead hang": "towelhang", "grip squeeze": "gripsqueeze",
    "body drag": "bodydrag", "shield march": "shieldmarch",
    "body carry": "bodycarry", "log carry": "logcarry", "overhead carry": "overheadcarry",
    "hindu squat": "baithak", "hindu squats": "baithak",
    "forward lunge": "forwardlunge", "walking lunge": "walkinglunge",
    "lateral lunge": "laterallunge", "elevated lunge": "elevatedlunge",
    "jump lunge": "jumplunge", "jump squat": "jumpsquat",
    "step-up": "stepup", "single-leg calf raise": "calfraise",
    "duck walk": "duckwalk", "horse stance hold": "horse", "horse stance": "horse",
    "deep horse stance hold": "horse", "cossack squat": "cossack", "pistol squat": "pistol",
    "run": "run", "2km run": "run", "war run": "run", "2km war run": "run", "run / walk intervals": "run", "run/walk intervals": "run",
    "bear crawl": "bearcrawl", "leopard crawl": "leopardcrawl", "crab walk": "crabwalk",
    "wounded retreat crawl": "retreatcrawl", "hip escape": "hipescape",
    "grappling ground drill": "groundwork", "hindu burpee": "burpee",
    "surya namaskar": "surya", "hip hinge": "hiphinge", "glute bridge": "glutebridge",
    "single-leg glute bridge": "slglutebridge", "single-leg balance lift": "balancelift",
    "stone lift": "stonelift", "stone throw": "stonethrow",
    "javelin throw rotation": "javelin", "axe chop": "axechop", "gada swing": "gada",
    "wrestler's sprawl": "sprawl", "broad jump": "broadjump",
    "vertical leap": "verticalleap", "vault jump": "vaultjump",
    "bounding run": "bounding", "war sprint": "sprint", "sprint": "sprint",
    "tuck jump": "tuckjump", "knee strike drill": "kneestrike",
    "front kick drill": "frontkick",
}

DAY_FOCUS = {"STRIKE": "Push + Core", "RAID": "Pull + Carry", "MARCH": "Legs + Run",
             "BATTLE": "Full Body + Crawl", "POWER": "Hinge + Rotation + Jump",
             "GAMES": "Test Practice", "TEST": "Rank Test"}

def clean(name):
    """Strip the parenthetical and any trailing distance or block note."""
    n = name.strip()
    n = re.sub(r'\s+[—–]\s*.*$', '', n)          # drop everything after a dash note
    n = re.sub(r'\s+\d+\s*(m|km)\b.*$', '', n)     # drop trailing distances
    paren = re.search(r'\(([^)]*)\)', n)
    note = paren.group(1).strip() if paren else ""
    n = re.sub(r'\s*\([^)]*\)', '', n).strip()
    return n, note

def to_id(name):
    key = clean(name)[0].lower().replace("’", "'").strip()
    if key in ALIASES: return ALIASES[key]
    key2 = key.rstrip('s')
    return ALIASES.get(key2)

def seconds(text):
    m = re.match(r'(\d+)\s*second', text, re.I)
    if m: return int(m.group(1))
    m = re.match(r'(\d+)\s*min', text, re.I)
    if m: return int(m.group(1)) * 60
    m = re.match(r'(\d+):(\d+)', text)
    if m: return int(m.group(1)) * 60 + int(m.group(2))
    return None

def rest_seconds(text):
    t = text.strip()
    if t in ('—', '-', ''): return 0
    m = re.match(r'(\d+)\s*s', t, re.I)
    if m: return int(m.group(1))
    m = re.match(r'(\d+)\s*min', t, re.I)
    if m: return int(m.group(1)) * 60
    m = re.match(r'^(\d+)$', t)
    return int(m.group(1)) if m else 0

ROW = re.compile(r'^(?P<name>.+?)\s+(?P<sets>\d+)\s+(?P<reps>.+?)\s+(?P<rest>\d+\s*(?:s|min)|—|-)$')

def parse_document(txt_dir):
    """Return ordered blocks: [{weeks, phase, label, note, days:[...]}]"""
    pages = sorted(glob.glob(os.path.join(txt_dir, '*.txt')),
                   key=lambda p: int(os.path.basename(p)[:-4]))
    blocks, cur_block, cur_day, phase, phase_note = [], None, None, None, ""
    unmapped = set()
    pending_phase_note = []

    for path in pages:
        for raw in open(path, encoding='utf-8', errors='ignore').read().replace('\r', '').split('\n'):
            line = raw.strip()
            if not line or line.startswith('THE WARRIOR CODEX'): continue

            m = re.match(r'PHASE \d+:\s*([A-Z &]+?)\s*[—–-]\s*WEEKS', line)
            if m:
                phase = m.group(1).title().strip(); pending_phase_note = []; continue

            m = re.match(r'^WEEKS?\s+(\d+)\s*[–—-]\s*(\d+)\s*(?:\((.+)\))?\s*$', line)
            if not m: m = re.match(r'^WEEKS?\s+(\d+)\s*(?:[—–-]\s*(.+))?$', line)
            if m:
                groups = [g for g in m.groups() if g is not None]
                label = groups[-1] if not groups[-1].isdigit() else ""
                weeks = [int(g) for g in groups if g.isdigit()]
                if len(weeks) == 2 and weeks[0] != weeks[1]:
                    weeks = list(range(weeks[0], weeks[1] + 1))
                existing = next((b for b in blocks if b["weeks"] == weeks), None)
                if existing:
                    cur_block = existing
                    if label.strip(): cur_block["label"] = label.strip()
                else:
                    cur_block = {"weeks": weeks, "phase": phase or "Training",
                                 "label": label.strip(), "note": " ".join(pending_phase_note).strip(),
                                 "days": []}
                    blocks.append(cur_block)
                cur_day = None; continue

            m = re.match(r'DAY (\d): ([A-Z][A-Z ]*?)\s*(?:\(([^)]+)\))?\s*(?:[—–]\s*(.*))?$', line)
            if m and cur_block is not None:
                nm = m.group(2).strip()
                cur_day = {"dayNumber": int(m.group(1)), "dayName": nm,
                           "focus": m.group(3) or DAY_FOCUS.get(nm, ""),
                           "note": (m.group(4) or "").strip(), "movements": []}
                cur_block["days"].append(cur_day); continue

            if line.startswith('EXERCISE') or line.startswith('TEST '): continue

            if cur_day is not None:
                if re.match(r'^\d{1,2}\s+\D', line): continue
                r = ROW.match(line)
                if r:
                    raw_name = r.group('name')
                    mid = to_id(raw_name)
                    if mid is None:
                        unmapped.add(clean(raw_name)[0]); continue
                    name, sub = clean(raw_name)
                    reps = r.group('reps').strip()
                    secs = seconds(reps)
                    mv = {"movementId": mid, "name": name, "sub": sub,
                          "type": "hold" if secs else "sets",
                          "sets": int(r.group('sets')), "rest": rest_seconds(r.group('rest'))}
                    if secs: mv["seconds"] = secs
                    else: mv["reps"] = reps
                    if 'each side' in reps.lower() and secs: mv["type"] = "holdEach"
                    cur_day["movements"].append(mv)
                    continue
            if cur_block is None and phase:
                pending_phase_note.append(line)

    for b in blocks:
        b["days"] = [d for d in b["days"] if d["movements"]]
    return [b for b in blocks if b["days"]], sorted(unmapped)


TEST_ROW = re.compile(r'^(?P<n>\d{1,2})\s+(?P<name>\S.*?)\s+(?P<target>[\d:.]+\s*\S*)\s+(?P<rest>\d+\s*min|—|-)$')

def parse_rank_test(txt_dir):
    """The final table: ten tests, their standard, and the rest between them."""
    rows = []
    for path in sorted(glob.glob(os.path.join(txt_dir, '*.txt')),
                       key=lambda p: int(os.path.basename(p)[:-4])):
        for raw in open(path, encoding='utf-8', errors='ignore').read().replace('\r', '').split('\n'):
            m = TEST_ROW.match(raw.strip())
            if not m: continue
            mid = to_id(m.group('name'))
            if mid is None: continue
            name, sub = clean(m.group('name'))
            rows.append({"movementId": mid, "name": name, "sub": sub, "type": "sets",
                         "sets": 1, "reps": f"{m.group('target').strip()} to pass",
                         "rest": rest_seconds(m.group('rest'))})
    return rows[:10]

if __name__ == '__main__':
    blocks, unmapped = parse_document(sys.argv[1])
    print(f"blocks: {len(blocks)}  sessions: {sum(len(b['days']) for b in blocks)}")
    for b in blocks:
        print(f"  W{b['weeks'][0]}-{b['weeks'][-1]:<2} {b['phase']:<12} days {[d['dayNumber'] for d in b['days']]}"
              f"  movements {[len(d['movements']) for d in b['days']]}")
    if unmapped:
        print("\nUNMAPPED EXERCISE NAMES:")
        for u in unmapped: print("  ", u)
