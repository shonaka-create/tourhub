// Static modules ported verbatim from the original coasthub-modules.js.
// These screens have no interactive state, so they are rendered as HTML strings.

import { C, card, h2, label, btn, bar, pill } from "./theme";

// ============ BOOKING / CALENDAR ============
export function booking(): string {
  const days = ["月", "火", "水", "木", "金", "土", "日"];
  const loads = [
    62, 78, 70, 85, 90, 100, 96, 55, 72, 68, 80, 88, 100, 92, 48, 60, 66, 74,
    82, 95, 100, 40, 58, 64, 70, 78, 86, 90,
  ];
  let cells = "";
  for (let i = 0; i < 28; i++) {
    const d = i + 1;
    const pct = loads[i];
    const full = pct >= 100;
    const col = full ? C.red : pct >= 85 ? C.amber : C.blue;
    const bg = full ? "#FDEBEB" : pct >= 85 ? "#FFF6E8" : "#F2FAFE";
    const today = d === 28;
    cells +=
      '<div style="' +
      card +
      "border-color:" +
      (today ? C.blue : C.line) +
      ";border-width:" +
      (today ? 2 : 1) +
      'px;border-radius:12px;padding:9px 9px 8px;min-height:74px;position:relative">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-family:Outfit;font-weight:700;font-size:13px;color:' +
      C.ink +
      '">' +
      d +
      "</span>" +
      (today ? pill("本日", "#fff", C.blue) : "") +
      "</div>" +
      '<div style="font-size:10px;color:' +
      C.sub +
      ';margin-top:6px">予約 ' +
      Math.round(pct * 0.4) +
      "件</div>" +
      '<div style="display:flex;align-items:center;gap:6px;margin-top:5px">' +
      bar(pct, col) +
      "</div>" +
      (full
        ? '<div style="position:absolute;right:6px;bottom:6px">' +
          pill("満席", C.red, bg) +
          "</div>"
        : "") +
      "</div>";
  }
  const inv = [
    { n: "モーニング・スノーケル", t: "08:00", booked: 18, cap: 18 },
    { n: "パラセーリング 第1便", t: "09:30", booked: 12, cap: 14 },
    { n: "ジェットスキー体験", t: "11:00", booked: 8, cap: 12 },
    { n: "シティ・バイクツアー", t: "14:00", booked: 14, cap: 20 },
  ];
  const invRows = inv
    .map((r) => {
      const pct = Math.round((r.booked / r.cap) * 100);
      const full = r.booked >= r.cap;
      const col = full ? C.red : pct >= 80 ? C.amber : C.green;
      return (
        '<div style="display:flex;align-items:center;gap:14px;padding:13px 4px;border-bottom:1px solid #F0F5F8">' +
        '<div style="width:46px;font-family:Outfit;font-weight:700;font-size:13px">' +
        r.t +
        "</div>" +
        '<div style="flex:1"><div style="font-weight:700;font-size:13px">' +
        r.n +
        '</div><div style="display:flex;align-items:center;gap:10px;margin-top:6px">' +
        bar(pct, col) +
        '<span style="font-size:11px;color:' +
        C.sub +
        ';width:60px;text-align:right">残 ' +
        (r.cap - r.booked) +
        "席</span></div></div>" +
        '<div style="font-family:Outfit;font-weight:700;font-size:14px;width:54px;text-align:right;color:' +
        col +
        '">' +
        r.booked +
        "/" +
        r.cap +
        "</div>" +
        (full
          ? pill("受付ブロック", C.red, "#FDEBEB")
          : '<button style="' +
            btn(C.soft, C.deep) +
            'padding:7px 12px;font-size:12px">受付</button>') +
        "</div>"
      );
    })
    .join("");

  const autos = [
    {
      ic: '<rect x="3" y="5" width="18" height="16" rx="2" stroke="C" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" stroke="C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      t: "自動リマインド",
      d: "前日18:00に集合場所のGoogle Mapsピンを自動送信",
      st: "38件 送信予約済",
      c: C.blue,
      bg: "#E3F2FB",
    },
    {
      ic: '<path d="M5 19h14M7 15l9-9 3 3-9 9H7v-3Z" stroke="C" stroke-width="2" stroke-linejoin="round"/>',
      t: "電子免責同意書",
      d: "スマホ署名フォームを自動送付・署名状況を追跡",
      st: "34/38 署名済 · 4件未署名",
      c: C.amber,
      bg: "#FFF6E8",
    },
    {
      ic: '<path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1-6.3-4.6L5.7 21l2.3-7.1-6-4.5h7.6L12 2Z" stroke="C" stroke-width="2" stroke-linejoin="round"/>',
      t: "サンクスメール自動化",
      d: "ツアー終了後、担当ガイド名入りで口コミ誘導を送信",
      st: "TripAdvisor誘導 · 本日12件送信",
      c: C.green,
      bg: "#E4F6EC",
    },
  ]
    .map((a) => {
      return (
        '<div style="' +
        card +
        'padding:16px;display:flex;flex-direction:column;gap:8px">' +
        '<div style="display:flex;align-items:center;gap:10px"><span style="width:38px;height:38px;border-radius:11px;background:' +
        a.bg +
        ';display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none">' +
        a.ic.replace(/"C"/g, '"' + a.c + '"') +
        '</svg></span><div style="' +
        h2 +
        'font-size:14px">' +
        a.t +
        "</div></div>" +
        '<div style="font-size:12px;color:' +
        C.sub +
        ';line-height:1.5">' +
        a.d +
        "</div>" +
        '<div style="margin-top:auto;font-size:11.5px;font-weight:700;color:' +
        a.c +
        ";background:" +
        a.bg +
        ';padding:7px 11px;border-radius:9px;display:inline-block;width:fit-content">' +
        a.st +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  return (
    "" +
    '<div style="display:grid;grid-template-columns:1.1fr .9fr;gap:18px;align-items:start">' +
    '<section style="' +
    card +
    'padding:18px 20px">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="' +
    h2 +
    '">2026年 6月 — 空き枠カレンダー</div><div style="display:flex;gap:14px;font-size:11px;color:' +
    C.sub +
    '"><span style="display:flex;align-items:center;gap:5px"><span style="width:9px;height:9px;border-radius:3px;background:' +
    C.blue +
    '"></span>空きあり</span><span style="display:flex;align-items:center;gap:5px"><span style="width:9px;height:9px;border-radius:3px;background:' +
    C.amber +
    '"></span>残少</span><span style="display:flex;align-items:center;gap:5px"><span style="width:9px;height:9px;border-radius:3px;background:' +
    C.red +
    '"></span>満席</span></div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-bottom:7px">' +
    days
      .map(
        (d) =>
          '<div style="text-align:center;font-size:11px;font-weight:700;color:' +
          C.sub +
          '">' +
          d +
          "</div>"
      )
      .join("") +
    "</div>" +
    '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:7px">' +
    cells +
    "</div>" +
    "</section>" +
    '<section style="' +
    card +
    'padding:18px 20px"><div style="' +
    h2 +
    'margin-bottom:4px">本日の空き枠（一元管理）</div><div style="' +
    label +
    'margin-bottom:8px">定員到達で自動的に受付ブロック</div>' +
    invRows +
    "</section>" +
    "</div>" +
    '<div style="' +
    h2 +
    'margin:22px 0 12px">事前案内オートメーション</div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">' +
    autos +
    "</div>"
  );
}

// ============ ASSET ============
export function asset(): string {
  const rows = [
    { n: "ウェットスーツ (S)", cat: "保護具", total: 20, ready: 18, fix: 1, dead: 1, need: 8 },
    { n: "ウェットスーツ (M)", cat: "保護具", total: 18, ready: 11, fix: 5, dead: 2, need: 14 },
    { n: "ウェットスーツ (L)", cat: "保護具", total: 16, ready: 15, fix: 1, dead: 0, need: 6 },
    { n: "サーフボード", cat: "ボード", total: 24, ready: 22, fix: 2, dead: 0, need: 12 },
    { n: "ライフジャケット", cat: "保護具", total: 60, ready: 57, fix: 3, dead: 0, need: 38 },
    { n: "シティバイク", cat: "車両", total: 20, ready: 18, fix: 1, dead: 1, need: 14 },
    { n: "シュノーケルセット", cat: "備品", total: 40, ready: 40, fix: 0, dead: 0, need: 18 },
  ];
  const head =
    '<div style="display:grid;grid-template-columns:1.6fr .8fr .9fr 1fr 1.3fr;gap:12px;padding:0 16px 10px;font-size:11px;font-weight:700;color:' +
    C.sub +
    '"><div>機材マスター</div><div>分類</div><div style="text-align:center">総数</div><div style="text-align:center">ステータス</div><div style="text-align:right">今日使える数 / 必要数</div></div>';
  const body = rows
    .map((r) => {
      const shortage = r.ready < r.need;
      return (
        '<div style="display:grid;grid-template-columns:1.6fr .8fr .9fr 1fr 1.3fr;gap:12px;align-items:center;' +
        card +
        "padding:13px 16px;margin-bottom:9px;border-color:" +
        (shortage ? "#F3D2D2" : C.line) +
        '">' +
        '<div style="font-weight:700;font-size:13px">' +
        r.n +
        "</div>" +
        '<div style="font-size:12px;color:' +
        C.sub +
        '">' +
        r.cat +
        "</div>" +
        '<div style="text-align:center;font-family:Outfit;font-weight:700">' +
        r.total +
        "</div>" +
        '<div style="display:flex;gap:5px;justify-content:center">' +
        pill("稼働 " + r.ready, C.green, "#E4F6EC") +
        (r.fix ? pill("修理 " + r.fix, C.amber, "#FFF6E8") : "") +
        (r.dead ? pill("廃棄 " + r.dead, C.sub, "#EEF2F5") : "") +
        "</div>" +
        '<div style="text-align:right"><span style="font-family:Outfit;font-weight:800;font-size:16px;color:' +
        (shortage ? C.red : C.green) +
        '">' +
        r.ready +
        '</span><span style="color:' +
        C.sub +
        ';font-size:13px"> / ' +
        r.need +
        " 必要</span>" +
        (shortage
          ? '<div style="font-size:11px;color:' +
            C.red +
            ';font-weight:700;margin-top:2px">' +
            (r.need - r.ready) +
            "点不足 → アサインへ警告</div>"
          : '<div style="font-size:11px;color:' + C.green + ';margin-top:2px">充足</div>') +
        "</div>" +
        "</div>"
      );
    })
    .join("");
  const stat = [
    { k: "総アセット", v: "198", c: C.blue },
    { k: "稼働可能", v: "181", c: C.green },
    { k: "修理・メンテ中", v: "13", c: C.amber },
    { k: "本日の不足品目", v: "2", c: C.red },
  ]
    .map(
      (s) =>
        '<div style="' +
        card +
        'padding:15px 18px"><div style="' +
        label +
        '">' +
        s.k +
        '</div><div style="font-family:Outfit;font-weight:800;font-size:26px;color:' +
        s.c +
        ';margin-top:6px">' +
        s.v +
        "</div></div>"
    )
    .join("");
  return (
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px">' +
    stat +
    "</div>" +
    '<section style="' +
    card +
    'padding:18px 16px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 4px"><div style="' +
    h2 +
    '">機材マスター ＆ ステータス管理</div><button style="' +
    btn(C.blue, "#fff") +
    '">＋ 機材を登録</button></div>' +
    head +
    body +
    '<div style="margin-top:6px;background:#F2FAFE;border-radius:12px;padding:11px 14px;font-size:12px;color:' +
    C.deep +
    ';display:flex;align-items:center;gap:8px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" stroke="' +
    C.deep +
    '" stroke-width="2" stroke-linejoin="round"/></svg>「今日使える数」はアサイン管理モジュールへリアルタイム連動。不足時は割当画面で自動警告されます。</div></section>'
  );
}
