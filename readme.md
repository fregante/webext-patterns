# webext-patterns [![][badge-gzip]][link-bundlephobia]

[badge-gzip]: https://img.shields.io/bundlephobia/minzip/webext-patterns.svg?label=gzipped
[link-bundlephobia]: https://bundlephobia.com/result?p=webext-patterns

> Tool to convert the [patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts#globs) of your WebExtension manifest to regex

This might be incomplete. Please help me test it by adding more pattern and URLs to the [tests](./test.js).

## Install

You can download the [standalone bundle](https://bundle.fregante.com/?pkg=webext-patterns) and include it in your `manifest.json`.

Or use `npm`:

```sh
npm install webext-patterns
```

```js
// This module is only offered as a ES Module
import {
	patternToRegex,
	globToRegex,
	excludeDuplicatePatterns
	doesUrlMatchPatterns,
	assertValidPattern,
	isValidPattern,
} from 'webext-patterns';
```

## Usage

```js
patternToRegex('http://*/*');
// Returns /^http:[/][/][^/]+[/].+$/

globToRegex('*.example.com');
// Returns /\.example\.com$/

excludeDuplicatePatterns(['https://*.google.com/*', 'https://google.com/*']);
// Returns ['https://*.google.com/*']

assertValidPattern('https://google.*/*');
// Throws an error because the pattern is invalid

isValidPattern('https://*.google.com/*');
// Returns true
```

> **Note**
> Firefox and Chrome handle patterns very slighly differently. `webext-patterns` defaults to Chrome’s logic, but if it detects a Firefox userAgent it will produce a Firefox-compatible regex.

## API

#### patternToRegex(pattern1, pattern2, etc)

Accepts any number of `string` arguments and returns a single regex to match all of them.

[Match patterns](https://developer.chrome.com/extensions/match_patterns) are used in the manifest’s permissions and content scripts’ `matches` and `exclude_matches` array.

```js
patternToRegex('http://*/*');
// Returns /^http:[/][/][^/]+[/].+$/

const gmailRegex = patternToRegex('*://mail.google.com/*');
gmailRegex.test('https://mail.google.com/a/b/c'); // -> true
gmailRegex.test('https://photos.google.com/a/b/c'); // -> false

// Also accepts multiple patterns and returns a single regex
const googleRegex = patternToRegex(
	'https://google.com/*',
	'https://google.it/*'
);
googleRegex.test('https://google.it/search'); // -> true
googleRegex.test('https://google.de/search'); // -> false
```

#### globToRegex(pattern1, pattern2, etc)

Accepts any number of `string` arguments and returns a single regex to match all of them.

[Globs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts#globs) are used in the manifest’s content scripts’ `include_globs` and `exclude_globs` arrays.

```js
globToRegex('*.example.co?');
// Returns /\.example\.co.?$/ in Firefox
// Returns /\.example\.co.$/ everywhere else

const gmailRegex = globToRegex('*://mai?.google.com/*');
gmailRegex.test('https://mail.google.com/a/b/c'); // -> true
gmailRegex.test('https://photos.google.com/a/b/c'); // -> false

// Also accepts multiple globs and returns a single regex
const googleRegex = globToRegex(
	'*google.com*',
	'*google.it*'
);
googleRegex.test('https://google.it/search'); // -> true
googleRegex.test('https://google.de/search'); // -> false
```

#### excludeDuplicatePatterns([pattern1, pattern2, etc])

Accepts an array of patterns and returns a filtered array without the patterns that are already covered by others. For example `"https://*/*"` already covers all "https" URLs, so having `"https://google.com/*"` in the array won't make any difference and therefore it's dropped.

```js
excludeDuplicatePatterns([
	"https://*/*",
	"https://google.com/*",
	"https://*.example.com/*",
]);
// Returns ["https://*/*"]
```

#### doesUrlMatchPatterns(url, ...patterns)

Accepts a URL and any number of patterns and returns `true` if the URL matches any of the patterns. This is a convenience method that wraps `patternToRegex` for single use. If you plan on testing multiple URLs to the same pattern, it's better to convert the patterns to a regex once and reuse that.

```js
doesUrlMatchPatterns('https://google.com/', 'https://*.google.com/*', '*://example.com/*');
// Returns true
```

#### assertValidPattern(pattern)

Accepts a pattern and throws an error if it's invalid.

```js
assertValidPattern('https://google.*/*');
// Throws an error because the pattern is invalid
```

#### isValidPattern(pattern)

Accepts a pattern and returns `true` if it's valid.

```js
isValidPattern('https://google.*/*');
// Returns false
```

## Related

### Permissions

- [webext-additional-permissions](https://github.com/fregante/webext-additional-permissions) - Get any optional permissions that users have granted you.
- [webext-dynamic-content-scripts](https://github.com/fregante/webext-dynamic-content-scripts) - Automatically registers your content_scripts on domains added via permission.request

### Others

- [webext-options-sync](https://github.com/fregante/webext-options-sync) - Helps you manage and autosave your extension's options. Chrome and Firefox.
- [webext-storage-cache](https://github.com/fregante/webext-storage-cache) - Map-like promised cache storage with expiration. Chrome and Firefox
- [webext-detect-page](https://github.com/fregante/webext-detect-page) - Detects where the current browser extension code is being run. Chrome and Firefox.
- [webext-content-script-ping](https://github.com/fregante/webext-content-script-ping) - One-file interface to detect whether your content script have loaded.
- [web-ext-submit](https://github.com/fregante/web-ext-submit) - Wrapper around Mozilla’s web-ext to submit extensions to AMO.
- [Awesome-WebExtensions](https://github.com/fregante/Awesome-WebExtensions) - A curated list of awesome resources for WebExtensions development.

## License

MIT © [Federico Brigante](https://fregante.com)
