# HTTP error pages

`@whykusanagi/corrupted-theme/http-errors` exports `httpErrors` (an object
indexed by numeric status code) and `getHttpError(code)` (which returns the
standard `Error` / `Something went wrong in this reality.` fallback for unlisted
codes). `400` has provisional copy; the other listed codes use the issue #88
recorded lines.

Use `@whykusanagi/corrupted-theme/error-pages-css` or the main theme CSS for
`.error-page`, `.error-code`, `.error-title`, `.error-line`, and `.error-links`.
The static `errors/<code>.html` documents are self-contained, with embedded
styles and a default home link. To change navigation, render your own page with
the exported data and CSS. Escape dynamic values before embedding them in HTML.

```js
import { getHttpError } from '@whykusanagi/corrupted-theme/http-errors';

const status = 404;
const { title, line } = getHttpError(status);
// Your server/Worker sets the HTTP response status and chooses site-specific links.
```

The static error documents contain a `noindex, nofollow` robots tag. A static
asset's filename does **not** set its HTTP response status; your Worker or host
must serve it with the correct status code. For Cloudflare Workers Static Assets,
`not_found_handling` accepts `404-page` (not a filename) and looks for
`404.html` at the deployed assets root. Copy `errors/404.html` to that path;
keep the remaining pages in the assets directory and use an assets
binding/Worker route for custom 4xx/5xx responses. The packaged pages do not
change the behavior of the host by installation alone. Because the static pages
embed CSS, a strict CSP must allow the inline stylesheet (or you can render
site-owned HTML with the exported stylesheet). `npm run errors:generate`
rebuilds them from the JS map.

See `examples/http-errors.html` to preview all codes.
