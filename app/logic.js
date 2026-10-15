// ─────────────────────────────────────────────────────────────────────────────
// Tag scanner app logic: state, Apps Script calls, PIN login, QR scanning, saving.
// Carried over UNCHANGED from "Tag Scanner App.dc.html" in the Claude Design project
// (version of 15 Oct 2026, 17:14). Everything below the line is the original code.
//
// It expects two globals, set up in app/main.js before this file loads:
//   React    – React 18.3.1 (vendor/react-18.3.1.min.js)
//   DCLogic  – the base class (a plain React.Component that receives config.js as props)
// renderVals() returns the values the screens use; app/view.js draws them.
// Settings that used to live in the Design "Tweaks" panel are in config.js.
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_ID = '1ThiErI9f0oKn6tRy0xA6_xsvxYTKKPnr3GSioqfpnOI';
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz28A0-5sdtS4EHZldWZqt-_iMoz4NRffPPhcL7gBYkCqYMGsCll6IwYva8zjTFNewV4w/exec';
const DEFAULT_WRITE_KEY = 'brixton50-vehicle001';
const APP_URL = 'https://phemarajata.github.io/bxt50-tags/';
const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const ROLES = [
  { id: 'guard', th: 'รปภ.' },
  { id: 'office', th: 'สำนักงานนิติฯ' },
  { id: 'committee', th: 'กรรมการ' },
];
const DEMO_PINS = { '1111': { user_id: 'DEMO-G', name: 'รปภ. (ทดลอง)', role: 'guard' }, '2222': { user_id: 'DEMO-O', name: 'สำนักงาน (ทดลอง)', role: 'office' }, '3333': { user_id: 'DEMO-C', name: 'กรรมการ (ทดลอง)', role: 'committee' } };
const DEMO = {
  CO001: { tag_status: 'ใช้งาน', issue_date: '5 ต.ค. 69', issued_by: 'คุณอร', room_no: '1203', address_no: '3/121', resident_name: 'สมชาย ใจดี', phone: '081-234-5678', phone_2: '02-555-1234', line_id: 'somchai.j', plate: '1กข 1234', plate_province: 'กรุงเทพมหานคร', make: 'Toyota', model: 'Yaris Cross', colour: 'ขาวมุก', fuel: 'ไฮบริด', vehicle_no: '1', disabled_parking_ok: 'ไม่' },
  CO002: { tag_status: 'ใช้งาน', issue_date: '5 ต.ค. 69', issued_by: 'คุณอร', room_no: '1203', address_no: '3/121', resident_name: 'สมชาย ใจดี', phone: '081-234-5678', plate: '9กก 777', plate_province: 'นนทบุรี', make: 'BYD', model: 'Atto 3', colour: 'เทา', fuel: 'ไฟฟ้า', vehicle_no: '2', second_vehicle_fee_paid_through: '30 ก.ย. 69', disabled_parking_ok: 'ใช่', notes: 'มีบัตรผู้พิการของมารดา' },
  CR001: { tag_status: 'ใช้งาน', issue_date: '1 ส.ค. 69', expiry_date: '15 พ.ย. 69', lease_end: '15 พ.ย. 69', room_no: '807', address_no: '3/88', resident_name: 'Anna Keller', phone: '092-111-2233', line_id: 'anna.k', plate: 'ขค 4455', plate_province: 'กรุงเทพมหานคร', make: 'Honda', model: 'City', colour: 'แดง', fuel: 'น้ำมัน', vehicle_no: '1' },
  CR002: { tag_status: 'ใช้งาน', issue_date: '1 มี.ค. 69', expiry_date: '30 ก.ย. 69', lease_end: '30 ก.ย. 69', room_no: '1511', address_no: '3/150', resident_name: 'วิภา สุขสม', phone: '086-900-1122', plate: '3ขฉ 2020', plate_province: 'ปทุมธานี', make: 'MG', model: 'ZS EV', colour: 'น้ำเงิน', fuel: 'ไฟฟ้า', vehicle_no: '1' },
  MO001: { tag_status: 'ใช้งาน', issue_date: '5 ต.ค. 69', room_no: '305', address_no: '3/22', resident_name: 'ปกรณ์ มั่นคง', phone: '089-333-4444', plate: '1กท 998', plate_province: 'กรุงเทพมหานคร', make: 'Kawasaki', model: 'Z900', colour: 'เขียว', fuel: 'น้ำมัน', vehicle_no: '1', big_bike_ok: 'ใช่' },
  MR001: { tag_status: 'สูญหาย', issue_date: '1 ก.ค. 69', expiry_date: '30 มิ.ย. 70', room_no: '612', address_no: '3/61', resident_name: 'ณัฐ พงษ์ศรี', phone: '095-777-8899', plate: 'งจ 1212', plate_province: 'กรุงเทพมหานคร', make: 'Honda', model: 'PCX', colour: 'ดำ', fuel: 'น้ำมัน', vehicle_no: '1', notes: 'แจ้งหาย 10 ต.ค. 69 ออกบัตรใหม่ MR002' },
};
const DEMO_VIO = [
  { violation_id: 'V0001', serial: 'CO002', datetime: '12 ก.ย. 69 21:40', type: 'จอดรถในช่องจอด EV โดยไม่ได้ชาร์จ', reported_by: 'รปภ. สมศักดิ์', resolved: 'ใช่', notes: '' },
  { violation_id: 'V0002', serial: 'CO002', datetime: '3 ต.ค. 69 08:15', type: 'จอดรถกีดขวางผู้อื่น', reported_by: 'รปภ. วิชัย', resolved: 'ไม่', notes: 'ขวางทางลาดขึ้นชั้น 2' },
  { violation_id: 'V0003', serial: 'CR002', datetime: '20 ส.ค. 69 23:05', type: 'ขับยานพาหนะย้อนศร', reported_by: 'รปภ. สมศักดิ์', resolved: 'ใช่', notes: '' },
  { violation_id: 'V0004', serial: 'MO001', datetime: '9 ต.ค. 69 18:20', type: 'อื่น ๆ (โปรดระบุ)', reported_by: 'รปภ. วิชัย', resolved: 'ไม่', notes: 'จอดจักรยานยนต์ในช่องรถยนต์' },
];
function parseCSV(text) {
  const rows = [], n = text.length; let row = [], cell = '', q = false;
  for (let i = 0; i < n; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
function toObjects(rows) {
  const keys = (rows[0] || []).map(k => k.replace(/^\uFEFF/, '').trim());
  return rows.slice(2).filter(r => r.some(x => x && x.trim())).map((r, i) => Object.assign({ _row: i + 3 }, ...keys.map((k, j) => ({ [k]: (r[j] || '').trim() }))));
}
function parseThaiDate(s) {
  if (!s) return null;
  s = s.trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) { let y = +m[1]; if (y > 2400) y -= 543; return new Date(y, +m[2] - 1, +m[3]); }
  m = s.match(/^(\d{1,2})\s*([^\s\d]+)\s*(\d{2,4})/);
  if (m) {
    const mi = TH_MONTHS.findIndex(t => m[2].startsWith(t.replace('.', '')) || m[2] === t);
    if (mi < 0) return null;
    let y = +m[3]; if (y < 100) y += 2500; if (y > 2400) y -= 543;
    return new Date(y, mi, +m[1]);
  }
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) { let y = +m[3]; if (y < 100) y += 2500; if (y > 2400) y -= 543; return new Date(y, +m[2] - 1, +m[1]); }
  return null;
}
const LISTS = {
  tag_status: ['ยังไม่ออก', 'ใช้งาน', 'หมดอายุ', 'สูญหาย', 'ยกเลิก', 'คืนแล้ว'],
  fuel: ['', 'น้ำมัน', 'ไฮบริด', 'ไฟฟ้า'],
  yn: ['', 'ใช่', 'ไม่'],
  vehicle_no: ['1', '2'],
  violation_type: ['จอดในที่คนพิการเกินเวลาที่กำหนด', 'จอดในที่คนพิการโดยไม่ได้รับอนุญาต', 'ขับยานพาหนะย้อนศร', 'จอดรถในที่ห้ามจอด', 'จอดรถกีดขวางผู้อื่น', 'จอดรถในช่องจอด EV โดยไม่ได้ชาร์จ', 'จอดรถในช่อง EV ค้างไว้เกิน 15 นาทีหลังชาร์จหยุด', 'อื่น ๆ (โปรดระบุ)'],
};
const TAG_FIELDS = [
  { sec: 'STATUS', k: 'tag_status', label: 'สถานะบัตร', sel: 'tag_status', def: 'ยังไม่ออก' },
  { sec: 'STATUS', k: 'issue_date', label: 'วันที่ออกบัตร', ph: '15 ม.ค. 70', mono: true },
  { sec: 'STATUS', k: 'expiry_date', label: 'วันหมดอายุบัตร (ผู้เช่า)', ph: '31 ธ.ค. 70', mono: true },
  { sec: 'STATUS', k: 'issued_by', label: 'ผู้ออกบัตร' },
  { sec: 'STATUS', k: 'previous_serial', label: 'เลขบัตรเดิม', ph: 'CO012', mono: true },
  { sec: 'RESIDENT', k: 'room_no', label: 'เลขห้อง', mono: true, mode: 'numeric' },
  { sec: 'RESIDENT', k: 'address_no', label: 'บ้านเลขที่', ph: '3/121', mono: true },
  { sec: 'RESIDENT', k: 'resident_name', label: 'ชื่อ-สกุล' },
  { sec: 'RESIDENT', k: 'phone', label: 'โทรศัพท์', mono: true, mode: 'tel' },
  { sec: 'RESIDENT', k: 'phone_2', label: 'โทรศัพท์สำรอง', mono: true, mode: 'tel' },
  { sec: 'RESIDENT', k: 'line_id', label: 'LINE ID', mono: true },
  { sec: 'RESIDENT', k: 'lease_end', label: 'สิ้นสุดสัญญาเช่า', ph: '31 ธ.ค. 70', mono: true },
  { sec: 'VEHICLE', k: 'plate', label: 'ทะเบียนรถ', ph: '1กข 1234', mono: true },
  { sec: 'VEHICLE', k: 'plate_province', label: 'จังหวัด', ph: 'กรุงเทพมหานคร' },
  { sec: 'VEHICLE', k: 'make', label: 'ยี่ห้อ' },
  { sec: 'VEHICLE', k: 'model', label: 'รุ่น' },
  { sec: 'VEHICLE', k: 'colour', label: 'สี' },
  { sec: 'VEHICLE', k: 'fuel', label: 'ระบบขับเคลื่อน', sel: 'fuel' },
  { sec: 'APPROVALS & FEES', k: 'vehicle_no', label: 'รถคันที่', sel: 'vehicle_no', def: '1' },
  { sec: 'APPROVALS & FEES', k: 'second_vehicle_fee_paid_through', label: 'ค่าธรรมเนียมรถคันที่ 2 ชำระถึง', ph: '30 ก.ย. 70', mono: true },
  { sec: 'APPROVALS & FEES', k: 'disabled_parking_ok', label: 'อนุญาตช่องผู้พิการ (รถยนต์)', sel: 'yn' },
  { sec: 'APPROVALS & FEES', k: 'big_bike_ok', label: 'อนุญาตช่องบิ๊กไบค์ (จักรยานยนต์)', sel: 'yn' },
  { sec: 'NOTES', k: 'notes', label: 'หมายเหตุ' },
];
const VIO_FIELDS = [
  { sec: 'INCIDENT', k: 'type', label: 'ประเภทการกระทำผิด', sel: 'violation_type' },
  { sec: 'INCIDENT', k: 'notes', label: 'รายละเอียด (จำเป็นกรณี "อื่น ๆ")', ph: 'โปรดระบุ' },
  { sec: 'INCIDENT', k: 'datetime', label: 'วัน-เวลา (เว้นว่าง = ตอนนี้)', ph: '15 ต.ค. 69 21:40', mono: true },
  { sec: 'INCIDENT', k: 'reported_by', label: 'ผู้รายงาน (เว้นว่าง = ชื่อท่าน)', ph: 'รปภ. สมศักดิ์' },
  { sec: 'STATUS', k: 'resolved', label: 'ปิดเรื่องแล้ว', sel: 'yn' },
];
function todayThai() { const d = new Date(); return d.getDate() + ' ' + TH_MONTHS[d.getMonth()] + ' ' + String(d.getFullYear() + 543).slice(2); }
async function shrinkPhoto(file) {
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (e) {
    bmp = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
  }
  const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.72);
}
const yes = v => /^(ใช่|yes|y|true|1)$/i.test((v || '').trim());
const driveThumb = u => { const m = (u || '').match(/[-\w]{25,}/); return m ? `https://drive.google.com/thumbnail?id=${m[0]}&sz=w800` : (u || ''); };

