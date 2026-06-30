import { C, icon } from "./theme";

// ============ Navigation ============
export type NavId =
  | "dashboard"
  | "booking"
  | "assign"
  | "asset"
  | "crm"
  | "manifest"
  | "sales"
  | "settings";

export interface NavItem {
  id: NavId;
  label: string;
  iconPath: string;
  badge?: string;
  badgeColor?: string;
}

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "ダッシュボード",
    iconPath:
      '<path d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z" stroke="CUR" stroke-width="2" stroke-linejoin="round"/>',
    badge: "3",
    badgeColor: "#E5484D",
  },
  {
    id: "booking",
    label: "予約・カレンダー",
    iconPath:
      '<rect x="3" y="5" width="18" height="16" rx="2" stroke="CUR" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke="CUR" stroke-width="2" stroke-linecap="round"/>',
  },
  {
    id: "assign",
    label: "アサイン・シフト",
    iconPath:
      '<circle cx="9" cy="8" r="3" stroke="CUR" stroke-width="2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11l2 2 4-4" stroke="CUR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    id: "asset",
    label: "機材・アセット",
    iconPath:
      '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" stroke="CUR" stroke-width="2" stroke-linejoin="round"/>',
    badge: "2",
    badgeColor: "#F97316",
  },
  {
    id: "crm",
    label: "代理店管理",
    iconPath:
      '<path d="M3 21V9l9-6 9 6v12" stroke="CUR" stroke-width="2" stroke-linejoin="round"/><path d="M9 21v-6h6v6" stroke="CUR" stroke-width="2" stroke-linejoin="round"/>',
  },
  {
    id: "manifest",
    label: "参加者名簿",
    iconPath:
      '<rect x="6" y="3" width="12" height="18" rx="2.5" stroke="CUR" stroke-width="2"/><path d="M10 18h4" stroke="CUR" stroke-width="2" stroke-linecap="round"/>',
  },
  {
    id: "sales",
    label: "売上・分析",
    iconPath:
      '<path d="M4 19V5m0 14h16M8 16l3-4 3 3 4-6" stroke="CUR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    id: "settings",
    label: "設定",
    iconPath:
      '<circle cx="12" cy="12" r="3" stroke="CUR" stroke-width="2"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.3-1.3L13.7 2h-3.4l-.3 2.5A7 7 0 0 0 7.7 5.8l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.3 1.3l.3 2.5h3.4l.3-2.5a7 7 0 0 0 2.3-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.3Z" stroke="CUR" stroke-width="2" stroke-linejoin="round"/>',
  },
];

export const headers: Record<NavId, [string, string]> = {
  dashboard: ["ダッシュボード", "司令塔・例外管理"],
  booking: ["予約・カレンダー管理", "上限枠・空き枠とツアー管理者情報の管理"],
  assign: ["アサイン・シフト管理", "人・車・機材の割り当て"],
  asset: ["機材・アセット管理", "空き枠と状態の維持"],
  crm: ["代理店管理", "代理店の登録と請求精算"],
  manifest: ["参加者名簿・現場管理", "デジタルマニフェスト / 出席確認 / 送迎 / SOP管理"],
  sales: ["売上・分析", "チャネル別売上と前週比の管理"],
  settings: ["設定", "システム設定"],
};

// ============ KPI strip ============
export interface Kpi {
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
  tint: string;
  iconBg: string;
  icon: string;
}

export const kpis: Kpi[] = [
  {
    label: "本日のツアー",
    value: "12",
    delta: "進行中 3 · 準備中 5",
    deltaColor: C.green,
    tint: "#E3F4FF",
    iconBg: "#DCF0FB",
    icon: icon(
      '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" stroke="COL" stroke-width="2" stroke-linejoin="round"/>',
      C.blue,
      17
    ),
  },
  {
    label: "本日の参加者",
    value: "186",
    delta: "チェックイン済 58%",
    deltaColor: C.sub,
    tint: "#E0F7F1",
    iconBg: "#D6F4EC",
    icon: icon(
      '<circle cx="9" cy="8" r="3" stroke="COL" stroke-width="2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0" stroke="COL" stroke-width="2"/><path d="M16 8a3 3 0 0 1 0 6" stroke="COL" stroke-width="2" stroke-linecap="round"/>',
      "#16A37E",
      17
    ),
  },
  {
    label: "稼働率（席）",
    value: "82%",
    delta: "空き 34席",
    deltaColor: C.sub,
    tint: "#FFF1DC",
    iconBg: "#FCEBD3",
    icon: icon(
      '<path d="M12 20V10M6 20v-6M18 20V4" stroke="COL" stroke-width="2" stroke-linecap="round"/>',
      C.amber,
      17
    ),
  },
  {
    label: "要対応",
    value: "5",
    delta: "未アサイン 2 · 未収 3",
    deltaColor: C.red,
    tint: "#FDE6E6",
    iconBg: "#FCDADA",
    icon: icon(
      '<path d="M12 3l9 16H3l9-16Z" stroke="COL" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke="COL" stroke-width="2" stroke-linecap="round"/>',
      C.red,
      17
    ),
  },
];

