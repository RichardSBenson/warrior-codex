# Transcription pipeline

The program documents are ZIP archives of page images with a sidecar `.txt`
per page. `pdftotext` cannot read them, and searching them returns fragments —
which is how invented sessions got into the Soldier → Warrior program.

These scripts generate the program JSON directly from the source text, so no
human retypes a session and no human invents one.

```
parse_program.py <dir>   # parse and report blocks, sessions, unmapped names
gen_r2s.py               # regenerate recruitToSoldier.json
gen_s2w.py               # regenerate soldierToWarrior.json
verify.py                # diff generated JSON against the source documents
```

Unpack a document first: `unzip -qq <program>.pdf -d /tmp/<name>`

## Adding a program

1. Unpack it and run `parse_program.py` on the directory.
2. Any name it cannot map is listed under UNMAPPED. Add it to `ALIASES`, and
   add a stub to `exercises.json` if the movement is new.
3. Copy a `gen_*.py` and set the phase labels, the reuse blocks and the taper.
4. Run `verify.py`. It should report only the prose-derived days.

## Known deliberate differences

Weeks 9–10 Day 6 in both programs is prose in the source — *"full 10-test at
standard"* — with no table. Those days are filled from the rank test table and
carry a `source` field saying so. They are the only sessions in the app not
lifted directly from a table.
