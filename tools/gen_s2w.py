import sys, json; sys.path.insert(0,'/home/claude')
from parse_program import parse_document, parse_rank_test

blocks, unmapped = parse_document('/tmp/s2w')
assert not [u for u in unmapped if u.strip()], unmapped
test = parse_rank_test('/tmp/s2w')

LABEL = {(1,2):"New Movement Introduction",(3,4):"Volume Increase",(5,6):"Volume Climb",
         (7,8):"Intensity Push",(9,10):"Test-Condition Training"}
for b in blocks:
    b["label"] = b["label"] or LABEL.get((b["weeks"][0], b["weeks"][-1]), "")

# Weeks 9-10 Day 6 is prose in the source: "Full 10-test at Warrior standard."
# That is the rank test battery, so it is filled from the test table rather than invented.
w910 = next(b for b in blocks if b["weeks"] == [9,10])
if not any(d["dayNumber"] == 6 for d in w910["days"]):
    w910["days"].append({"dayNumber":6,"dayName":"GAMES","focus":"Full 10-Test at Warrior Standard",
        "note":"Full 10-test at Warrior standard. You should pass seven to ten. Record everything.",
        "source":"prose instruction, battery from the rank test table",
        "movements":[dict(m, reps=m["reps"].replace(" to pass","")) for m in test]})
    w910["days"].sort(key=lambda d: d["dayNumber"])

# Weeks 11-12 and 13-14 are described only as "same structure". Week 15 is a taper.
blocks.append({"weeks":[11,12],"phase":"Harden","label":"Weak Test Focus","sameAs":[9,10],
  "note":"Same structure, focused on your weakest three tests. Extra volume goes to your gaps. "
         "Games day: practice only your failing tests. Week 12 Day 6 is a final full simulation."})
blocks.append({"weeks":[13,14],"phase":"Peak & Test","label":"Final Push","sameAs":[9,10],
  "note":"Maintain peak volume on weak tests, reduce on passed ones. Every Games session is a full simulation."})
blocks.append({"weeks":[15],"phase":"Peak & Test","label":"Taper","taperFrom":[13,14],"setsDelta":2,
  "note":"Cut total volume 30 to 40 percent, keep intensity. Three to four sets, not five to six. "
         "Do NOT train to failure."})
blocks.append({"weeks":[16],"phase":"Peak & Test","label":"Test Week","test":True,
  "note":"Mon light movement · Tue two weakest tests at 80% · Wed complete rest · Thu RANK TEST · Fri rest.",
  "days":[
    {"dayNumber":1,"dayName":"LIGHT","focus":"Movement Only","note":"Fifteen minutes stretching. No training.",
     "movements":[{"movementId":"surya","name":"Surya Namaskar","sub":"","type":"sets","sets":1,"reps":"5 rounds","rest":0}]},
    {"dayNumber":2,"dayName":"PRACTICE","focus":"Two Weakest Tests at 80%",
     "note":"Feel the movements. Build confidence. Do NOT go to failure.",
     "movements":[{"movementId":"dand","name":"Your weakest test","sub":"at 80 percent effort","type":"sets","sets":1,"reps":"80 percent effort","rest":180},
                  {"movementId":"pullup","name":"Your second weakest test","sub":"at 80 percent effort","type":"sets","sets":1,"reps":"80 percent effort","rest":180}]},
    {"dayNumber":4,"dayName":"TEST","focus":"Warrior Rank Test","movements":test,
     "note":"All ten in order. Ten-minute warm-up first."}]})

json.dump({"id":"soldier-to-warrior","fromRank":"Soldier","toRank":"Warrior","weeks":16,
  "sessionsPerWeek":6,
  "warmUp":{"steps": [{"name": "Surya Namaskar", "seconds": 360, "cue": "Flow through the sequence. Breathe with the movement, do not rush it."}, {"name": "Dynamic Stretching", "seconds": 240, "cue": "Leg swings, arm circles, hip openers. Keep moving \u2014 nothing static yet."}], "note": "Cold training risks weeks of progress. Non-negotiable."},
  "coolDown":{"steps": [{"name": "Static Stretching", "seconds": 240, "cue": "Hold each stretch. Do not bounce."}, {"name": "Controlled Breathing", "seconds": 120, "cue": "In for four, out for eight. Slow the exhale, slow the mind."}], "note": ""},
  "source":"warrior_codex_soldier_to_warrior_16week — parsed, not transcribed",
  "blocks":blocks}, open('/home/claude/codex/src/data/sources/soldierToWarrior.json','w'), indent=1)
print("generated:", sum(len(b.get('days',[])) for b in blocks), "sessions")