// ============ Today timeline ============
export interface TimelineItem {
  time: string;
  title: string;
  status: string;
  meta: string;
  seats: string;
  fillPct: string;
  dot: string;
  dotRing: string;
  bg: string;
  border: string;
  chipColor: string;
  chipBg: string;
  fillColor: string;
}

function tl(c: {
  dot: string;
  ring: string;
  bg: string;
  bd: string;
  cc: string;
  cb: string;
  fc: string;
}) {
  return {
    dot: c.dot,
    dotRing: c.ring,
    bg: c.bg,
    border: c.bd,
    chipColor: c.cc,
    chipBg: c.cb,
    fillColor: c.fc,
  };
}

export const timeline: TimelineItem[] = [
  {
    time: "08:00",
    title: "モーニング・スノーケル",
    status: "進行中",
    meta: "ガイド: K.Lee · バン #2 · 集合済",
    seats: "18/18",
    fillPct: "100%",
    ...tl({
      dot: "#16A34A",
      ring: "#D6F2DF",
      bg: "#F4FBF6",
      bd: "#D7F0DF",
      cc: "#16A34A",
      cb: "#DCF3E3",
      fc: "#16A34A",
    }),
  },
  {
    time: "09:30",
    title: "パラセーリング 第1便",
    status: "準備中",
    meta: "ガイド: 未アサイン ⚠ · バン #4",
    seats: "12/14",
    fillPct: "85%",
    ...tl({
      dot: "#F97316",
      ring: "#FCE4CF",
      bg: "#FFF8F1",
      bd: "#F8E2CC",
      cc: "#B4480E",
      cb: "#FCE4CF",
      fc: "#F97316",
    }),
  },
  {
    time: "11:00",
    title: "ジェットスキー体験",
    status: "準備中",
    meta: "ガイド: M.Tan · 機材点検 SOP未完 ⚠",
    seats: "8/12",
    fillPct: "67%",
    ...tl({
      dot: "#0E8FC9",
      ring: "#D5ECF8",
      bg: "#F4FAFE",
      bd: "#D7EAF6",
      cc: "#0A6FB0",
      cb: "#D9EFFA",
      fc: "#0E8FC9",
    }),
  },
  {
    time: "14:00",
    title: "シティ・バイクツアー",
    status: "受付中",
    meta: "ガイド: J.Park · バイク 6台 確保済",
    seats: "14/20",
    fillPct: "70%",
    ...tl({
      dot: "#0E8FC9",
      ring: "#D5ECF8",
      bg: "#F4FAFE",
      bd: "#D7EAF6",
      cc: "#0A6FB0",
      cb: "#D9EFFA",
      fc: "#0E8FC9",
    }),
  },
  {
    time: "07:00",
    title: "サンライズ・SUP",
    status: "終了",
    meta: "ガイド: A.Wong · サンクスメール送信済",
    seats: "10/10",
    fillPct: "100%",
    ...tl({
      dot: "#C9D6E0",
      ring: "#EAF0F5",
      bg: "#FAFCFD",
      bd: "#EBF1F5",
      cc: "#8AA0B0",
      cb: "#EEF3F6",
      fc: "#A9BCC9",
    }),
  },
];

// ============ Exception alerts ============
export interface Alert {
  title: string;
  meta: string;
  bg: string;
  icon: string;
  action: string;
  btnBg: string;
  btnColor: string;
}

