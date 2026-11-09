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

## Open

- Talons: removed; two empty bracket slots mark where they'd go. Content TBD.
- Typing animation (corrupted-theme TypingAnimation) on the legend / motto plate.
- Hidden data encoded in the rotating ring.
- The womb art can't ship in the package (see `logo-banner.js`): the component
  needs an image/href option for the centre.
