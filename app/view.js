// ─────────────────────────────────────────────────────────────────────────────
// Screens of the tag scanner app. This is the markup of "Tag Scanner App.dc.html"
// rewritten as htm (HTML-like templates for React, no build step). Same structure,
// same styles, same Thai copy. `v` is whatever AppLogic.renderVals() returns.
//
// Template rules if you edit this file:
//   ${v.x}                         insert a value (was {{ x }})
//   ${when(v.x, () => html`…`)}    show only if truthy (was <sc-if>)
//   ${each(v.list, t => html`…`)}  repeat (was <sc-for>)
//   style="…"                      plain CSS text; ${…} can sit inside it
//   class="hov-accent"             orange button hover (was style-hover)
// The committee pets come from app/cast.js; see <${Pet}> below.
// ─────────────────────────────────────────────────────────────────────────────
import { Icon } from './icons.js';
import { castForDay } from './cast.js';

// React needs style objects; templates are easier to read with CSS text. Convert once, cache.
const styleCache = new Map();
function toStyle(css) {
  let o = styleCache.get(css);
  if (o) return o;
  o = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim(), val = decl.slice(i + 1).trim();
    if (!prop) continue;
    o[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
  }
  styleCache.set(css, o);
  return o;
}
function h(type, props, ...children) {
  if (props) {
    if (typeof props.style === 'string') props = { ...props, style: toStyle(props.style) };
    if (props.class) { props = { ...props, className: props.class }; delete props.class; }
  }
  return React.createElement(type, props, ...children);
}
export const html = htm.bind(h);
const when = (c, f) => (c ? f() : null);
const each = (list, f) => (list || []).map((x, i) => React.createElement(React.Fragment, { key: i }, f(x, i)));

const I = (name, size, opt = {}) => html`<${Icon} name=${name} size=${size} stroke=${opt.stroke ?? 1.75} color=${opt.color ?? 'currentColor'} />`;

// A committee pet. Height is fixed and width follows, so the whole cut (white keyline included)
// always sits inside its container. Decorative: the name is in alt for screen readers.
// `css` is extra CSS text (named css, not style, so it is not converted to an object on the way in).
function Pet({ p, height, css = '' }) {
  if (!p) return null;
  return html`<img src=${p.src} alt=${p.th} title=${p.th} draggable="false"
    style="height:${height}px;width:auto;max-width:45%;object-fit:contain;flex-shrink:0;user-select:none;pointer-events:none;${css}" />`;
}

// Shared input styles from the original markup (kept verbatim so the look does not drift).
const S_FIELD = "width:100%;min-width:0;box-sizing:border-box;font-size:15px;padding:10px 12px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:46px";
const S_BACK = "align-self:flex-start;background:transparent;border:0;padding:4px 0;color:#0C2340;font-weight:700;font-size:14px;cursor:pointer;min-height:32px";
const S_ERR = "color:#B3261E;font-size:13px;font-weight:700";

