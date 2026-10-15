// Settings for the tag scanner app. These used to be the "Tweaks" panel in Claude Design.
// Change a value here, commit, and GitHub Pages serves the new value within about a minute.
export default {
  // Apps Script web app that reads and writes the private Google Sheet (Deploy → Manage deployments → URL).
  scriptUrl: 'https://script.google.com/macros/s/AKfycbz28A0-5sdtS4EHZldWZqt-_iMoz4NRffPPhcL7gBYkCqYMGsCll6IwYva8zjTFNewV4w/exec',
  // Shared key the script checks on every call. It is visible to anyone who opens the page source,
  // so it is not a secret: personal PINs and the 15-minute lockout are what protect the data.
  writeKey: 'brixton50-vehicle001',
  // Buddhist-era year printed on this cycle's co-owner tags (they expire 31 Dec of this year).
  tagYear: 2570,
  // When the script cannot be reached, show sample records so the app can be tried out.
  demoData: true,
  // Address used in invite links when the app is not opened from github.io.
  appUrl: 'https://phemarajata.github.io/bxt50-tags/',
};
