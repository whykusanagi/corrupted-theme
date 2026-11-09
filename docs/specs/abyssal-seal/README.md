# Abyssal Seal of the Queen (mockups)

Throwaway mockups for a planned corrupted-theme component: an "official
authority" seal that sits behind Celeste on stream, for "stand by for a
broadcast from the Queen" style videos. It should read as a real seal of office
at a glance while being obviously fictional.

Open `mockup-v2-digital.html` in a browser (it loads `womb.png` from this
folder). Not published to npm: `docs/specs` is outside `package.json` "files".

## Where the design stands (2026-11-09)

- **v1 (`mockup-v1-heraldic.html`)**: US-presidential-seal layout in flat gold. Rejected as too literal.
- **v2 (`mockup-v2-digital.html`)**: chosen direction. A digital seal in CorruptedMandala's visual language:
  - monospace legend "SEAL OF THE QUEEN OF THE ABYSS" / "◈ I TOKENIZE THE ABYSS ◈", chromatic fringe
  - rotating tick dial, two rotating data rings, mandorla halo, dashed quadrant arcs
  - six 4-point stars LAW 0..V (Celeste's Six Abyssal Laws)
  - womb sigil centre (tinted + glow), terminal motto plate "> NOTHING IS BEYOND HER REACH"
  - palettes: mandala default (pink/violet/cyan) and nye_gold

- **v3 (`mockup-v3-nulltongue.html`)**: v2 plus
  - inner rotating ring carries a hidden nulltongue line: `▋ツコル サンタ◄ ロヘク◄ ヒウネ`
    = "The void looked back and chose to kneel" (*Sovereign of the Void, Extended — Occult
    Convergence*); the codec decodes it to `void see.PST choose.PST submit`. Same song as the
    legend's "I TOKENIZE THE ABYSS". Yuubaku / OVERCLOCK were ruled out: explicit, and a
    decodable line on a safe-platform background must not be.
  - bottom legend types in (TypingAnimation-style buffer corruption), holds, loops. Written
    as a pure function of t (`typeAt`) so a render can seek any frame.

## Open

- Talons: removed; two empty bracket slots mark where they'd go. Content TBD.
- The womb art can't ship in the package (see `logo-banner.js`): the component
  needs an image/href option for the centre.