export const alerts: Alert[] = [
  {
    title: "未アサイン: パラセーリング 09:30",
    meta: "ガイド未割当 · 出発まで残り 18分",
    bg: "#FCE4CF",
    icon: icon(
      '<circle cx="9" cy="8" r="3" stroke="COL" stroke-width="2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 7v5M18 15h.01" stroke="COL" stroke-width="2" stroke-linecap="round"/>',
      C.orange,
      17
    ),
    action: "割当",
    btnBg: C.orange,
    btnColor: "#fff",
  },
  {
    title: "SOP未完了: ジェットスキー 11:00",
    meta: "ライフジャケット点検が未チェック",
    bg: "#FCDADA",
    icon: icon(
      '<path d="M12 3l9 16H3l9-16Z" stroke="COL" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4" stroke="COL" stroke-width="2" stroke-linecap="round"/>',
      C.red,
      17
    ),
    action: "確認",
    btnBg: "#FDE6E6",
    btnColor: C.red,
  },
  {
    title: "機材不足: ウェットスーツ M",
    meta: "必要 14 / 稼働可能 11 ・ 3着不足",
    bg: "#FCDADA",
    icon: icon(
      '<path d="M8 3l4 3 4-3 2 4-3 2v9H9v-9L6 7l2-4Z" stroke="COL" stroke-width="2" stroke-linejoin="round"/>',
      C.red,
      17
    ),
    action: "手配",
    btnBg: "#FDE6E6",
    btnColor: C.red,
  },
  {
    title: "未収金: 予約 #GC-2291",
    meta: "Experience Oz バウチャー未精算 $280",
    bg: "#FCEBD3",
    icon: icon(
      '<rect x="3" y="6" width="18" height="12" rx="2" stroke="COL" stroke-width="2"/><circle cx="12" cy="12" r="2.5" stroke="COL" stroke-width="2"/>',
      C.amber,
      17
    ),
    action: "請求",
    btnBg: "#FFF1DC",
    btnColor: "#B4480E",
  },
  {
    title: "同意書未署名: 4名",
    meta: "本日午後ツアー · リマインド再送可",
    bg: "#DCF0FB",
    icon: icon(
      '<path d="M5 19h14M7 15l9-9 3 3-9 9H7v-3Z" stroke="COL" stroke-width="2" stroke-linejoin="round"/>',
      C.blue,
      17
    ),
    action: "再送",
    btnBg: "#E3F2FB",
    btnColor: "#0A6FB0",
  },
];

// ============ Sales channels ============
export interface Channel {
  label: string;
  count: string;
  amount: string;
  pct: string;
  color: string;
}

export const channels: Channel[] = [
  { label: "自社サイト", count: "42件", amount: "$3,870", pct: "46%", color: C.blue },
  { label: "提携ホテル", count: "28件", amount: "$2,610", pct: "31%", color: C.teal },
  { label: "OTA / 代理店", count: "19件", amount: "$1,940", pct: "23%", color: C.mint },
];

// ============ Chat ============
export interface ThreadDef {
  id: string;
  label: string;
  unread: string;
}

export const threadDefs: ThreadDef[] = [
  { id: "snorkel", label: "【午前】スノーケル班", unread: "" },
  { id: "para", label: "【午前】パラセーリング", unread: "2" },
  { id: "van", label: "バン #2 ドライバー", unread: "1" },
];

export interface ChatMessage {
  side: "left" | "right";
  showName: boolean;
  name: string;
  text: string;
  time: string;
  photo: boolean;
}

export const msgSets: Record<string, ChatMessage[]> = {
  snorkel: [
    {
      side: "left",
      showName: true,
      name: "K.Lee（現場ガイド）",
      text: "集合場所に18名全員到着、ライフジャケット点検OKです👍",
      time: "08:02",
      photo: false,
    },
    {
      side: "right",
      showName: false,
      name: "",
      text: "了解です。SOPロック解除しました。出発どうぞ。",
      time: "08:03",
      photo: false,
    },
    {
      side: "left",
      showName: true,
      name: "K.Lee（現場ガイド）",
      text: "1名QRが読み取れず。スクショ送ります、確認お願いします",
      time: "08:05",
      photo: true,
    },
    {
      side: "right",
      showName: false,
      name: "",
      text: "予約 #GC-2284 で照合できました。手動チェックイン済です。",
      time: "08:06",
      photo: false,
    },
  ],
  para: [
    {
      side: "left",
      showName: true,
      name: "M.Tan（現場）",
      text: "波が高くなってきました。風も強いです⚠",
      time: "09:12",
      photo: false,
    },
    {
      side: "left",
      showName: true,
      name: "M.Tan（現場）",
      text: "09:30便、判断を仰ぎます",
      time: "09:13",
      photo: false,
    },
  ],
  van: [
    {
      side: "left",
      showName: true,
      name: "ドライバー B.Cho",
      text: "Hiltonピックアップ完了、次はMarriottへ向かいます",
      time: "07:48",
      photo: false,
    },
    {
      side: "right",
      showName: false,
      name: "",
      text: "最短ルート再送しました。スマホ確認お願いします。",
      time: "07:49",
      photo: false,
    },
  ],
};
