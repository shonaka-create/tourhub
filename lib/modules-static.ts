// Static modules ported verbatim from the original coasthub-modules.js.
// These screens have no interactive state, so they are rendered as HTML strings.

import { C, card, h2, label, btn, pill } from "./theme";

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
    '<div class="r-grid-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px">' +
    stat +
    "</div>" +
    '<section style="' +
    card +
    'padding:18px 16px"><div class="r-wrap" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 4px;gap:10px"><div style="' +
    h2 +
    '">機材マスター ＆ ステータス管理</div><button style="' +
    btn(C.blue, "#fff") +
    '">＋ 機材を登録</button></div>' +
    '<div class="r-scroll"><div class="r-twwrap">' +
    head +
    body +
    "</div></div>" +
    '<div style="margin-top:6px;background:#F2FAFE;border-radius:12px;padding:11px 14px;font-size:12px;color:' +
    C.deep +
    ';display:flex;align-items:center;gap:8px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" stroke="' +
    C.deep +
    '" stroke-width="2" stroke-linejoin="round"/></svg>「今日使える数」はアサイン管理モジュールへリアルタイム連動。不足時は割当画面で自動警告されます。</div></section>'
  );
}