export function view(v) {
  const cast = castForDay();
  return html`
<div style="max-width:430px;margin:0 auto;min-height:100vh;background:#EEF1F6;display:flex;flex-direction:column;position:relative;box-shadow:0 0 0 1px rgba(12,35,64,.12)">

<div style="background:#0C2340;color:#fff;padding:14px 18px 12px;display:flex;align-items:center;gap:12px">
  <img src="assets/brixton-logo.png" alt="Brixton" style="height:34px;width:auto;flex-shrink:0;filter:brightness(0) invert(1)" />
  <div style="flex:1;min-width:0;margin-left:10px">
    <div style="font-weight:800;font-size:16px;line-height:1.2">ทะเบียนบัตรจอดรถ</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;color:#E8762B;margin-top:2px">${v.clock}</div>
  </div>
  ${when(v.role, () => html`
    <button onClick=${v.logout} style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:99px;padding:6px 10px 6px 12px;font-size:12px;font-weight:700;cursor:pointer;min-height:32px">
      ${v.userLabel}
      ${I('door-open', 16, { stroke: 2 })}
    </button>`)}
</div>
<div style="height:3px;background:linear-gradient(90deg,#E8762B 0 115px,#16304F 115px)"></div>

${when(v.isLogin, () => html`
<div style="padding:24px 20px 32px;display:flex;flex-direction:column;gap:18px;flex:1">
  <div style="display:flex;align-items:flex-end;gap:12px">
    <div style="flex:1;min-width:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;color:#E8762B">SIGN IN</div>
      <div style="font-size:24px;font-weight:800;color:#0C2340;line-height:1.2;margin-top:4px">รหัส PIN <span style="color:#E8762B">ส่วนตัว</span></div>
      <div style="font-size:14px;color:#5B6B85;margin-top:6px;line-height:1.5">รหัสประจำตัวที่สำนักงานนิติฯ ออกให้ · การเข้าใช้ทุกครั้งถูกบันทึก</div>
    </div>
    <${Pet} p=${cast.login} height=${104} />
  </div>
  ${when(v.loginNotice, () => html`
    <div style="background:#FFF3DC;border:1px solid #F0D29A;border-left:5px solid #9A5B00;border-radius:4px;padding:10px 12px;font-size:14px;font-weight:700;color:#5A3600">${v.loginNotice}</div>`)}
  ${when(v.redeemMode, () => html`
  <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-top:4px solid #E8762B;border-radius:4px;padding:16px;display:flex;flex-direction:column;gap:10px">
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#E8762B">FIRST-TIME · INVITE</div>
    <div style="font-size:14px;color:#13233B;line-height:1.5">1 · สแกน QR คำเชิญจากผู้ที่ให้สิทธิ์ หรือพิมพ์รหัสเชิญ 6 ตัว<br />2 · ตั้ง PIN 4 หลักของท่านเอง (ห้ามซ้ำกับผู้อื่น และห้ามบอกผู้อื่น)</div>
    <div style="position:relative;background:#0C2340;border-radius:4px;aspect-ratio:1/1;overflow:hidden;display:${v.invCamDisplay}">
      ${v.inviteVideo}
      <div style="position:absolute;inset:18%;border:2px solid rgba(255,255,255,.7);border-radius:6px;pointer-events:none"></div>
      <button onClick=${v.stopInviteCam} style="position:absolute;right:8px;top:8px;background:rgba(12,35,64,.8);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;min-height:32px">ปิดกล้อง</button>
    </div>
    ${when(v.invCamOff, () => html`
      <button onClick=${v.scanInvite} style="display:flex;align-items:center;justify-content:center;gap:8px;background:#0C2340;color:#fff;border:0;border-radius:4px;padding:12px;font-weight:800;font-size:15px;cursor:pointer;min-height:48px">
        ${I('qr-code', 20, { color: '#fff', stroke: 2 })}สแกน QR คำเชิญ
      </button>`)}
    <input value=${v.inviteCode} onChange=${v.setInviteCode} placeholder="รหัสเชิญ 6 ตัว" style="width:100%;min-width:0;box-sizing:border-box;font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:.25em;text-align:center;padding:8px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:50px;text-transform:uppercase" />
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <input type="password" inputMode="numeric" maxLength=${4} value=${v.rPin} onChange=${v.setRPin} placeholder="PIN ใหม่" style="width:100%;min-width:0;box-sizing:border-box;font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.3em;text-align:center;padding:8px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:50px" />
      <input type="password" inputMode="numeric" maxLength=${4} value=${v.rPin2} onChange=${v.setRPin2} placeholder="ยืนยัน PIN" style="width:100%;min-width:0;box-sizing:border-box;font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.3em;text-align:center;padding:8px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:50px" />
    </div>
    ${when(v.pinError, () => html`<div style=${S_ERR}>${v.pinError}</div>`)}
    <button onClick=${v.redeem} disabled=${v.rBusy} class="hov-accent" style="background:#E8762B;color:#fff;border:0;border-radius:4px;padding:12px;font-weight:800;font-size:16px;cursor:pointer;min-height:48px">${v.rLabel}</button>
  </div>`)}
  ${when(v.loginMode, () => html`
  <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-left:5px solid #0C2340;border-radius:4px;padding:16px;display:flex;flex-direction:column;gap:10px">
    <input type="password" inputMode="numeric" maxLength=${4} value=${v.pin} onChange=${v.setPin} onKeyDown=${v.pinKey} placeholder="••••" autoFocus=${true} style="font-family:'JetBrains Mono',monospace;font-size:28px;letter-spacing:.4em;text-align:center;padding:10px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;width:100%;box-sizing:border-box;min-height:56px" />
    ${when(v.pinError, () => html`<div style=${S_ERR}>${v.pinError}</div>`)}
    <button onClick=${v.submitPin} disabled=${v.loggingIn} class="hov-accent" style="background:#E8762B;color:#fff;border:0;border-radius:4px;padding:12px;font-weight:800;font-size:16px;cursor:pointer;min-height:48px">${v.loginLabel}</button>
  </div>`)}
  <button onClick=${v.toggleRedeem} style="display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#0C2340;border:1px solid rgba(12,35,64,.3);border-radius:4px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;min-height:48px">
    ${I(v.redeemToggleIcon, 18, { stroke: 2 })}${v.redeemToggleLabel}
  </button>
  <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#5B6B85">
    <span style="width:8px;height:8px;border-radius:99px;background:${v.scriptColor};flex-shrink:0"></span><span style="flex:1">${v.scriptText}</span>
    <button onClick=${v.reping} style="background:transparent;border:1px solid rgba(12,35,64,.25);border-radius:99px;padding:4px 12px;font-size:12px;cursor:pointer;color:#0C2340;min-height:28px;white-space:nowrap">ตรวจสอบอีกครั้ง</button>
  </div>
  ${when(v.needsManualUser, () => html`
    <div style="background:#FFF3DC;border:1px solid #F0D29A;border-left:5px solid #9A5B00;border-radius:4px;padding:12px 14px;font-size:13px;color:#5A3600;line-height:1.6">
      <b>ยังไม่มีผู้ใช้ในแท็บ Users</b> — เพิ่มบัญชีสำนักงานนิติฯ คนแรกในชีต: user_id <span style="font-family:'JetBrains Mono',monospace">OF01</span> · ชื่อ · role <span style="font-family:'JetBrains Mono',monospace">office</span> · พิมพ์ PIN 4 หลักในช่อง set_pin · active ใช่ → เมนู <b>Tag Register → Hash pending PINs</b> แล้วกดโหลดใหม่<br />หรือวาง register/apps-script.gs ล่าสุด (v3) แล้ว deploy เวอร์ชันใหม่ เพื่อสร้างบัญชีแรกจากหน้านี้ได้เลย
    </div>`)}
  ${when(v.needsBootstrap, () => html`
    <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-top:4px solid #E8762B;border-radius:4px;padding:14px;display:flex;flex-direction:column;gap:10px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#E8762B">FIRST-TIME SETUP</div>
      <div style="font-size:14px;color:#13233B;line-height:1.5">ฐานข้อมูลเชื่อมต่อแล้วแต่ยังไม่มีผู้ใช้ — สร้างบัญชีสำนักงานนิติฯ คนแรก (ต้องใช้ Write key ที่ตั้งไว้ใน config.js; ทำได้ครั้งเดียว)</div>
      <input value=${v.bf.name || ''} onChange=${v.setB.name} placeholder="ชื่อ-สกุล" style=${S_FIELD} />
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <input type="password" inputMode="numeric" maxLength=${4} value=${v.bf.new_pin || ''} onChange=${v.setB.new_pin} placeholder="PIN 4 หลัก" style="width:100%;min-width:0;box-sizing:border-box;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.3em;text-align:center;padding:8px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:46px" />
        <input type="password" inputMode="numeric" maxLength=${4} value=${v.bf.new_pin2 || ''} onChange=${v.setB.new_pin2} placeholder="ยืนยัน PIN" style="width:100%;min-width:0;box-sizing:border-box;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.3em;text-align:center;padding:8px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:46px" />
      </div>
      <button onClick=${v.bootstrap} disabled=${v.bBusy} style="background:#0C2340;color:#fff;border:0;border-radius:4px;padding:12px;font-weight:800;font-size:15px;cursor:pointer;min-height:48px">${v.bLabel}</button>
    </div>`)}
  ${when(v.demoLogin, () => html`
    <div style="font-size:12px;color:#5B6B85;line-height:1.6;background:#FFF3DC;border-radius:4px;padding:8px 12px">โหมดทดลอง (ยังไม่เชื่อมสคริปต์): PIN 1111 = รปภ. · 2222 = สำนักงานนิติฯ · 3333 = กรรมการ</div>`)}
  <div style="margin-top:auto;font-size:12px;color:#5B6B85;line-height:1.5">นิติบุคคลอาคารชุด บริกซ์ตัน เพ็ท แอนด์ เพลย์ พหล 50 สเตชั่น · 065-472-1182</div>
</div>`)}

${when(v.isScan, () => html`
<div style="padding:18px 20px 28px;display:flex;flex-direction:column;gap:14px;flex:1">
  <div style="position:relative;margin-top:${cast.scan.pose === 'peek' ? 34 : 0}px">
    ${when(cast.scan.pose === 'peek', () => html`<${Pet} p=${cast.scan} height=${52} css="position:absolute;right:18px;bottom:calc(100% - 8px);z-index:2;max-width:none" />`)}
    <div style="position:relative;background:#0C2340;border-radius:4px;aspect-ratio:1/1;overflow:hidden;display:flex;align-items:center;justify-content:center">
      ${v.video}
      <div style="position:absolute;inset:18%;border:2px solid rgba(255,255,255,.7);border-radius:6px;pointer-events:none"></div>
      ${when(v.camOn, () => v.scanLine)}
      ${when(v.camMsg, () => html`
        <div style="position:absolute;left:0;right:0;bottom:0;background:rgba(12,35,64,.82);color:#fff;font-size:13px;padding:10px 14px;text-align:center;line-height:1.4">${v.camMsg}</div>`)}
      ${when(v.camIdle, () => html`
        <button onClick=${v.startCam} style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;background:transparent;border:0;color:#fff;cursor:pointer;padding:20px">
          ${I('qr-code', 56, { stroke: 1.5 })}
          <span style="font-weight:800;font-size:16px">แตะเพื่อเปิดกล้องสแกน QR</span>
        </button>`)}
    </div>
  </div>
  ${when(cast.scan.pose !== 'peek', () => html`<div style="display:flex;justify-content:flex-end;margin-top:-6px"><${Pet} p=${cast.scan} height=${64} /></div>`)}
  <div style="display:flex;gap:8px">
    <input value=${v.manual} onChange=${v.setManual} onKeyDown=${v.manualKey} placeholder="หรือพิมพ์เลขบัตร เช่น CO001" style="flex:1;min-width:0;font-family:'JetBrains Mono',monospace;font-size:16px;padding:10px 12px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#fff;color:#0C2340;min-height:48px;text-transform:uppercase" />
    <button onClick=${v.lookupManual} style="background:#0C2340;color:#fff;border:0;border-radius:4px;padding:0 18px;font-weight:800;cursor:pointer;min-height:48px">ค้นหา</button>
  </div>
  ${when(v.lookupError, () => html`
    <div style="background:#FDECEA;border:1px solid #F3B8B2;border-left:5px solid #B3261E;border-radius:4px;padding:10px 12px;font-size:14px;color:#7A1C14;font-weight:700">${v.lookupError}</div>`)}
  ${when(v.canSearch, () => html`
    <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-radius:4px;padding:12px;display:flex;flex-direction:column;gap:10px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5B6B85">SEARCH REGISTER</div>
      <input value=${v.query} onChange=${v.setQuery} placeholder="ทะเบียนรถ · เลขห้อง · ชื่อ" style="font-size:15px;padding:10px 12px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:44px" />
      ${each(v.results, t => html`
        <button onClick=${t.open} style="display:flex;align-items:center;gap:10px;background:#F7F8FB;border:1px solid rgba(12,35,64,.1);border-left:4px solid ${t.color};border-radius:4px;padding:10px 12px;text-align:left;cursor:pointer;min-height:48px">
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#0C2340;min-width:56px">${t.serial}</span>
          <span style="flex:1;font-size:14px;color:#13233B">${t.line}</span>
          <span style="font-size:11px;font-weight:700;color:${t.color}">${t.statusText}</span>
        </button>`)}
    </div>`)}
  ${when(v.welcome, () => html`
    <div style="display:flex;align-items:center;gap:10px;background:#E4F4E8;border-left:5px solid #1B7F3B;border-radius:4px;padding:10px 12px;font-size:14px;font-weight:700;color:#145A2B">
      <span style="flex:1">${v.welcome}</span>
      <button onClick=${v.closeWelcome} style="background:transparent;border:0;color:#145A2B;font-size:18px;cursor:pointer;min-width:32px;min-height:32px">×</button>
    </div>`)}
  ${when(v.canSearch, () => html`
    <button onClick=${v.openHistory} style="display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#0C2340;border:1px solid rgba(12,35,64,.3);border-top:4px solid #E8762B;border-radius:4px;padding:11px;font-weight:700;font-size:14px;cursor:pointer;min-height:44px">
      ${I('clipboard-list', 18, { stroke: 2 })}ประวัติการกระทำผิดทั้งหมด · ${v.openVioCount} เรื่องค้าง
    </button>`)}
  ${when(v.canEdit, () => html`
    <button onClick=${v.openUsers} style="display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#0C2340;border:1px solid rgba(12,35,64,.3);border-radius:4px;padding:11px;font-weight:700;font-size:14px;cursor:pointer;min-height:44px">
      ${I('key-round', 18, { stroke: 2 })}จัดการผู้ใช้และรหัส PIN
    </button>`)}
  ${when(v.demoChips, () => html`
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5B6B85">DEMO · SIMULATE SCAN</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${each(v.demoChips, d => html`
          <button onClick=${d.go} style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;background:#fff;border:1px solid rgba(12,35,64,.25);border-radius:99px;padding:8px 14px;color:#0C2340;cursor:pointer;min-height:36px">${d.serial}</button>`)}
      </div>
    </div>`)}
  <div style="margin-top:auto;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#5B6B85">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:8px;height:8px;border-radius:99px;background:${v.syncColor};flex-shrink:0"></span><span style="flex:1">${v.syncText}<br />${v.idleNote}</span>
      <button onClick=${v.reload} style="margin-left:auto;background:transparent;border:1px solid rgba(12,35,64,.25);border-radius:99px;padding:4px 12px;font-size:12px;cursor:pointer;color:#0C2340;min-height:28px">โหลดใหม่</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:8px;height:8px;border-radius:99px;background:${v.scriptColor};flex-shrink:0"></span>${v.scriptText}
    </div>
  </div>
</div>`)}

${when(v.isRecord, () => html`
<div style="padding:16px 20px 32px;display:flex;flex-direction:column;gap:12px;flex:1">
  <button onClick=${v.back} style=${S_BACK}>← สแกนใหม่</button>

  <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-top:4px solid ${v.st.color};border-radius:4px;padding:16px;box-shadow:0 6px 22px rgba(12,35,64,.07);display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;align-items:flex-start;gap:12px">
      <div style="flex:1;min-width:0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;color:#5B6B85">${v.rec.tag_type} · ${v.rec.vehicle_class} · ${v.rec.owner_type}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:34px;font-weight:700;color:#0C2340;line-height:1.1">${v.rec.serial}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;background:${v.st.bg};color:${v.st.color};border-radius:99px;padding:6px 12px;font-weight:800;font-size:13px;white-space:nowrap">
        <span style="width:8px;height:8px;border-radius:99px;background:${v.st.color}"></span>${v.st.text}
      </div>
    </div>
    <div style="display:flex;align-items:flex-end;gap:10px;border-top:1px dashed rgba(12,35,64,.2);padding-top:10px">
      <div style="flex:1;min-width:0;font-size:14px;color:#13233B;align-self:center">${v.st.sub}</div>
      <${Pet} p=${v.st.ok ? cast.recordOk : cast.recordBad} height=${72} />
    </div>
    ${when(v.feeFlag, () => html`
      <div style="display:flex;align-items:center;gap:8px;background:${v.feeFlag.bg};color:${v.feeFlag.fg};border-radius:4px;padding:8px 10px;font-size:13px;font-weight:700">
        ${I('wallet', 18, { stroke: 2 })}${v.feeFlag.text}
      </div>`)}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    ${each(v.approvals, a => html`
      <div style="background:${a.bg};border:1px solid ${a.bd};border-radius:4px;padding:12px;display:flex;align-items:center;gap:10px;color:${a.fg}">
        ${I(a.icon, 22, { stroke: 2 })}
        <div><div style="font-weight:800;font-size:14px;line-height:1.2">${a.title}</div><div style="font-size:12px;opacity:.9">${a.sub}</div></div>
      </div>`)}
  </div>
  ${when(v.photoLoading, () => html`<div style="width:100%;aspect-ratio:4/3;border-radius:4px;border:1px dashed rgba(12,35,64,.3);display:flex;align-items:center;justify-content:center;font-size:13px;color:#5B6B85">กำลังโหลดรูป…</div>`)}
  ${when(v.photoUrl, () => html`
    <img src=${v.photoUrl} alt="รถ" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:4px;border:1px solid rgba(12,35,64,.16);background:#fff" />`)}

  <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-radius:4px;overflow:hidden">
    ${each(v.rows, r => html`
      <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px dashed rgba(12,35,64,.14)">
        ${I(r.icon, 18, { color: '#5B6B85' })}
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;color:#5B6B85">${r.label}</div>
          <div style="font-size:16px;font-weight:700;color:#0C2340;word-break:break-word;font-family:${r.font}">${r.value}</div>
        </div>
        ${when(r.tel, () => html`
          <a href=${r.tel} style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:99px;background:#0C2340;color:#fff;text-decoration:none">
            ${I('phone', 18, { color: '#fff', stroke: 2 })}
          </a>`)}
      </div>`)}
  </div>

  ${when(v.isGuard, () => html`
    <div style="background:#0C2340;border-left:6px solid #E8762B;border-radius:5px;padding:14px 16px;color:#fff;display:flex;flex-direction:column;gap:6px;font-size:14px;line-height:1.55">
      <div style="font-weight:800">ข้อแนะนำสำหรับ รปภ.</div>
      <div>ติดต่อผู้ลงทะเบียนรถได้ตามเบอร์โทรข้างต้น หากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อสำนักงานนิติบุคคล</div>
      <a href="tel:0654721182" style="font-family:'JetBrains Mono',monospace;color:#E8762B;font-weight:700;text-decoration:none">065-472-1182</a>
    </div>`)}

  ${when(v.showViolations, () => html`
    <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-top:4px solid #E8762B;border-radius:4px;padding:14px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-weight:800;color:#0C2340">ประวัติการกระทำผิด</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#E8762B;font-weight:700">${v.vioCount} ครั้ง</div>
      </div>
      ${each(v.vios, x => html`
        <div style="border-left:5px solid ${x.color};background:#F7F8FB;border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;justify-content:space-between;gap:8px"><span style="font-weight:800;color:#0C2340">${x.type}</span><span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#5B6B85">${x.datetime}</span></div>
          <div style="font-size:13px;color:#13233B">${x.line}</div>
          <div style="font-size:12px;font-weight:700;color:${x.color}">${x.state}</div>
        </div>`)}
      ${when(v.noVios, () => html`<div style="font-size:14px;color:#5B6B85">— ไม่มีรายการ</div>`)}
    </div>`)}

  ${when(v.canEdit, () => html`
    <div style="display:flex;gap:8px">
      <button onClick=${v.openEdit} style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:#0C2340;color:#fff;border:0;border-radius:4px;padding:13px;font-weight:800;font-size:15px;cursor:pointer;min-height:48px">
        ${I('file-text', 18, { color: '#fff', stroke: 2 })}${v.editBtnLabel}
      </button>
      <button onClick=${v.openVio} style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#0C2340;border:1px solid #0C2340;border-radius:4px;padding:13px;font-weight:800;font-size:15px;cursor:pointer;min-height:48px">
        ${I('triangle-alert', 18, { stroke: 2 })}บันทึกการกระทำผิด
      </button>
    </div>
    <a href=${v.sheetRowUrl} target="_blank" rel="noopener" style="align-self:center;font-size:12px;color:#5B6B85;text-decoration:underline">เปิดแถวนี้ใน Google Sheets</a>`)}
</div>`)}

${when(v.isHistory, () => html`
<div style="padding:16px 20px 32px;display:flex;flex-direction:column;gap:12px;flex:1">
  <button onClick=${v.back} style=${S_BACK}>← กลับ</button>
  <div style="display:flex;align-items:flex-end;gap:12px">
    <div style="flex:1;min-width:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;color:#E8762B">VIOLATIONS · ${v.histTotal}</div>
      <div style="font-size:22px;font-weight:800;color:#0C2340">ประวัติ<span style="color:#E8762B">การกระทำผิด</span></div>
    </div>
    <${Pet} p=${cast.history} height=${76} />
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px">
    ${each(v.histFilters, f => html`
      <button onClick=${f.pick} style="background:${f.bg};color:${f.fg};border:1px solid #0C2340;border-radius:99px;padding:6px 14px;font-size:13px;font-weight:700;cursor:pointer;min-height:34px">${f.label}</button>`)}
  </div>
  <select value=${v.histType} onChange=${v.setHistType} style="font-size:15px;padding:10px 12px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#fff;color:#0C2340;min-height:46px;width:100%;box-sizing:border-box">
    ${(v.histTypes || []).map(t => html`<option key=${t.value} value=${t.value}>${t.label}</option>`)}
  </select>
  ${each(v.histList, x => html`
    <button onClick=${x.open} style="border:1px solid rgba(12,35,64,.12);border-left:5px solid ${x.color};background:#fff;border-radius:4px;padding:11px 12px;display:flex;flex-direction:column;gap:4px;text-align:left;cursor:pointer;box-shadow:0 4px 16px rgba(12,35,64,.06)">
      <div style="display:flex;justify-content:space-between;gap:8px;width:100%"><span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#0C2340">${x.serial}</span><span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#5B6B85">${x.datetime}</span></div>
      <div style="font-weight:800;color:#0C2340;font-size:15px;line-height:1.35">${x.type}</div>
      <div style="font-size:13px;color:#13233B">${x.line}</div>
      <div style="font-size:12px;font-weight:700;color:${x.color}">${x.state}</div>
    </button>`)}
  ${when(v.histEmpty, () => html`<div style="font-size:14px;color:#5B6B85">— ไม่มีรายการ</div>`)}
</div>`)}

${when(v.isUsers, () => html`
<div style="padding:16px 20px 32px;display:flex;flex-direction:column;gap:12px;flex:1">
  <button onClick=${v.back} style=${S_BACK}>← กลับ</button>
  <div style="display:flex;align-items:flex-end;gap:12px">
    <div style="flex:1;min-width:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;color:#E8762B">USERS · OFFICE ONLY</div>
      <div style="font-size:22px;font-weight:800;color:#0C2340">จัดการ<span style="color:#E8762B">ผู้ใช้</span></div>
    </div>
    <${Pet} p=${cast.users} height=${76} />
  </div>
  ${when(v.invite, () => html`
    <div style="background:#0C2340;border-left:6px solid #E8762B;border-radius:5px;padding:16px;display:flex;flex-direction:column;gap:12px;color:#fff;align-items:center;text-align:center">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#E8762B">${v.invite.kind}</div>
      <div style="font-weight:800;font-size:17px">${v.invite.name} · ${v.invite.roleTh}</div>
      <div style="background:#fff;border-radius:4px;padding:10px;line-height:0"><img src=${v.invite.qr} alt="QR" style="width:180px;height:180px;image-rendering:pixelated" /></div>
      <div style="font-size:13px;color:rgba(255,255,255,.8);line-height:1.5">ให้ผู้ใช้ใหม่สแกน QR นี้ หรือส่งลิงก์ให้ทาง LINE<br />แล้วตั้ง PIN 4 หลักด้วยตนเอง</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;letter-spacing:.2em;color:#fff">${v.invite.code}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.7)">ใช้ได้ครั้งเดียว · หมดอายุ ${v.invite.expires}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%">
        <button onClick=${v.shareInvite} style="background:#E8762B;color:#fff;border:0;border-radius:4px;padding:12px;font-weight:800;font-size:14px;cursor:pointer;min-height:46px">ส่งทาง LINE / แชร์</button>
        <button onClick=${v.copyInvite} style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:4px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;min-height:46px">${v.copyLabel}</button>
      </div>
      <button onClick=${v.closeInvite} style="background:transparent;border:0;color:rgba(255,255,255,.75);font-size:13px;text-decoration:underline;cursor:pointer;min-height:32px">เสร็จแล้ว</button>
    </div>`)}
  ${when(v.usersMsg, () => html`
    <div style="background:${v.usersMsg.bg};border-left:5px solid ${v.usersMsg.fg};border-radius:4px;padding:10px 12px;font-size:14px;font-weight:700;color:${v.usersMsg.fg}">${v.usersMsg.text}</div>`)}
  <div style="background:#0C2340;border-left:6px solid #E8762B;border-radius:5px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;color:#fff">
    <span style="font-size:12px;color:rgba(255,255,255,.75)">PIN ของท่าน (${v.userLabel}) — ใช้ยืนยันทุกการเปลี่ยนแปลงในหน้านี้</span>
    <input type="password" inputMode="numeric" maxLength=${4} value=${v.uf.my_pin || ''} onChange=${v.setU.my_pin} placeholder="••••" style="width:100%;min-width:0;box-sizing:border-box;font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.4em;text-align:center;padding:8px;border:1px solid rgba(255,255,255,.3);border-radius:4px;background:rgba(255,255,255,.08);color:#fff;min-height:46px" />
  </div>
  <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-top:4px solid #E8762B;border-radius:4px;padding:14px;display:flex;flex-direction:column;gap:10px">
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5B6B85">INVITE NEW USER</div>
    <input value=${v.uf.name || ''} onChange=${v.setU.name} placeholder="ชื่อ-สกุล" style=${S_FIELD} />
    <select value=${v.uf.role || 'guard'} onChange=${v.setU.role} style=${S_FIELD}>
      <option value="guard">รปภ.</option><option value="office">สำนักงานนิติฯ</option><option value="committee">กรรมการ</option>
    </select>
    <button onClick=${v.submitUser} disabled=${v.uBusy} class="hov-accent" style="background:#E8762B;color:#fff;border:0;border-radius:4px;padding:12px;font-weight:800;font-size:15px;cursor:pointer;min-height:48px">${v.uSubmitLabel}</button>
  </div>
  <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-radius:4px;overflow:hidden">
    ${each(v.userList, u => html`
      <div style="display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px dashed rgba(12,35,64,.14);opacity:${u.op}">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;color:#0C2340;font-size:15px">${u.name}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#5B6B85">${u.user_id} · ${u.roleTh}</div>
          <div style="font-size:12px;font-weight:700;color:${u.stateColor}">${u.stateTh}</div>
        </div>
        <button onClick=${u.reset} style="background:#0C2340;color:#fff;border:0;border-radius:99px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;min-height:32px;white-space:nowrap">${u.resetLabel}</button>
        <button onClick=${u.toggle} style="background:#fff;color:#0C2340;border:1px solid rgba(12,35,64,.3);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;min-height:32px">${u.toggleLabel}</button>
      </div>`)}
    ${when(v.usersEmpty, () => html`<div style="padding:14px;font-size:14px;color:#5B6B85">${v.usersEmptyText}</div>`)}
  </div>
  <div style="font-size:12px;color:#5B6B85;line-height:1.5">ผู้ใช้ตั้ง PIN เองผ่านคำเชิญ — สำนักงานไม่ทราบ PIN ของผู้อื่น · ลืม PIN ให้กด "รีเซ็ต PIN" แล้วส่งคำเชิญใหม่ · ทุกรายการถูกบันทึกในแท็บ Access</div>
</div>`)}

${when(v.isEdit, () => html`
<div style="padding:16px 20px 32px;display:flex;flex-direction:column;gap:12px;flex:1">
  <button onClick=${v.backToRecord} style=${S_BACK}>← กลับ</button>
  <div style="display:flex;align-items:flex-end;gap:12px">
    <div style="flex:1;min-width:0">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;color:#E8762B">${v.editEyebrow}</div>
      <div style="font-size:22px;font-weight:800;color:#0C2340"><span style="font-family:'JetBrains Mono',monospace">${v.rec.serial}</span> · ${v.editTitle}</div>
    </div>
    <${Pet} p=${cast.edit} height=${76} />
  </div>
  <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#5B6B85">
    <span style="width:8px;height:8px;border-radius:99px;background:${v.scriptColor};flex-shrink:0"></span>${v.scriptText}
  </div>
  ${each(v.sections, sec => html`
    <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-top:4px solid #0C2340;border-radius:4px;padding:14px;display:flex;flex-direction:column;gap:12px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5B6B85">${sec.title}</div>
      ${each(sec.fields, f => html`
        <label style="display:flex;flex-direction:column;gap:4px">
          <span style="font-size:12px;color:#5B6B85">${f.label}</span>
          ${when(f.isSelect, () => html`
            <select value=${f.value} onChange=${f.set} style="font-size:16px;padding:10px 12px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:48px">
              ${(f.options || []).map(o => html`<option key=${o} value=${o}>${o}</option>`)}
            </select>`)}
          ${when(f.isText, () => html`
            <input value=${f.value} onChange=${f.set} placeholder=${f.ph} inputMode=${f.mode} style="font-size:16px;padding:10px 12px;border:1px solid rgba(12,35,64,.3);border-radius:4px;background:#F7F8FB;color:#0C2340;min-height:48px;font-family:${f.font}" />`)}
        </label>`)}
    </div>`)}
  ${when(v.isTagEdit, () => html`
    <div style="background:#fff;border:1px solid rgba(12,35,64,.16);border-top:4px solid #E8762B;border-radius:4px;padding:14px;display:flex;flex-direction:column;gap:10px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5B6B85">PHOTO</div>
      <div style="font-size:13px;color:#13233B">${v.photoReq}ถ่ายด้านหน้าหรือด้านหลังรถ ให้เห็นป้ายทะเบียนชัดเจน</div>
      ${when(v.photoPreview, () => html`
        <img src=${v.photoPreview} alt="รูปรถ" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:4px;border:1px solid rgba(12,35,64,.16)" />`)}
      <label style="display:flex;align-items:center;justify-content:center;gap:8px;background:#0C2340;color:#fff;border-radius:4px;padding:12px;font-weight:800;font-size:15px;cursor:pointer;min-height:48px;box-sizing:border-box">
        ${I('cctv', 18, { color: '#fff', stroke: 2 })}${v.photoBtn}
        <input type="file" accept="image/*" capture="environment" onChange=${v.onPhoto} style="display:none" />
      </label>
    </div>`)}
  <div style="background:#0C2340;border-left:6px solid #E8762B;border-radius:5px;padding:14px;display:flex;flex-direction:column;gap:12px;color:#fff">
    <label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer">
      <input type="checkbox" checked=${v.confirmChecked} onChange=${v.toggleConfirm} style="width:22px;height:22px;margin:2px 0 0;accent-color:#E8762B;flex-shrink:0" />
      <span style="font-size:14px;line-height:1.5">ข้าพเจ้าได้ตรวจสอบแล้วว่าข้อมูลข้างต้นถูกต้องตามความรู้และเอกสารที่ได้รับ และรับทราบว่าการแก้ไขจะถูกบันทึกพร้อมชื่อผู้แก้ไขและเวลา</span>
    </label>
    <div style="display:flex;flex-direction:column;gap:6px">
      <span style="font-size:12px;color:rgba(255,255,255,.75)">ยืนยันรหัส PIN ${v.roleLabel} อีกครั้ง</span>
      <input type="password" inputMode="numeric" maxLength=${4} value=${v.confirmPin} onChange=${v.setConfirmPin} placeholder="••••" style="width:100%;min-width:0;box-sizing:border-box;font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:.4em;text-align:center;padding:8px;border:1px solid rgba(255,255,255,.3);border-radius:4px;background:rgba(255,255,255,.08);color:#fff;min-height:48px" />
    </div>
  </div>
  ${when(v.saveMsg, () => html`
    <div style="background:${v.saveMsg.bg};border-left:5px solid ${v.saveMsg.fg};border-radius:4px;padding:10px 12px;font-size:14px;font-weight:700;color:${v.saveMsg.fg}">${v.saveMsg.text}</div>`)}
  <button onClick=${v.save} disabled=${v.saveDisabled} class="hov-accent" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#E8762B;color:#fff;border:0;border-radius:4px;padding:14px;font-weight:800;font-size:16px;cursor:pointer;min-height:52px;opacity:${v.saveOpacity}">${v.saveLabel}</button>
</div>`)}

</div>`;
}
