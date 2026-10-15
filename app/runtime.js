// Small stand-in for the Claude Design runtime, so app/logic.js runs unchanged.
// Loaded as a classic script after React and before the app modules.
//   DCLogic        – base class of the app logic: a plain React component whose props come from config.js
//   __resources    – where the logic looks for the register CSV in demo mode. Only a sample file with no
//                    personal data is published; the real register is read through the Apps Script after sign-in.
window.DCLogic = class DCLogic extends React.Component {};
window.__resources = { tagsCsv: 'demo/tags-demo.csv' };