class Component extends DCLogic {
  state = { role: null, user: null, pin: '', pinError: '', loggingIn: false, screen: 'scan', tags: [], vios: [], sync: 'loading', manual: '', query: '', serial: null, lookupError: '', cam: 'idle', camMsg: '' };
  videoRef = React.createRef();
  inviteVideoRef = React.createRef();
  componentDidMount() {
    try { const s = JSON.parse(localStorage.getItem((/[?&]demo=1/.test(location.search) ? 'bxt-tag-session-guide' : 'bxt-tag-session')) || 'null'); if (s && s.role && s.last && Date.now() - s.last < (s.idleMin || 5) * 60000) { this.lastActive = Date.now(); this.setState({ role: s.role, user: s }); } else localStorage.removeItem((/[?&]demo=1/.test(location.search) ? 'bxt-tag-session-guide' : 'bxt-tag-session')); } catch (e) {}
    this.lastActive = this.lastActive || Date.now();
    try { const iv = new URLSearchParams(location.search).get('invite'); if (iv) this.setState({ redeemMode: true, inviteCode: iv.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) }); } catch (e) {}
    this.onActivity = () => {
      this.lastActive = Date.now();
      if (this.state.user && this.state.user.token && this.state.script === 'ok' && Date.now() - (this.lastPing || 0) > 60000) { this.lastPing = Date.now(); this.post({ action: 'ping' }).catch(() => {}); }
      if (this.state.user && Date.now() - (this.lastSaved || 0) > 10000) { this.lastSaved = Date.now(); try { localStorage.setItem((/[?&]demo=1/.test(location.search) ? 'bxt-tag-session-guide' : 'bxt-tag-session'), JSON.stringify({ ...this.state.user, last: this.lastActive })); } catch (e) {} }
    };
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev => window.addEventListener(ev, this.onActivity, { passive: true, capture: true }));
    this.pingScript().then(() => this.load());
    this.clockTimer = setInterval(() => {
      if (this.state.role && Date.now() - this.lastActive > this.idleMin() * 60000) this.logout('ออกจากระบบอัตโนมัติ — ไม่มีการใช้งานเกิน ' + this.idleMin() + ' นาที');
      this.setState({ now: new Date() });
    }, 1000);
  }
  componentDidUpdate(prev) { if (prev.scriptUrl !== this.props.scriptUrl) this.pingScript(); }
  componentWillUnmount() { this.stopCam(); clearInterval(this.clockTimer); ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev => window.removeEventListener(ev, this.onActivity, { capture: true })); }
  idleMin() { return +(this.state.user && this.state.user.idleMin) || +this.state.idleMin || 5; }
  clock() {
    const d = this.state.now || new Date();
    const dow = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'][d.getDay()];
    const p = n => String(n).padStart(2, '0');
    return `${dow} ${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${String(d.getFullYear() + 543).slice(2)} · ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
  async load() {
    const u = this.state.user;
    if (u && u.token && this.state.script === 'ok') {
      this.setState({ sync: 'loading' });
      try {
        const j = await this.post({ action: 'data' });
        if (!j.ok) throw new Error(j.error);
        this.setState({ tags: j.tags, vios: j.vios, sync: 'live', syncAt: new Date() });
      } catch (e) { this.setState({ sync: 'error' }); }
      return;
    }
    if (this.state.script === 'ok') { this.setState({ tags: [], vios: [], sync: 'locked' }); return; }
    try {
      const t = await fetch((window.__resources && window.__resources.tagsCsv) || 'register/Tags.csv').then(r => r.text());
      this.setState({ tags: toObjects(parseCSV(t)), vios: [], sync: 'local' });
    } catch (e2) { this.setState({ sync: 'error' }); }
  }
  demo() { return this.state.script !== 'ok' && (this.props.demoData ?? true); }
  record(serial) {
    const base = this.state.tags.find(t => t.serial === serial);
    if (!base) return null;
    if (this.demo() && !base.resident_name && DEMO[serial]) return { ...base, ...DEMO[serial] };
    return base;
  }
  allViolations() {
    if (this.state.vios.length || !this.demo()) return this.state.vios;
    return DEMO_VIO;
  }
  violationsFor(serial) {
    const live = this.state.vios.filter(v => v.serial === serial);
    if (live.length || !this.demo()) return live;
    return DEMO_VIO.filter(v => v.serial === serial);
  }
  status(r) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yr = +(this.props.tagYear ?? 2570) - 543;
    const s = r.tag_status;
    if (!s || s === 'ยังไม่ออก') return { text: 'ยังไม่ออกบัตร', color: '#5B6B85', bg: '#E9ECF2', sub: 'เลขนี้ยังไม่ได้ลงทะเบียนกับรถคันใด', ok: false };
    if (s === 'สูญหาย') return { text: 'แจ้งหาย', color: '#B3261E', bg: '#FDECEA', sub: 'บัตรนี้ถูกแจ้งหายแล้ว หากพบบนรถ กรุณาแจ้งสำนักงานนิติฯ', ok: false };
    if (s === 'ยกเลิก' || s === 'คืนแล้ว') return { text: s === 'ยกเลิก' ? 'ยกเลิกแล้ว' : 'คืนบัตรแล้ว', color: '#B3261E', bg: '#FDECEA', sub: 'บัตรนี้ไม่มีสิทธิ์จอดในโครงการ', ok: false };
    const exp = parseThaiDate(r.expiry_date) || new Date(yr, 11, 31);
    const days = Math.round((exp - today) / 86400000);
    const expText = `${exp.getDate()} ${TH_MONTHS[exp.getMonth()]} ${exp.getFullYear() + 543}`;
    if (days < 0) return { text: 'บัตรหมดอายุ', color: '#B3261E', bg: '#FDECEA', sub: `บัตรหมดอายุเมื่อ ${expText} (${-days} วันที่แล้ว)`, ok: false };
    if (days <= 30) return { text: 'บัตรใกล้หมดอายุ', color: '#9A5B00', bg: '#FFF3DC', sub: `บัตรหมดอายุ ${expText} (อีก ${days} วัน)`, ok: true };
    return { text: 'บัตรใช้ได้', color: '#1B7F3B', bg: '#E4F4E8', sub: `บัตรใช้ได้ถึง ${expText}`, ok: true };
  }
  go(serial) {
    serial = (serial || '').toUpperCase().replace(/\s+/g, '');
    const m = serial.match(/\b([CM][OR]\d{3})\b/);
    serial = m ? m[1] : serial;
    if (!this.record(serial)) { const msg = `ไม่พบเลขบัตร ${serial} ในทะเบียน`; if (this.state.lookupError !== msg) this.setState({ lookupError: msg }); return false; }
    this.stopCam();
    this.setState({ serial, screen: 'record', lookupError: '', manual: '' });
    if (this.state.script === 'ok') this.post({ action: 'log', serial, detail: 'role=' + this.state.role }).catch(() => {});
    const rr = this.record(serial);
    if (rr && rr.vehicle_photo && this.state.script === 'ok' && !(this.state.photos || {})[serial]) {
      this.setState({ photoLoading: true });
      this.post({ action: 'photo', serial }).then(j => this.setState({ photoLoading: false, photos: { ...(this.state.photos || {}), ...(j.ok ? { [serial]: j.data } : {}) } })).catch(() => this.setState({ photoLoading: false }));
    }
  }
  async startCam(ref, onCode) {
    ref = ref || this.videoRef; onCode = onCode || (c => this.go(c, true));
    const v = ref.current;
    const inv = ref === this.inviteVideoRef;
    const fail = msg => { this.stopCam(); this.setState(inv ? { invCam: false, pinError: msg } : { cam: 'off', camMsg: msg }); };
    const native = 'BarcodeDetector' in window;
    if (!native && !window.jsQR) return fail(inv ? 'โหลดตัวสแกนไม่สำเร็จ — กรุณาพิมพ์รหัสเชิญ' : 'โหลดตัวสแกนไม่สำเร็จ — กรุณาพิมพ์เลขบัตรด้านล่าง');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return fail(inv ? 'เบราว์เซอร์นี้เปิดกล้องไม่ได้ — กรุณาพิมพ์รหัสเชิญ' : 'เบราว์เซอร์นี้เปิดกล้องไม่ได้ — กรุณาพิมพ์เลขบัตรด้านล่าง');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      v.setAttribute('playsinline', ''); v.muted = true;
      v.srcObject = this.stream; await v.play();
      if (!inv) this.setState({ cam: 'on', camMsg: 'เล็ง QR บนบัตรให้อยู่ในกรอบ' });
      let det = null;
      if (native) { try { det = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { det = null; } }
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d', { willReadFrequently: true });
      let last = 0;
      const tick = async t => {
        if (!this.stream) return;
        if (t - last > 120 && v.readyState >= 2 && v.videoWidth) {
          last = t;
          try {
            if (det) { const codes = await det.detect(v); if (codes.length) { if (onCode(codes[0].rawValue) !== false) return; } }
            else {
              const s = Math.min(1, 640 / Math.max(v.videoWidth, v.videoHeight));
              canvas.width = Math.round(v.videoWidth * s); canvas.height = Math.round(v.videoHeight * s);
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
              if (code && code.data && onCode(code.data) !== false) return;
            }
          } catch (e) {}
        }
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    } catch (e) { fail('เปิดกล้องไม่ได้ — อนุญาตการใช้กล้องในการตั้งค่าเบราว์เซอร์ แล้วลองอีกครั้ง หรือ' + (inv ? 'พิมพ์รหัสเชิญแทน' : 'พิมพ์เลขบัตรแทน')); }
  }
  stopCam() {
    cancelAnimationFrame(this.raf);
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    if (this.state.cam === 'on' || this.state.invCam) this.setState({ cam: 'idle', camMsg: '', invCam: false });
  }
  endpoint() { if (/[?&]demo=1/.test(location.search)) return ''; return (this.props.scriptUrl || DEFAULT_SCRIPT_URL).trim(); }
  guideDemo() { return /[?&]demo=1/.test(location.search); }
  wkey() { return this.props.writeKey || DEFAULT_WRITE_KEY; }
  async post(body) {
    const url = this.endpoint(); if (!url) throw new Error('no endpoint');
    const u = this.state.user || {};
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ key: this.wkey(), token: u.token, ...body }) });
    const j = await r.json();
    if (!j.ok && j.error === 'session') {
      if (body.action !== 'updateTag' && body.action !== 'addViolation') this.logout('หมดเวลาใช้งาน กรุณาใส่ PIN อีกครั้ง');
      else {
        const lj = await (await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ key: this.wkey(), action: 'login', pin: body.pin }) })).json();
        if (lj.ok && lj.user_id === u.user_id) {
          const nu = { ...u, token: lj.token, last: Date.now() };
          this.setState({ user: nu }); try { localStorage.setItem((/[?&]demo=1/.test(location.search) ? 'bxt-tag-session-guide' : 'bxt-tag-session'), JSON.stringify(nu)); } catch (e) {}
          const r2 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ key: this.wkey(), ...body, token: lj.token }) });
          return r2.json();
        }
      }
      throw new Error('หมดเวลาใช้งาน — ข้อมูลในฟอร์มยังอยู่ ใส่ PIN แล้วกดบันทึกอีกครั้ง');
    }
    return j;
  }
  async login() {
    const pin = this.state.pin; if (!/^\d{4}$/.test(pin)) { this.setState({ pinError: 'PIN ต้องเป็นตัวเลข 4 หลัก' }); return; }
    this.setState({ loggingIn: true, pinError: '' });
    try {
      let u;
      if (this.endpoint() && this.state.script === 'ok') {
        const j = await this.post({ action: 'login', pin });
        if (!j.ok) throw new Error(j.error === 'locked' ? 'ใส่ PIN ผิดหลายครั้ง ระบบหยุดรับชั่วคราว 15 นาที' : j.error === 'pin' ? 'รหัส PIN ไม่ถูกต้องหรือถูกระงับ' : j.error === 'unknown action' ? 'สคริปต์เป็นเวอร์ชันเก่า — ใช้ PIN ทดลองไปก่อน' : 'เข้าสู่ระบบไม่ได้: ' + j.error);
        u = { token: j.token, user_id: j.user_id, name: j.name, role: j.role, idleMin: j.idle_minutes || 5 };
      } else {
        u = DEMO_PINS[pin]; if (!u) throw new Error('รหัส PIN ไม่ถูกต้อง');
        if (this.guideDemo()) u = { ...u, name: { guard: 'สมศักดิ์ ใจกล้า', office: 'อรวรรณ ศรีสุข', committee: 'ประเสริฐ วงศ์ใหญ่' }[u.role] };
      }
      this.lastActive = Date.now();
      u = { idleMin: this.state.idleMin || 5, ...u, last: this.lastActive };
      try { localStorage.setItem((/[?&]demo=1/.test(location.search) ? 'bxt-tag-session-guide' : 'bxt-tag-session'), JSON.stringify(u)); } catch (e) {}
      this.setState({ role: u.role, user: u, pin: '', loggingIn: false, screen: 'scan', serial: null, loginNotice: '' }, () => this.load());
    } catch (e) { this.setState({ loggingIn: false, pinError: e.message, pin: '' }); this.pingScript(); }
  }
  async bootstrap() {
    const f = this.state.bf || {};
    if (!(f.name || '').trim()) return this.setState({ pinError: 'กรุณากรอกชื่อ' });
    if (!/^\d{4}$/.test(f.new_pin || '')) return this.setState({ pinError: 'PIN ต้องเป็นตัวเลข 4 หลัก' });
    if (f.new_pin !== f.new_pin2) return this.setState({ pinError: 'PIN ทั้งสองช่องไม่ตรงกัน' });
    this.setState({ bBusy: true, pinError: '' });
    try {
      const r = await fetch(this.endpoint(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ key: this.wkey(), action: 'bootstrap', user_id: 'OF01', name: f.name.trim(), new_pin: f.new_pin }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error === 'session' ? 'unknown action' : j.error);
      await this.pingScript();
      this.setState({ bBusy: false, bf: {}, pin: f.new_pin });
      await this.login();
    } catch (e) { this.setState({ bBusy: false, pinError: e.message === 'unknown action' ? 'สคริปต์ยังไม่มีคำสั่ง bootstrap — วาง register/apps-script.gs ล่าสุดแล้ว deploy เวอร์ชันใหม่ หรือเพิ่มผู้ใช้ในแท็บ Users โดยตรง (พิมพ์ PIN ใน set_pin → เมนู Tag Register → Hash pending PINs)' : 'สร้างผู้ใช้ไม่สำเร็จ: ' + e.message }); }
  }
  logout(notice) { this.stopCam(); this.setState({ welcome: '' }); try { localStorage.removeItem((/[?&]demo=1/.test(location.search) ? 'bxt-tag-session-guide' : 'bxt-tag-session')); } catch (e) {} this.setState({ role: null, user: null, screen: 'scan', serial: null, pin: '', form: {}, confirmPin: '', uf: null, photos: {}, invite: null, tags: this.state.script === 'ok' ? [] : this.state.tags, vios: this.state.script === 'ok' ? [] : this.state.vios, sync: this.state.script === 'ok' ? 'locked' : this.state.sync, loginNotice: typeof notice === 'string' ? notice : '' }); }
  openEdit(kind) {
    const rec = this.record(this.state.serial) || {};
    const form = {};
    const registering = kind === 'tag' && (!rec.tag_status || rec.tag_status === 'ยังไม่ออก');
    if (kind === 'tag') TAG_FIELDS.forEach(f => { form[f.k] = rec[f.k] || (f.def || ''); });
    if (registering) {
      form.tag_status = 'ใช้งาน'; form.issue_date = todayThai(); form.issued_by = (this.state.user || {}).name || '';
      if ((rec.tag_type || '')[1] === 'O') form.expiry_date = '31 ธ.ค. ' + String(+(this.props.tagYear ?? 2570)).slice(2);
    }
    else { form.type = LISTS.violation_type[0]; form.notes = ''; form.datetime = ''; form.reported_by = ''; form.resolved = 'ไม่'; }
    this.setState({ screen: 'edit', editKind: kind, registering, form, saveMsg: null, saving: false, confirmChecked: false, confirmPin: '', newPhoto: null });
  }
  async pingScript() {
    const url = this.endpoint();
    if (!url) { this.setState({ script: 'none' }); return; }
    this.setState({ script: 'checking' });
    try {
      const j = await fetch(url).then(r => r.json());
      this.setState({ script: !(j && j.ok) ? 'bad' : (j.v >= 2 ? 'ok' : 'old'), scriptUsers: j && j.users, scriptV: j && j.v, idleMin: (j && j.idle_minutes) || 5 });
    } catch (e) { this.setState({ script: 'bad' }); }
  }
  async openUsers() {
    this.setState({ screen: 'users', users: null, usersMsg: null, invite: null, uf: { name: '', role: 'guard', my_pin: (this.state.uf || {}).my_pin || '' }, uBusy: false });
    if (this.guideDemo()) { this.setState({ users: [
      { user_id: 'OF01', name: 'อรวรรณ ศรีสุข', role: 'office', active: true, last_login: '15 ต.ค. 69 16:40' },
      { user_id: 'CM01', name: 'ประเสริฐ วงศ์ใหญ่', role: 'committee', active: true, last_login: '14 ต.ค. 69 20:12' },
      { user_id: 'GD01', name: 'สมศักดิ์ ใจกล้า', role: 'guard', active: true, last_login: '15 ต.ค. 69 07:58' },
      { user_id: 'INV-K7MP', name: 'วิชัย มั่นคง', role: 'guard', active: true, pending: true, invite_exp: '17 ต.ค. 69 09:30' },
      { user_id: 'GD02', name: 'ธนา รักษ์ดี', role: 'guard', active: false, last_login: '2 ต.ค. 69 22:05' },
    ] }); return; }
    if (this.state.script !== 'ok') { this.setState({ users: [], usersMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'โหมดทดลอง — ต้องเชื่อมต่อสคริปต์เวอร์ชันใหม่ก่อนจึงจะจัดการผู้ใช้ได้' } }); return; }
    try { const j = await this.post({ action: 'listUsers' }); this.setState({ users: j.ok ? j.users : [], usersMsg: j.ok ? null : { bg: '#FDECEA', fg: '#B3261E', text: j.error } }); }
    catch (e) { this.setState({ users: [], usersMsg: { bg: '#FDECEA', fg: '#B3261E', text: e.message } }); }
  }
  async userAction(body, okText) {
    if (this.guideDemo() && body.action === 'addUser') { this.setState({ invite: this.makeInvite({ name: body.name, role: body.role, code: 'K7MP3X', expires: '17 ต.ค. 69 09:30' }, false) }); return; }
    if (this.state.script !== 'ok') return;
    if (!/^\d{4}$/.test((this.state.uf || {}).my_pin || '')) return this.setState({ usersMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'กรุณากรอก PIN ของท่านในช่องด้านบนก่อน' } });
    this.setState({ uBusy: true, usersMsg: null });
    try {
      const j = await this.post({ ...body, pin: this.state.uf.my_pin });
      if (!j.ok) throw new Error(j.error === 'pin' ? 'PIN ของท่านไม่ถูกต้อง' : j.error === 'unknown action' ? 'สคริปต์ยังเป็นเวอร์ชันเก่า — วาง apps-script.gs ล่าสุดแล้ว deploy ใหม่' : j.error);
      const lj = await this.post({ action: 'listUsers' });
      const invite = j.code ? this.makeInvite(j, body.action === 'reinvite') : null;
      this.setState({ uBusy: false, users: lj.ok ? lj.users : this.state.users, usersMsg: invite ? null : { bg: '#E4F4E8', fg: '#1B7F3B', text: okText }, invite, copied: false, uf: { ...this.state.uf, name: '' } });
    } catch (e) { this.setState({ uBusy: false, usersMsg: { bg: '#FDECEA', fg: '#B3261E', text: 'ไม่สำเร็จ: ' + e.message } }); }
  }
  makeInvite(j, reset) {
    const base = /github\.io$/.test(location.hostname) ? location.origin + location.pathname : (this.props.appUrl || APP_URL);
    const link = base + '?invite=' + j.code;
    let qr = '';
    try { const q = window.qrcode(0, 'M'); q.addData(link); q.make(); qr = q.createDataURL(6, 2); } catch (e) {}
    const roleTh = ({ office: 'สำนักงานนิติฯ', committee: 'กรรมการ', guard: 'รปภ.' })[j.role] || j.role;
    const text = 'คำเชิญใช้งานแอปบัตรจอดรถ Brixton Phahol 50\nสำหรับ: ' + j.name + ' (' + roleTh + ')\nเปิดลิงก์แล้วตั้ง PIN 4 หลักด้วยตนเอง:\n' + link + '\nรหัสเชิญ: ' + j.code + ' · ใช้ได้ถึง ' + j.expires + '\nโปรดอย่าส่งต่อ';
    return { name: j.name, roleTh, code: j.code, expires: j.expires, link, qr, text, kind: reset ? 'PIN RESET' : 'INVITE' };
  }
  submitUser() {
    const f = this.state.uf || {};
    if (!(f.name || '').trim()) return this.setState({ usersMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'กรุณากรอกชื่อ' } });
    return this.userAction({ action: 'addUser', name: f.name.trim(), role: f.role || 'guard' }, '');
  }
  scanInvite() {
    this.setState({ invCam: true, pinError: '' }, () => this.startCam(this.inviteVideoRef, raw => {
      const s = String(raw || '').trim();
      const m = s.match(/[?&]invite=([A-Za-z0-9]{6})/) || s.match(/^([A-Za-z0-9]{6})$/);
      if (!m) { if (this.state.pinError !== 'QR นี้ไม่ใช่คำเชิญ — เล็ง QR คำเชิญอีกครั้ง') this.setState({ pinError: 'QR นี้ไม่ใช่คำเชิญ — เล็ง QR คำเชิญอีกครั้ง' }); return false; }
      this.stopCam();
      this.setState({ inviteCode: m[1].toUpperCase(), invCam: false, pinError: '' });
    }));
  }
  async redeem() {
    const S = this.state, code = (S.inviteCode || '').trim().toUpperCase();
    if (code.length < 6) return this.setState({ pinError: 'กรุณากรอกรหัสเชิญ 6 ตัว' });
    if (!/^\d{4}$/.test(S.rPin || '')) return this.setState({ pinError: 'PIN ต้องเป็นตัวเลข 4 หลัก' });
    if (S.rPin !== S.rPin2) return this.setState({ pinError: 'PIN ทั้งสองช่องไม่ตรงกัน' });
    this.setState({ rBusy: true, pinError: '' });
    try {
      const r = await fetch(this.endpoint(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ key: this.wkey(), action: 'redeem', code, new_pin: S.rPin }) });
      const j = await r.json();
      if (!j.ok) throw new Error({ invite: 'รหัสเชิญไม่ถูกต้องหรือถูกใช้ไปแล้ว', expired: 'คำเชิญหมดอายุ — ขอคำเชิญใหม่จากสำนักงานนิติฯ', suspended: 'บัญชีถูกระงับ', 'PIN already in use': 'PIN นี้มีผู้ใช้แล้ว กรุณาเลือก PIN อื่น', 'unknown action': 'สคริปต์ยังเป็นเวอร์ชันเก่า' }[j.error] || j.error);
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
      const pin = S.rPin;
      this.setState({ rBusy: false, redeemMode: false, inviteCode: '', rPin: '', rPin2: '', pin });
      await this.pingScript();
      await this.login();
      const u = this.state.user;
      if (u) this.setState({ welcome: 'ยินดีต้อนรับ ' + (u.name || j.name || '') + ' · ตั้ง PIN เรียบร้อยแล้ว' + ((u.user_id || j.user_id) ? ' · รหัสผู้ใช้ ' + (u.user_id || j.user_id) : '') });
    } catch (e) { this.setState({ rBusy: false, pinError: e.message, rPin: '', rPin2: '' }); }
  }
  async save() {
    const S = this.state, url = this.endpoint();
    if (!url) { this.setState({ saveMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'ยังไม่ได้ตั้งค่า Apps Script URL' } }); return; }
    if (S.script !== 'ok') { this.setState({ saveMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'บันทึกไม่ได้ในโหมดทดลอง — อัปเดตสคริปต์เป็นเวอร์ชันใหม่ก่อน' } }); return; }
    if (S.editKind === 'vio' && /^อื่น/.test(S.form.type || '') && !(S.form.notes || '').trim()) { this.setState({ saveMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'กรุณาระบุรายละเอียดสำหรับ "อื่น ๆ"' } }); return; }
    if (S.editKind === 'tag' && S.registering) {
      const miss = [['plate', 'ทะเบียนรถ'], ['room_no', 'เลขห้อง'], ['phone', 'โทรศัพท์']].filter(([k]) => !(S.form[k] || '').trim()).map(x => x[1]);
      if (!S.newPhoto) miss.push('รูปรถ');
      if ((this.record(S.serial).tag_type || '')[1] === 'R' && !(S.form.expiry_date || '').trim()) miss.push('วันหมดอายุบัตร (ผู้เช่า)');
      if (miss.length) { this.setState({ saveMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'กรุณากรอก: ' + miss.join(', ') } }); return; }
    }
    if (!S.confirmChecked) { this.setState({ saveMsg: { bg: '#FFF3DC', fg: '#9A5B00', text: 'กรุณาติ๊กยืนยันความถูกต้องของข้อมูล' } }); return; }
    this.setState({ saving: true, saveMsg: null });
    const body = S.editKind === 'tag'
      ? { action: 'updateTag', serial: S.serial, fields: S.form, pin: S.confirmPin, photo_b64: S.newPhoto ? S.newPhoto.split(',')[1] : undefined }
      : { action: 'addViolation', fields: { ...S.form, serial: S.serial }, pin: S.confirmPin };
    try {
      const j = await this.post(body);
      if (!j.ok) throw new Error(j.error === 'pin' ? 'รหัส PIN ไม่ถูกต้อง' : j.error === 'office only' ? 'เฉพาะสำนักงานนิติฯ เท่านั้นที่แก้ไขได้' : (j.error || 'save failed'));
      this.setState({ saving: false, saveMsg: { bg: '#E4F4E8', fg: '#1B7F3B', text: S.editKind === 'tag' ? 'บันทึกแล้ว · แถว ' + j.row : 'บันทึกแล้ว · ' + j.violation_id } });
      if (S.newPhoto) this.setState({ photos: { ...(this.state.photos || {}), [S.serial]: S.newPhoto } });
      await this.load();
      setTimeout(() => this.setState({ screen: 'record' }), 700);
    } catch (e) {
      this.setState({ saving: false, saveMsg: { bg: '#FDECEA', fg: '#B3261E', text: 'บันทึกไม่สำเร็จ: ' + e.message }, confirmPin: '' });
    }
  }
  renderVals() {
    const v = this.renderVals0();
    if (!this.guideDemo()) return v;
    return { ...v, demoLogin: false, demoChips: false, scriptColor: '#1B7F3B', scriptText: 'เชื่อมต่อฐานข้อมูลแล้ว · ผู้ใช้ 4 คน · บันทึกการเข้าใช้', syncColor: '#1B7F3B', syncText: 'ทะเบียนโหลดผ่านสคริปต์ (ชีตเป็นส่วนตัว) · 270 บัตร<br>'.replace('<br>', ''), noEndpoint: false };
  }
  renderVals0() {
    const S = this.state, role = S.role;
    const roleInfo = ROLES.find(r => r.id === role);
    const submitPin = () => this.login();
    const isLogin = !role, isScan = !!role && S.screen === 'scan', isRecord = !!role && S.screen === 'record';
    const canSearch = role === 'office' || role === 'committee';
    const q = S.query.trim().toLowerCase();
    const allRecs = canSearch && q ? S.tags.map(t => this.record(t.serial)).filter(Boolean) : [];
    const results = allRecs.filter(r => [r.plate, r.room_no, r.resident_name, r.serial, r.address_no].some(x => (x || '').toLowerCase().includes(q))).slice(0, 8).map(r => {
      const st = this.status(r);
      return { serial: r.serial, line: [r.plate, r.room_no && 'ห้อง ' + r.room_no, r.resident_name].filter(Boolean).join(' · ') || '—', color: st.color, statusText: st.text, open: () => this.go(r.serial) };
    });
    const demoChips = this.demo() && isScan ? Object.keys(DEMO).map(s => ({ serial: s, go: () => this.go(s) })) : false;
    const syncMap = { loading: ['#9A5B00', 'กำลังโหลดทะเบียน…'], live: ['#1B7F3B', `ทะเบียนโหลดผ่านสคริปต์ (ชีตเป็นส่วนตัว) · ${S.tags.length} บัตร`], locked: ['#5B6B85', 'ยังไม่โหลดทะเบียน'], local: ['#9A5B00', 'โหมดทดลอง — ข้อมูลตัวอย่างในเครื่อง'], error: ['#B3261E', 'โหลดทะเบียนไม่สำเร็จ'] };
    const video = React.createElement('video', { ref: this.videoRef, playsInline: true, muted: true, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: S.cam === 'on' ? 'block' : 'none' } });
    const scanLine = React.createElement('div', { style: { position: 'absolute', left: '18%', right: '18%', height: 2, background: '#E8762B', boxShadow: '0 0 12px #E8762B', animation: 'bxScan 2.4s ease-in-out infinite' } });

    let rec = {}, st = {}, rows = [], approvals = [], vios = [], feeFlag = false, photoUrl = '', sheetRowUrl = '#';
    if (S.serial) {
      rec = this.record(S.serial) || {};
      st = this.status(rec);
      const mono = "'JetBrains Mono',monospace", sans = 'inherit';
      const full = role === 'office' || role === 'committee';
      const guard = role === 'guard';
      const F = (k, label, icon, opt = {}) => rec[k] ? rows.push({ label, icon, value: rec[k], font: opt.mono ? mono : sans, tel: opt.tel ? 'tel:' + rec[k].replace(/[^\d+]/g, '') : false }) : null;
      {
        if (rec.plate) rows.push({ label: 'ทะเบียนรถ', icon: 'id-card', value: [rec.plate, rec.plate_province].filter(Boolean).join(' · '), font: mono, tel: false });
        if (rec.make || rec.model) rows.push({ label: 'รถ', icon: rec.tag_type && rec.tag_type[0] === 'M' ? 'bike' : 'car', value: [rec.make, rec.model, rec.colour, rec.fuel].filter(Boolean).join(' · '), font: sans, tel: false });
        F('room_no', 'เลขห้อง', 'door-open', { mono: true });
        if (full) { F('address_no', 'บ้านเลขที่', 'building-2', { mono: true }); F('resident_name', 'ชื่อ-สกุล', 'users'); }
        F('phone', 'โทรศัพท์', 'phone', { mono: true, tel: true });
        if (full) { F('phone_2', 'โทรศัพท์สำรอง', 'phone', { mono: true, tel: true }); F('line_id', 'LINE ID', 'message-circle', { mono: true }); F('issue_date', 'วันที่ออกบัตร', 'calendar-days', { mono: true }); F('expiry_date', 'วันหมดอายุบัตร', 'clock', { mono: true }); F('lease_end', 'สิ้นสุดสัญญาเช่า', 'calendar-days', { mono: true }); F('issued_by', 'ผู้ออกบัตร', 'file-check'); F('previous_serial', 'เลขบัตรเดิม', 'arrow-up-down', { mono: true }); F('notes', 'หมายเหตุ', 'clipboard-list'); }
        if (rec.vehicle_no === '2') {
          const pt = parseThaiDate(rec.second_vehicle_fee_paid_through);
          const over = !pt || pt < new Date();
          feeFlag = over ? { bg: '#FDECEA', fg: '#7A1C14', text: `รถคันที่ 2 · ค้างชำระค่าธรรมเนียม${rec.second_vehicle_fee_paid_through ? ' (ชำระถึง ' + rec.second_vehicle_fee_paid_through + ')' : ''}` } : { bg: '#E4F4E8', fg: '#145A2B', text: `รถคันที่ 2 · ชำระค่าธรรมเนียมถึง ${rec.second_vehicle_fee_paid_through}` };
        }
        const isCar = (rec.tag_type || '')[0] === 'C';
        if (isCar) approvals.push(yes(rec.disabled_parking_ok) ? { icon: 'square-parking', title: 'ช่องผู้พิการ', sub: 'อนุญาต', bg: '#0C2340', bd: '#0C2340', fg: '#fff' } : { icon: 'square-parking', title: 'ช่องผู้พิการ', sub: 'ไม่อนุญาต', bg: '#fff', bd: 'rgba(12,35,64,.16)', fg: '#5B6B85' });
        else approvals.push(yes(rec.big_bike_ok) ? { icon: 'bike', title: 'ช่องบิ๊กไบค์', sub: 'อนุญาต', bg: '#0C2340', bd: '#0C2340', fg: '#fff' } : { icon: 'bike', title: 'ช่องบิ๊กไบค์', sub: 'ไม่อนุญาต', bg: '#fff', bd: 'rgba(12,35,64,.16)', fg: '#5B6B85' });
        approvals.push(rec.fuel === 'ไฟฟ้า' ? { icon: 'plug-zap', title: 'รถไฟฟ้า EV', sub: 'ใช้ช่องชาร์จได้', bg: '#E4F4E8', bd: '#BFE3C8', fg: '#145A2B' } : { icon: 'zap', title: rec.fuel || 'ระบบขับเคลื่อน', sub: rec.fuel ? 'ไม่ใช้ช่องชาร์จ' : '—', bg: '#fff', bd: 'rgba(12,35,64,.16)', fg: '#5B6B85' });
        photoUrl = (S.photos || {})[S.serial] || '';
        const vl = this.violationsFor(S.serial);
        vios = vl.map(v => { const open = !yes(v.resolved); return { type: v.type || 'อื่น ๆ', datetime: v.datetime, line: [v.notes, v.reported_by && 'รายงานโดย ' + v.reported_by].filter(Boolean).join(' · '), state: open ? 'ยังไม่ปิดเรื่อง' : 'ปิดเรื่องแล้ว', color: open ? '#B3261E' : '#1B7F3B' }; });
        if (guard && vl.length) rows.push({ label: 'การกระทำผิด', icon: 'triangle-alert', value: vl.length + ' ครั้ง', font: mono, tel: false });
      }
      sheetRowUrl = `https://docs.google.com/spreadsheets/d/${this.props.sheetId || SHEET_ID}/edit#gid=0&range=A${rec._row || 1}`;
    }
    const isEdit = !!role && S.screen === 'edit';
    let sections = [];
    if (isEdit) {
      const defs = S.editKind === 'tag' ? TAG_FIELDS : VIO_FIELDS;
      const isCar = (rec.tag_type || '')[0] === 'C';
      const map = {};
      defs.forEach(f => {
        if (f.k === 'disabled_parking_ok' && !isCar) return;
        if (f.k === 'big_bike_ok' && isCar) return;
        if (f.k === 'second_vehicle_fee_paid_through' && S.form.vehicle_no !== '2') return;
        (map[f.sec] = map[f.sec] || []).push({
          label: f.label, value: S.form[f.k] ?? '', isSelect: !!f.sel, isText: !f.sel, options: f.sel ? LISTS[f.sel] : [], ph: f.ph || '', mode: f.mode || 'text',
          font: f.mono ? "'JetBrains Mono',monospace" : 'inherit',
          set: e => this.setState({ form: { ...this.state.form, [f.k]: e.target.value }, saveMsg: null }),
        });
      });
      sections = Object.keys(map).map(t => ({ title: t, fields: map[t] }));
    }
    const isUsers = !!role && S.screen === 'users';
    const isHistory = !!role && S.screen === 'history';
    const allV = canSearch ? this.allViolations() : [];
    const hf = S.histFilter || 'open', ht = S.histType || '';
    const histList = !isHistory ? [] : allV.filter(v => (hf === 'all' || (hf === 'open' ? !yes(v.resolved) : yes(v.resolved))) && (!ht || v.type === ht)).slice().reverse().map(v => {
      const open = !yes(v.resolved); const r = this.record(v.serial) || {};
      return { serial: v.serial, datetime: v.datetime, type: v.type || 'อื่น ๆ', line: [r.plate, r.room_no && 'ห้อง ' + r.room_no, v.notes, v.reported_by && 'รายงานโดย ' + v.reported_by].filter(Boolean).join(' · '), state: (open ? 'ยังไม่ปิดเรื่อง' : 'ปิดเรื่องแล้ว') + ' · ' + (v.violation_id || ''), color: open ? '#B3261E' : '#1B7F3B', open: () => this.go(v.serial) };
    });
    const histFilters = [['open', 'ยังไม่ปิดเรื่อง'], ['done', 'ปิดเรื่องแล้ว'], ['all', 'ทั้งหมด']].map(([id, label]) => ({ label, bg: hf === id ? '#0C2340' : '#fff', fg: hf === id ? '#fff' : '#0C2340', pick: () => this.setState({ histFilter: id }) }));
    const uf = S.uf || { name: '', role: 'guard', my_pin: '' };
    const roleTh = r => ({ office: 'สำนักงานนิติฯ', committee: 'กรรมการ', guard: 'รปภ.' })[r] || r;
    const userList = (S.users || []).map(u => ({
      ...u, roleTh: roleTh(u.role), op: u.active ? 1 : 0.55, toggleLabel: /^INV-/.test(u.user_id) ? 'ยกเลิก' : (u.active ? 'ระงับ' : 'เปิดใช้'),
      user_id: /^INV-/.test(u.user_id) ? 'รหัสผู้ใช้จะออกเมื่อตั้ง PIN' : u.user_id,
      stateTh: !u.active ? 'ระงับ' : u.pending ? (u.expired ? 'คำเชิญหมดอายุ — ส่งใหม่' : 'รอตั้ง PIN · ถึง ' + u.invite_exp) : 'ใช้งาน' + (u.last_login ? ' · ล่าสุด ' + u.last_login : ''),
      stateColor: !u.active ? '#5B6B85' : u.pending ? '#9A5B00' : '#1B7F3B', resetLabel: u.pending ? 'ส่งคำเชิญใหม่' : 'รีเซ็ต PIN',
      reset: () => this.userAction({ action: 'reinvite', user_id: u.user_id }, ''),
      toggle: () => /^INV-/.test(u.user_id) ? this.userAction({ action: 'cancelInvite', user_id: u.user_id }, 'ยกเลิกคำเชิญ ' + u.name + ' แล้ว') : this.userAction({ action: 'setActive', user_id: u.user_id, active: !u.active }, (u.active ? 'ระงับ ' : 'เปิดใช้ ') + u.name + ' แล้ว'),
    }));
    const setU = {}; ['name', 'role', 'my_pin'].forEach(k => { setU[k] = e => { let v = e.target.value; if (/pin/.test(k)) v = v.replace(/\D/g, '').slice(0, 4); this.setState({ uf: { ...this.state.uf, [k]: v }, usersMsg: null }); }; });
    const gd = this.guideDemo();
    return {
      ...(gd ? {} : {}),
      isHistory, histList, histFilters, histEmpty: isHistory && histList.length === 0, histTotal: allV.length + ' รายการ', openVioCount: allV.filter(v => !yes(v.resolved)).length,
      histTypes: [{ value: '', label: 'ทุกประเภท' }, ...LISTS.violation_type.map(t => ({ value: t, label: t }))], histType: ht, setHistType: e => this.setState({ histType: e.target.value }),
      openHistory: () => this.setState({ screen: 'history' }), welcome: S.welcome || false, closeWelcome: () => this.setState({ welcome: '' }),
      isUsers, userList, usersEmpty: isUsers && S.users && S.users.length === 0, usersEmptyText: S.users === null ? 'กำลังโหลด…' : 'ยังไม่มีผู้ใช้', usersMsg: S.usersMsg || false,
      uf, setU, uBusy: !!S.uBusy, uSubmitLabel: S.uBusy ? 'กำลังสร้าง…' : 'สร้างคำเชิญ', submitUser: () => this.submitUser(),
      invite: S.invite || false, copyLabel: S.copied ? 'คัดลอกแล้ว ✓' : 'คัดลอกข้อความ', closeInvite: () => this.setState({ invite: null }),
      shareInvite: async () => { const iv = S.invite; if (!iv) return; try { if (navigator.share) { await navigator.share({ text: iv.text }); return; } } catch (e) { return; } window.open('https://line.me/R/share?text=' + encodeURIComponent(iv.text), '_blank'); },
      copyInvite: async () => { try { await navigator.clipboard.writeText(S.invite.text); this.setState({ copied: true }); } catch (e) {} },
      redeemMode: !!S.redeemMode, redeemToggleLabel: S.redeemMode ? 'มี PIN แล้ว — เข้าสู่ระบบ' : 'ผู้ใช้ใหม่ / ได้รับคำเชิญ — สแกน QR หรือใส่รหัส', redeemToggleIcon: S.redeemMode ? 'lock' : 'qr-code',
      scanInvite: () => this.scanInvite(), stopInviteCam: () => this.stopCam(), invCamOff: !S.invCam, invCamDisplay: S.invCam ? 'block' : 'none',
      inviteVideo: React.createElement('video', { ref: this.inviteVideoRef, playsInline: true, muted: true, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }), loginMode: !S.redeemMode, toggleRedeem: () => { this.stopCam(); this.setState({ redeemMode: !S.redeemMode, pinError: '' }); }, inviteCode: S.inviteCode || '', rPin: S.rPin || '', rPin2: S.rPin2 || '', rBusy: !!S.rBusy, rLabel: S.rBusy ? 'กำลังตั้งค่า…' : 'ตั้ง PIN และเข้าใช้งาน', redeem: () => this.redeem(),
      setInviteCode: e => this.setState({ inviteCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6), pinError: '' }),
      setRPin: e => this.setState({ rPin: e.target.value.replace(/\D/g, '').slice(0, 4), pinError: '' }), setRPin2: e => this.setState({ rPin2: e.target.value.replace(/\D/g, '').slice(0, 4), pinError: '' }),
      openUsers: () => this.openUsers(), isGuard: role === 'guard',
      isEdit, sections, editEyebrow: S.editKind === 'tag' ? 'EDIT TAG' : 'NEW VIOLATION', editTitle: S.editKind === 'tag' ? (S.registering ? 'ลงทะเบียนรถใหม่' : 'แก้ไขข้อมูลบัตร') : 'บันทึกการกระทำผิด',
      editBtnLabel: (!rec.tag_status || rec.tag_status === 'ยังไม่ออก') ? 'ลงทะเบียนรถกับบัตรนี้' : 'แก้ไขข้อมูลบัตร',
      isTagEdit: isEdit && S.editKind === 'tag', photoPreview: S.newPhoto || (S.photos || {})[S.serial] || false, photoBtn: (S.newPhoto || (S.photos || {})[S.serial]) ? 'ถ่ายใหม่' : 'ถ่ายรูปรถ', photoReq: S.registering ? 'จำเป็น · ' : '',
      photoLoading: !!S.photoLoading && !photoUrl,
      onPhoto: async e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; try { this.setState({ newPhoto: await shrinkPhoto(f), saveMsg: null }); } catch (err) { this.setState({ saveMsg: { bg: '#FDECEA', fg: '#B3261E', text: 'อ่านรูปไม่ได้' } }); } },
      noEndpoint: isEdit && !this.endpoint(), saveMsg: S.saveMsg || false, saving: !!S.saving, saveDisabled: !!S.saving || !S.confirmChecked || (S.confirmPin || '').length !== 4, saveOpacity: (S.saving || !S.confirmChecked || (S.confirmPin || '').length !== 4) ? 0.5 : 1,
      confirmChecked: !!S.confirmChecked, toggleConfirm: e => this.setState({ confirmChecked: e.target.checked, saveMsg: null }), confirmPin: S.confirmPin || '', setConfirmPin: e => this.setState({ confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4), saveMsg: null }),
      scriptColor: S.script === 'ok' && S.scriptUsers === 0 ? '#9A5B00' : { none: '#5B6B85', checking: '#9A5B00', old: '#9A5B00', ok: '#1B7F3B', bad: '#B3261E' }[S.script || 'none'], scriptText: { none: 'ยังไม่เชื่อมต่อฐานข้อมูลผู้ใช้ (โหมดทดลอง · อ่านอย่างเดียว)', checking: 'กำลังตรวจสอบการเชื่อมต่อฐานข้อมูล…', old: 'สคริปต์เป็นเวอร์ชันเก่า — วาง register/apps-script.gs ใหม่ รัน setup แล้ว deploy เวอร์ชันใหม่ · ใช้ PIN ทดลองไปก่อน', ok: S.scriptUsers === 0 ? 'เชื่อมต่อฐานข้อมูลแล้ว · ยังไม่มีผู้ใช้ — ดูขั้นตอนด้านล่าง' : 'เชื่อมต่อฐานข้อมูลแล้ว · ผู้ใช้ ' + (S.scriptUsers || 0) + ' คน · บันทึกการเข้าใช้', bad: 'ฐานข้อมูลไม่ตอบสนอง — ตรวจสอบ URL / การ deploy' }[S.script || 'none'], saveLabel: S.saving ? 'กำลังบันทึก…' : 'บันทึกลง Google Sheets',
      save: () => this.save(), openEdit: () => this.openEdit('tag'), openVio: () => this.openEdit('vio'), backToRecord: () => this.setState({ screen: 'record' }),
      clock: this.clock(), role, roleLabel: roleInfo ? roleInfo.th : '', userLabel: S.user ? (S.user.name || roleInfo.th) : '', isLogin, isScan, isRecord,
      reping: () => this.pingScript(), needsBootstrap: S.script === 'ok' && S.scriptUsers === 0 && (S.scriptV || 0) >= 3, needsManualUser: S.script === 'ok' && S.scriptUsers === 0 && (S.scriptV || 0) < 3, bf: S.bf || {}, bBusy: !!S.bBusy, bLabel: S.bBusy ? 'กำลังสร้าง…' : 'สร้างบัญชีแรกและเข้าใช้งาน', bootstrap: () => this.bootstrap(),
      setB: Object.fromEntries(['name', 'new_pin', 'new_pin2'].map(k => [k, e => { let v = e.target.value; if (/pin/.test(k)) v = v.replace(/\D/g, '').slice(0, 4); this.setState({ bf: { ...(this.state.bf || {}), [k]: v }, pinError: '' }); }])),
      pin: S.pin, pinError: S.pinError || false, loggingIn: !!S.loggingIn, loginLabel: S.loggingIn ? 'กำลังตรวจสอบ…' : 'เข้าใช้งาน', demoLogin: S.script !== 'ok',
      setPin: e => this.setState({ pin: e.target.value.replace(/\D/g, '').slice(0, 4), pinError: '' }), pinKey: e => { if (e.key === 'Enter') submitPin(); }, submitPin,
      logout: () => this.logout(), loginNotice: S.loginNotice || false, idleNote: 'ออกจากระบบอัตโนมัติเมื่อไม่มีการใช้งาน ' + this.idleMin() + ' นาที',
      video, scanLine, camOn: S.cam === 'on', camIdle: S.cam !== 'on', camMsg: S.camMsg, startCam: () => this.startCam(),
      manual: S.manual, setManual: e => this.setState({ manual: e.target.value, lookupError: '' }), manualKey: e => { if (e.key === 'Enter') this.go(S.manual); }, lookupManual: () => this.go(S.manual), lookupError: S.lookupError,
      canSearch, query: S.query, setQuery: e => this.setState({ query: e.target.value }), results, demoChips,
      syncColor: syncMap[S.sync][0], syncText: syncMap[S.sync][1], reload: () => this.load(),
      rec, st, rows, approvals, vios, vioCount: vios.length, noVios: vios.length === 0, feeFlag, photoUrl, sheetRowUrl,
      showViolations: role === 'office' || role === 'committee', canEdit: role === 'office',
      back: () => this.setState({ screen: 'scan', serial: null }),
    };
  }
}


// ─────────────────────────────────────────────────────────────────────────────
export { Component as AppLogic, LISTS };
