# Cross-Language Data Contract

`corrupted-theme` exposes its canonical content as three JSON files under
`src/data/`. These files are designed for consumption from JavaScript (this
package's own modules) AND from non-JS callers (notably **celeste-cli** in
Go via `//go:embed`).

This document is the **contract** for that cross-language consumption.

## Files

| File | What it contains | Schema |
|---|---|---|
| `src/data/phrases.json` | SFW + NSFW phrases, by language × context-pool, plus romaji↔kanji pairings | [`schemas/phrases.schema.json`](../src/data/schemas/phrases.schema.json) |
| `src/data/charsets.json` | Character sets: katakana, hiragana, kanji, symbols, blocks | [`schemas/charsets.schema.json`](../src/data/schemas/charsets.schema.json) |
| `src/data/colors.json` | 6-hex palette + semantic-use map | [`schemas/colors.schema.json`](../src/data/schemas/colors.schema.json) |

Each file declares a `schemaVersion` (currently `"1.0"`) for forward compat.

## JS Consumption (this package)

```javascript
import phrases from '@whykusanagi/corrupted-theme/data/phrases.json' with { type: 'json' };

// New context-aware API
const phrase = phrases.sfw.japanese.system[0];

// Backward-compat flat arrays via wrapper
import { SFW_PHRASES, NSFW_PHRASES } from '@whykusanagi/corrupted-theme/corruption-phrases';
```

Bundlers (Vite, Webpack, Rollup) handle JSON imports natively. Node 20+
supports the `with { type: 'json' }` import attribute. The older `assert`
form is deprecated in newer Node and should not be used in new code.

## Go Consumption (celeste-cli)

`celeste-cli` embeds the JSON at compile time via `//go:embed`:

```go
package corruption

import (
    _ "embed"
    "encoding/json"
)

//go:embed data/phrases.json
var phrasesJSON []byte

type LanguageBundle struct {
    Japanese PoolSet `json:"japanese"`
    Romaji   PoolSet `json:"romaji"`
    English  PoolSet `json:"english"`
}
type PoolSet struct {
    Data   []string `json:"data"`
    System []string `json:"system"`
    Status []string `json:"status"`
    Void   []string `json:"void"`
    Memory []string `json:"memory"`
    Glitch []string `json:"glitch"`
}
type Phrases struct {
    SchemaVersion string         `json:"schemaVersion"`
    SFW           LanguageBundle `json:"sfw"`
    NSFW          LanguageBundle `json:"nsfw"`
    Pairings      []Pairing      `json:"pairings"`
}
type Pairing struct {
    Romaji string `json:"romaji"`
    Kanji  string `json:"kanji"`
    Pool   string `json:"pool"`
}

func Load() (*Phrases, error) {
    var p Phrases
    if err := json.Unmarshal(phrasesJSON, &p); err != nil {
        return nil, err
    }
    return &p, nil
}
```

The Go side ships its own copy of `phrases.json` under `celeste-cli`'s
source tree, regenerated from the canonical npm package on each
corrupted-theme release. (Automation lives in celeste-cli's repo.)

## Schema Versioning

- `schemaVersion: "1.0"` — the current shape.
- Additive changes (new pool, new charset, new color) bump to `"1.1"`,
  `"1.2"`, etc. Consumers MUST tolerate unknown fields.
- Breaking changes (renaming a pool, removing a required field) bump to
  `"2.0"`. Consumers SHOULD fail loudly on a major version mismatch.

## Stability Guarantees

- The **shape** (top-level keys, pool names, language names) is stable
  within a major schemaVersion.
- The **content** (the actual phrases and characters) can change at any
  minor corrupted-theme release. Don't hard-code specific phrases on the
  Go side; sample from the pools.

## Tooling

- `npm run validate-data` in this repo validates the JSON against schemas.
  Run before publishing.
- Go side should `go test` a sanity check that `Load()` returns
  `len(SFW.Japanese.System) > 0` etc.
