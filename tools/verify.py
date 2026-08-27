import re, json, os, glob

def pages(d):
    out=[]
    for f in sorted(glob.glob(os.path.join(d,'*.txt')), key=lambda p:int(os.path.basename(p)[:-4])):
        out.append(open(f, encoding='utf-8', errors='ignore').read().replace('\r',''))
    return out

def parse(text):
    """Pull (week-range, day-name, [(exercise, sets)]) out of the page text."""
    blocks={}; week=None; day=None
    for line in text.split('\n'):
        line=line.strip()
        m=re.match(r'WEEKS? (\d+)\s*[–-]\s*(\d+)', line) or re.match(r'WEEK (\d+)', line)
        if m:
            week=tuple(int(g) for g in m.groups()); continue
        m=re.match(r'DAY (\d): ([A-Z ]+)', line)
        if m:
            day=(int(m.group(1)), m.group(2).strip()); blocks.setdefault((week,day),[]); continue
        if day and week:
            m=re.match(r'^(.+?)\s+(\d+)\s+(.+?)\s+(\d+\s*(?:s|min|m)?|—)$', line)
            if m and 'EXERCISE' not in line:
                blocks[(week,day)].append((m.group(1).strip(), int(m.group(2))))
    return blocks

def norm(s):
    s=s.lower()
    s=re.sub(r'\(.*?\)','',s)
    s=re.sub(r'[^a-z ]','',s)
    return ' '.join(s.split())

def check(prog_path, doc_dir, label):
    prog=json.load(open(prog_path))
    src={}
    for p in pages(doc_dir): src.update(parse(p))
    issues=[]
    for b in prog['blocks']:
        wk=tuple(b['weeks']) if len(b['weeks'])==2 else (b['weeks'][0],)
        for d in b.get('days',[]):
            key=[k for k in src if k[0]==wk and k[1][0]==d['dayNumber']]
            if not key: continue
            s=src[key[0]]
            mine=[(norm(m['name']), m['sets']) for m in d['movements']]
            theirs=[(norm(n), st) for n,st in s]
            if len(mine)!=len(theirs):
                issues.append(f"{label} W{b['weeks']} D{d['dayNumber']}: {len(mine)} movements vs {len(theirs)} in source")
            for i,(tn,ts) in enumerate(theirs):
                if i>=len(mine): break
                mn,ms=mine[i]
                if not (tn.startswith(mn[:8]) or mn.startswith(tn[:8])):
                    issues.append(f"{label} W{b['weeks']} D{d['dayNumber']} #{i+1}: '{mine[i][0]}' vs source '{tn}'")
                elif ms!=ts:
                    issues.append(f"{label} W{b['weeks']} D{d['dayNumber']} #{i+1} {tn}: {ms} sets vs source {ts}")
    return issues

i1=check('/home/claude/codex/src/data/sources/recruitToSoldier.json','/tmp/r2s','R→S')
i2=check('/home/claude/codex/src/data/sources/soldierToWarrior.json','/tmp/s2w','S→W')
for x in i1+i2: print(x)
print(f"\n{len(i1)+len(i2)} discrepancies")
