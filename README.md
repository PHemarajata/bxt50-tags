# Publishing the tag scanner on GitHub Pages

The app is a single file: `index.html`, about 3.5 MB, with fonts, logo and icons built in. It holds no register data. Everything is loaded through the Apps Script after someone signs in with a PIN.

## One-time setup (about 5 minutes, in a browser)
1. Go to github.com/new. Owner: **PHemarajata**. Name: `bxt50-tags` (any name works). Visibility: **Public**. GitHub Pages needs Public on a free account, which is safe here because the file contains no resident data. Click Create.
2. On the new repo page, click **uploading an existing file**. Drag in `index.html` from this folder, then click **Commit changes**.
3. Go to Settings → **Pages**. Source: *Deploy from a branch*. Branch: `main`, folder `/ (root)`. Click Save.
4. Wait about 1 minute. The app will be at **https://phemarajata.github.io/bxt50-tags/**

Open it on a phone and add it to the home screen (Chrome menu → Add to Home screen). Camera scanning needs https, which GitHub Pages provides.

## Updating later
Re-export `index.html`, then in the repo click the file → ✎ or "Upload files" (replace) → Commit. The site updates within about 1 minute.

## Notes
- Invite links and QR codes point to the address the app is opened from. Create invites from the Pages address, not from the design preview.
- The script URL and write key are inside the file, so treat the key as public. What protects the data is the personal PINs plus the lockout, which pauses sign-in for 15 minutes after 10 failed attempts. The sheet itself stays private.
