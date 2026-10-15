# Brixton Phahol 50 vehicle tag scanner

Web app for guards, the juristic office and committee members to scan the QR on a parking tag, check its status, register vehicles and record violations. It runs on GitHub Pages at https://phemarajata.github.io/bxt50-tags/ and reads and writes the private Google Sheet only through the Apps Script web app, after someone signs in with a personal PIN.

Version 2 (October 2026) moves the app out of Claude Design into plain files and adds the committee members' pets from the Brixton Pet & Play design system. The app logic is the same code as before.

## What is in this folder

| Path | What it is |
| --- | --- |
| `index.html` | The page GitHub Pages serves. Loads everything below. |
| `config.js` | Settings: Apps Script URL, write key, tag year, demo mode, invite address. |
| `app/logic.js` | All app behaviour (sign-in, PIN lockout, scanning, Apps Script calls, saving). Copied unchanged from the Claude Design file of 15 Oct 2026. |
| `app/view.js` | The screens, written as HTML-like templates. Edit here to change wording or layout. |
| `app/cast.js` | Which committee pet appears on which screen. |
| `app/icons.js` | The icons the app uses, from the design system's icon set. |
| `app/main.js`, `app/runtime.js` | Start-up code. Rarely needs changes. |
| `app/app.css` | A few app-wide styles. |
| `ds/` | Design system tokens and the JetBrains Mono font, copied unchanged. |
| `assets/` | Brixton logo and the pet artwork (resized WebP copies of the design system cuts). |
| `vendor/` | React 18.3.1, htm, qrcode-generator and jsQR, pinned and stored here so the app never depends on an outside server staying up. |
| `demo/tags-demo.csv` | Seven sample serials with no personal data, used only in demo mode. |
| `guide/` | The Thai user guide (A4, three sections: office, committee, guard). Served at `/guide/`. |

There is no build step. Every file is served as it is.

## Updating the app

1. Edit the file on GitHub (open it, click the pencil) or upload a replacement with "Add file → Upload files".
2. Commit. The site updates within about a minute.
3. On a phone, close and reopen the app to load the new version.

Common changes:

- **Apps Script redeployed with a new URL:** change `scriptUrl` in `config.js`.
- **New tag year:** change `tagYear` in `config.js` (co-owner tags expire on 31 December of that BE year).
- **Wording on a screen:** find the Thai text in `app/view.js` and edit it there.
- **Behaviour (statuses, required fields, violation types, roles):** these live in `app/logic.js`, near the top (`LISTS`, `TAG_FIELDS`, `VIO_FIELDS`) and in `status()`.

## The committee pets

Each screen shows one pet, and no pet appears twice on the same day. The line-up changes every day. The choice follows the design system's rotation rules (`pickCast`): the sign-in screen gets a pet that waves hello, the scanner gets one peeking over the camera card, a valid tag and a problem tag each get their own pet, and history, user management and the edit form get one each.

| Pet | Owner |
| --- | --- |
| ไข่ตุ๋น, จี๊ด, ตู้ม | khun Fern |
| มะเขือ & มังคุด | khun Benz |
| Raptor | khun Eye |
| จู๋จี๋, เหมียว | P |

To add a pose, copy the cut from the design system (`assets/artwork/cast/<pet>/<pose>.png`), save it as WebP in `assets/cast/<pet>/`, and add the pose name to `SHIPPED` in `app/cast.js`. Mali and Khanom were retired on 9 October 2026 and are not used.

## Demo and training

- Open `?demo=1` (for example https://phemarajata.github.io/bxt50-tags/?demo=1) for the training mode used in the user guide screenshots. It never contacts the Apps Script.
- If the Apps Script cannot be reached, the app falls back to demo mode with PIN 1111 (guard), 2222 (office) and 3333 (committee) on sample data.

## User guide

The guide lives at https://phemarajata.github.io/bxt50-tags/guide/. Add `#office`, `#committee` or `#guard` to show (and print) one section only. Each section stands alone, so it can be handed to that group without the others. Print with the button at the top, A4, no margins.

`guide/index.html` is plain HTML with one `<section class="page">` per printed sheet, so small wording changes can be made there directly. Text that runs past the bottom of a page is cut off when printed, so check the page in a browser after editing. Screenshots in `guide/img/` come from `?demo=1` and show only fictional names. Retake them when a screen changes.

## Security notes

- The script URL and write key are in `config.js`, so treat the key as public. Personal PINs and the lockout (15 minutes after 10 wrong attempts) protect the data. The sheet itself stays private.
- No register data is stored in this repository. Everything is loaded through the Apps Script after sign-in.
- Camera scanning needs https, which GitHub Pages provides.
