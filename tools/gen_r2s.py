import sys, json; sys.path.insert(0,'/home/claude')
from parse_program import parse_document, parse_rank_test

blocks, unmapped = parse_document('/tmp/r2s')
assert not [u for u in unmapped if u.strip()], unmapped
test = parse_rank_test('/tmp/r2s')
assert len(test) == 10, len(test)

META = {(1,2):("Foundation","Learning Phase"),(3,4):("Foundation","Volume Increase"),
        (5,6):("Build","Volume Toward Target"),(7,8):("Build","Intensity Push"),
        (9,10):("Peak","Sharpening")}
for b in blocks:
    ph, lb = META.get((b["weeks"][0], b["weeks"][-1]), (b["phase"], b["label"]))
    b["phase"], b["label"] = ph, b["label"] or lb

# Weeks 9-10 Day 6 is prose: a full test at Soldier standard. Filled from the test table.
w = next(b for b in blocks if b["weeks"] == [9,10])
if not any(d["dayNumber"] == 6 for d in w["days"]):
    w["days"].append({"dayNumber":6,"dayName":"GAMES","focus":"Full 10-Test at Soldier Standard",
      "note":"You should pass seven to ten of these. Record everything.",
      "source":"prose instruction, battery from the rank test table",
      "movements":[dict(m, reps=m["reps"].replace(" to pass","")) for m in test]})
    w["days"].sort(key=lambda d: d["dayNumber"])

blocks.append({"weeks":[11],"phase":"Taper","label":"Recover and Supercompensate",
  "taperFrom":[9,10],"setsDelta":1,
  "note":"Volume down 30 percent, intensity high. Do NOT train to failure. "
         "Games day: your two or three weakest tests only."})
blocks.append({"weeks":[12],"phase":"Test","label":"Test Week","test":True,
  "note":"Test day. You are ready.",
  "days":[{"dayNumber":6,"dayName":"TEST","focus":"Soldier Rank Test","movements":test,
           "note":"All ten, in order, at Soldier standard."}]})

json.dump({"id":"recruit-to-soldier","fromRank":"Recruit","toRank":"Soldier","weeks":12,
  "sessionsPerWeek":6,
  "warmUp":"5 minutes Surya Namaskar, then 3 minutes dynamic stretching. Non-negotiable.",
  "coolDown":"3 minutes static stretching, then 2 minutes controlled breathing.",
  "source":"warrior_codex_recruit_to_soldier_12week — parsed, not transcribed",
  "blocks":blocks}, open('/home/claude/codex/src/data/sources/recruitToSoldier.json','w'), indent=1)
print("generated:", sum(len(b.get('days',[])) for b in blocks), "sessions")
