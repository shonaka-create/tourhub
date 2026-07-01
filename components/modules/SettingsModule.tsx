"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";
import {
  Member,
  MemberPerms,
  Invite,
  Role,
  Job,
  JOB_LABELS,
  EMPTY_PERMS,
  fetchMyProfile,
  fetchMembers,
  fetchInvites,
  updateMemberPerms,
  updateMemberRole,
  updateMemberJob,
  setMemberActive,
  createInvite,
  deleteInvite,
} from "@/lib/members";

const JOBS: Job[] = ["ops", "guide", "driver"];

const ROLE_LABELS: Record<keyof MemberPerms, string> = {
  booking: "予約編集",
  assign: "アサイン",
  sales: "売上閲覧",
  settings: "設定変更",
};
const PERM_KEYS = Object.keys(ROLE_LABELS) as (keyof MemberPerms)[];

function Toggle({
  on,
  disabled,
  onClick,
}: {
  on: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={disabled ? undefined : onClick}
      style={sx(
        "display:inline-flex;width:40px;height:23px;border-radius:13px;align-items:center;padding:2px;transition:.15s;" +
          "cursor:" +
          (disabled ? "not-allowed" : "pointer") +
          ";opacity:" +
          (disabled ? "0.55" : "1") +
          ";background:" +
          (on ? C.green : "#D5DEE6") +
          ";justify-content:" +
          (on ? "flex-end" : "flex-start")
      )}
    >
      <span style={sx("width:19px;height:19px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)")} />
    </span>
  );
}

export function SettingsModule() {
  // 悪天候の基準値
  const [waveMax, setWaveMax] = useState(2.0);
  const [windMax, setWindMax] = useState(12);
  const [autoAlert, setAutoAlert] = useState(true);

  // 通知テンプレート
  const TEMPLATES = [
    { id: "remind", k: "前日リマインド", v: "明日{time}より{tour}を開催します。集合場所: {meet}。Google Mapsピン: {map}" },
    { id: "consent", k: "免責同意書 依頼", v: "ご参加にあたり、こちらのフォームより電子署名をお願いします: {link}" },
    { id: "thanks", k: "サンクスメール", v: "本日は{tour}へのご参加ありがとうございました。よろしければ口コミのご協力を: {review}" },
    { id: "storm", k: "悪天候リスケ案内", v: "本日の海況（波高{wave}m/風速{wind}m/s）により、{tour}をリスケ/返金いたします。" },
  ];
  const [templates, setTemplates] = useState(TEMPLATES);
  const [saved, setSaved] = useState(false);

  // ── ユーザー権限（実データ）──
  const [me, setMe] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const isOwner = me?.role === "owner";

  useEffect(() => {
    (async () => {
      try {
        const [profile, list] = await Promise.all([fetchMyProfile(), fetchMembers()]);
        setMe(profile);
        setMembers(list);
        if (profile?.role === "owner") setInvites(await fetchInvites());
      } catch (e: any) {
        setMembersError(e?.message ?? "メンバー情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // オーナーは常に全権限扱い（表示上も全 ON・固定）
  function effectivePerms(m: Member): MemberPerms {
    if (m.role === "owner") return { booking: true, assign: true, sales: true, settings: true };
    return m.perms;
  }

  async function togglePerm(m: Member, key: keyof MemberPerms) {
    if (!isOwner || m.role === "owner") return;
    const next = { ...m.perms, [key]: !m.perms[key] };
    setMembers((prev) => prev.map((x) => (x.userId === m.userId ? { ...x, perms: next } : x)));
    try {
      await updateMemberPerms(m.userId, next);
    } catch {
      // 失敗したら元に戻す
      setMembers((prev) => prev.map((x) => (x.userId === m.userId ? m : x)));
      setMembersError("権限の更新に失敗しました。");
    }
  }

  async function toggleRole(m: Member) {
    if (!isOwner || m.userId === me?.userId) return; // 自分のロールは変更不可
    const next: Role = m.role === "owner" ? "staff" : "owner";
    setMembers((prev) => prev.map((x) => (x.userId === m.userId ? { ...x, role: next } : x)));
    try {
      await updateMemberRole(m.userId, next);
    } catch {
      setMembers((prev) => prev.map((x) => (x.userId === m.userId ? m : x)));
      setMembersError("ロールの更新に失敗しました。");
    }
  }

  async function changeJob(m: Member, job: Job) {
    if (!isOwner || job === m.job) return;
    const prev = m.job;
    setMembers((list) => list.map((x) => (x.userId === m.userId ? { ...x, job } : x)));
    try {
      await updateMemberJob(m.userId, job);
    } catch {
      setMembers((list) => list.map((x) => (x.userId === m.userId ? { ...x, job: prev } : x)));
      setMembersError("職種の更新に失敗しました。");
    }
  }

  async function toggleActive(m: Member) {
    if (!isOwner || m.userId === me?.userId) return;
    const next = !m.active;
    setMembers((prev) => prev.map((x) => (x.userId === m.userId ? { ...x, active: next } : x)));
    try {
      await setMemberActive(m.userId, next);
    } catch {
      setMembers((prev) => prev.map((x) => (x.userId === m.userId ? m : x)));
      setMembersError("状態の更新に失敗しました。");
    }
  }

  // ── 招待発行フォーム ──
  const [invRole, setInvRole] = useState<Role>("staff");
  const [invJob, setInvJob] = useState<Job>("guide");
  const [invPerms, setInvPerms] = useState<MemberPerms>({ ...EMPTY_PERMS });
  const [inviting, setInviting] = useState(false);

  async function issueInvite() {
    setInviting(true);
    try {
      const job: Job = invRole === "owner" ? "ops" : invJob;
      const inv = await createInvite(invRole, invRole === "owner" ? EMPTY_PERMS : invPerms, job);
      setInvites((prev) => [inv, ...prev]);
      setInvPerms({ ...EMPTY_PERMS });
      setInvRole("staff");
      setInvJob("guide");
    } catch {
      setMembersError("招待の発行に失敗しました。");
    } finally {
      setInviting(false);
    }
  }

  async function revokeInvite(id: string) {
    setInvites((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteInvite(id);
    } catch {
      setMembersError("招待の取り消しに失敗しました。");
    }
  }

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  function copyCode(code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    });
  }

  const inputStyle = sx(
    "box-sizing:border-box;border:1px solid " + C.line + ";border-radius:10px;padding:9px 12px;font-family:inherit;font-size:14px;font-weight:700;color:" + C.ink + ";outline:none;width:90px;text-align:center"
  );

  return (
    <div style={sx("display:flex;flex-direction:column;gap:18px;max-width:980px")}>
      {/* 悪天候基準値 */}
      <section style={sx(card + "padding:20px 22px")}>
        <div style={sx(h2 + "display:flex;align-items:center;gap:9px")}>
          <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 16a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.6-1.3A3.8 3.8 0 0 1 18 14" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13l-2 4h3l-2 4" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
          悪天候の基準値（自動アラート判定）
        </div>
        <div style={sx(label + "margin:4px 0 16px")}>
          OpenWeather連携値がこの基準を超えた場合、ダッシュボードに警報を表示します
        </div>
        <div style={sx("display:flex;gap:30px;flex-wrap:wrap;align-items:flex-end")}>
          <div>
            <div style={sx(label + "margin-bottom:6px")}>波高の上限（m）</div>
            <div style={sx("display:flex;align-items:center;gap:10px")}>
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.1}
                value={waveMax}
                onChange={(e) => { setWaveMax(Number(e.target.value)); setSaved(false); }}
                style={{ width: 180 }}
              />
              <input
                style={inputStyle}
                type="number"
                step={0.1}
                value={waveMax}
                onChange={(e) => { setWaveMax(Number(e.target.value)); setSaved(false); }}
              />
            </div>
          </div>
          <div>
            <div style={sx(label + "margin-bottom:6px")}>風速の上限（m/s）</div>
            <div style={sx("display:flex;align-items:center;gap:10px")}>
              <input
                type="range"
                min={3}
                max={25}
                step={1}
                value={windMax}
                onChange={(e) => { setWindMax(Number(e.target.value)); setSaved(false); }}
                style={{ width: 180 }}
              />
              <input
                style={inputStyle}
                type="number"
                value={windMax}
                onChange={(e) => { setWindMax(Number(e.target.value)); setSaved(false); }}
              />
            </div>
          </div>
          <label style={sx("display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:700;padding-bottom:6px")}>
            <input type="checkbox" checked={autoAlert} onChange={(e) => { setAutoAlert(e.target.checked); setSaved(false); }} />
            基準超過で自動リスケ案内を提案
          </label>
        </div>
        <div style={sx("margin-top:14px;background:#FFF8F1;border-radius:10px;padding:10px 13px;font-size:12px;color:#9A5B2E")}>
          現在の判定: 波高 <b>{waveMax.toFixed(1)}m</b> ・ 風速 <b>{windMax}m/s</b> 超で警報{autoAlert ? "（自動案内オン）" : "（手動確認）"}
        </div>
      </section>

      {/* 通知テンプレート */}
      <section style={sx(card + "padding:20px 22px")}>
        <div style={sx(h2 + "display:flex;align-items:center;gap:9px")}>
          <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v12H7l-3 3V5Z" stroke="#0E8FC9" stroke-width="2" stroke-linejoin="round"/></svg>' />
          通知テンプレート
        </div>
        <div style={sx(label + "margin:4px 0 16px")}>
          {"{time} {tour} {meet} {map} {link} {review} {wave} {wind}"} の差込変数が使えます
        </div>
        <div style={sx("display:flex;flex-direction:column;gap:14px")}>
          {templates.map((t, i) => (
            <div key={t.id}>
              <div style={sx("display:flex;align-items:center;gap:8px;margin-bottom:6px")}>
                <Html html={pill(t.k, C.deep, "#E3F2FB")} />
              </div>
              <textarea
                value={t.v}
                onChange={(e) => {
                  setSaved(false);
                  setTemplates((prev) => prev.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)));
                }}
                style={{
                  ...sx(
                    "width:100%;box-sizing:border-box;border:1px solid " + C.line + ";border-radius:11px;padding:11px 13px;font-family:inherit;font-size:13px;color:" + C.ink + ";outline:none;resize:vertical;line-height:1.6"
                  ),
                  minHeight: 56,
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ユーザー権限（実データ） */}
      <section style={sx(card + "padding:20px 22px")}>
        <div style={sx(h2 + "display:flex;align-items:center;gap:9px")}>
          <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="#16A34A" stroke-width="2"/><path d="M5 20a7 7 0 0 1 14 0" stroke="#16A34A" stroke-width="2" stroke-linecap="round"/></svg>' />
          メンバーと権限
        </div>
        <div style={sx(label + "margin:4px 0 16px")}>
          組織に所属するメンバーの一覧です。
          {isOwner
            ? " オーナーは各メンバーのロール・操作権限を変更できます。"
            : " 権限の変更はオーナーのみ可能です。"}
        </div>

        {membersError && (
          <div style={sx("background:#FEF2F2;color:#B91C1C;border-radius:10px;padding:10px 13px;font-size:12px;margin-bottom:12px")}>
            {membersError}
          </div>
        )}

        {loading ? (
          <div style={sx("font-size:13px;color:" + C.sub + ";padding:8px 0")}>読み込み中…</div>
        ) : (
          <div className="r-scroll">
            <div className="r-twwrap">
              <div
                style={sx(
                  "display:grid;grid-template-columns:1.4fr 1fr 1fr repeat(4,.8fr) .8fr;gap:10px;padding:0 6px 10px;font-size:11px;font-weight:700;color:" + C.sub
                )}
              >
                <div>ユーザー</div>
                <div>ロール</div>
                <div>職種</div>
                {Object.values(ROLE_LABELS).map((l) => (
                  <div key={l} style={sx("text-align:center")}>{l}</div>
                ))}
                <div style={sx("text-align:center")}>状態</div>
              </div>

              {members.map((m) => {
                const eff = effectivePerms(m);
                const self = m.userId === me?.userId;
                return (
                  <div
                    key={m.userId}
                    style={sx(
                      "display:grid;grid-template-columns:1.4fr 1fr 1fr repeat(4,.8fr) .8fr;gap:10px;align-items:center;padding:11px 6px;border-bottom:1px solid #F0F5F8"
                    )}
                  >
                    <div style={sx("font-weight:700;font-size:13px")}>
                      {m.displayName || "（無名）"}
                      {self && <span style={sx("font-size:10px;color:" + C.sub + ";margin-left:6px")}>あなた</span>}
                    </div>
                    <div>
                      <span
                        onClick={isOwner && !self ? () => toggleRole(m) : undefined}
                        title={isOwner && !self ? "クリックでロール切替" : undefined}
                        style={sx(
                          "display:inline-block;font-size:11px;font-weight:800;border-radius:20px;padding:3px 11px;" +
                            "cursor:" + (isOwner && !self ? "pointer" : "default") + ";" +
                            (m.role === "owner"
                              ? "background:#FEF3C7;color:#92400E"
                              : "background:#E3F2FB;color:" + C.deep)
                        )}
                      >
                        {m.role === "owner" ? "オーナー" : "スタッフ"}
                      </span>
                    </div>
                    <div>
                      {isOwner ? (
                        <select
                          value={m.job}
                          onChange={(e) => changeJob(m, e.target.value as Job)}
                          style={sx(
                            "border:1px solid " + C.line + ";border-radius:8px;padding:5px 8px;font-family:inherit;font-size:12px;font-weight:700;color:" + C.ink + ";outline:none;background:#fff;cursor:pointer"
                          )}
                        >
                          {JOBS.map((j) => (
                            <option key={j} value={j}>{JOB_LABELS[j]}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={sx("font-size:12px;font-weight:700;color:" + C.sub)}>{JOB_LABELS[m.job]}</span>
                      )}
                    </div>
                    {PERM_KEYS.map((k) => (
                      <div key={k} style={sx("text-align:center")}>
                        <Toggle
                          on={eff[k]}
                          disabled={!isOwner || m.role === "owner"}
                          onClick={() => togglePerm(m, k)}
                        />
                      </div>
                    ))}
                    <div style={sx("text-align:center")}>
                      {m.active ? (
                        <span
                          onClick={isOwner && !self ? () => toggleActive(m) : undefined}
                          style={sx("font-size:11px;font-weight:700;color:" + C.green + ";cursor:" + (isOwner && !self ? "pointer" : "default"))}
                        >
                          有効
                        </span>
                      ) : (
                        <span
                          onClick={isOwner ? () => toggleActive(m) : undefined}
                          style={sx("font-size:11px;font-weight:700;color:#B91C1C;cursor:" + (isOwner ? "pointer" : "default"))}
                        >
                          無効
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 招待（オーナーのみ） */}
      {isOwner && (
        <section style={sx(card + "padding:20px 22px")}>
          <div style={sx(h2 + "display:flex;align-items:center;gap:9px")}>
            <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#0E8FC9" stroke-width="2" stroke-linecap="round"/></svg>' />
            メンバーを招待
          </div>
          <div style={sx(label + "margin:4px 0 16px")}>
            招待コードを発行し、対象者に共有してください。新規登録画面でコードを入力すると、この組織に指定ロールで参加します。
          </div>

          <div style={sx("display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px")}>
            <div>
              <div style={sx(label + "margin-bottom:6px")}>ロール</div>
              <select
                value={invRole}
                onChange={(e) => setInvRole(e.target.value as Role)}
                style={sx("border:1px solid " + C.line + ";border-radius:10px;padding:9px 12px;font-family:inherit;font-size:13px;font-weight:700;color:" + C.ink + ";outline:none")}
              >
                <option value="staff">スタッフ</option>
                <option value="owner">オーナー</option>
              </select>
            </div>
            {invRole === "staff" && (
              <div>
                <div style={sx(label + "margin-bottom:6px")}>職種</div>
                <select
                  value={invJob}
                  onChange={(e) => setInvJob(e.target.value as Job)}
                  style={sx("border:1px solid " + C.line + ";border-radius:10px;padding:9px 12px;font-family:inherit;font-size:13px;font-weight:700;color:" + C.ink + ";outline:none")}
                >
                  <option value="guide">ガイド</option>
                  <option value="driver">ドライバー</option>
                  <option value="ops">本部</option>
                </select>
              </div>
            )}
            {invRole === "staff" && (
              <div>
                <div style={sx(label + "margin-bottom:6px")}>付与する権限</div>
                <div style={sx("display:flex;gap:14px;flex-wrap:wrap")}>
                  {PERM_KEYS.map((k) => (
                    <label key={k} style={sx("display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;cursor:pointer")}>
                      <input
                        type="checkbox"
                        checked={invPerms[k]}
                        onChange={(e) => setInvPerms((p) => ({ ...p, [k]: e.target.checked }))}
                      />
                      {ROLE_LABELS[k]}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={issueInvite}
              disabled={inviting}
              style={sx(btn(C.blue, "#fff") + "display:flex;align-items:center;gap:8px")}
            >
              {inviting ? "発行中…" : "招待コードを発行"}
            </button>
          </div>

          {invites.length > 0 && (
            <div style={sx("display:flex;flex-direction:column;gap:8px")}>
              {invites.map((inv) => {
                const used = !!inv.acceptedAt;
                const expired = !used && inv.expiresAt !== null && new Date(inv.expiresAt) < new Date();
                return (
                  <div
                    key={inv.id}
                    style={sx("display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 13px;border:1px solid " + C.line + ";border-radius:10px;background:" + (used || expired ? "#F7FAFC" : "#fff"))}
                  >
                    <code style={sx("font-family:monospace;font-size:14px;font-weight:800;letter-spacing:1px;color:" + C.ink)}>{inv.code}</code>
                    <span style={sx("font-size:11px;font-weight:700;color:" + (inv.role === "owner" ? "#92400E" : C.deep))}>
                      {inv.role === "owner" ? "オーナー" : "スタッフ"}
                    </span>
                    <span style={sx("font-size:11px;font-weight:700;color:" + C.sub)}>
                      {JOB_LABELS[inv.job]}
                    </span>
                    <span style={sx("font-size:11px;color:" + C.sub)}>
                      {used ? "使用済み" : expired ? "期限切れ" : "有効"}
                    </span>
                    {!used && !expired && (
                      <>
                        <button
                          onClick={() => copyCode(inv.code)}
                          style={sx("margin-left:auto;font-size:12px;font-weight:700;color:" + C.deep + ";background:#E3F2FB;border:none;border-radius:8px;padding:6px 12px;cursor:pointer")}
                        >
                          {copiedCode === inv.code ? "✓ コピー済" : "コードをコピー"}
                        </button>
                        <button
                          onClick={() => revokeInvite(inv.id)}
                          style={sx("font-size:12px;font-weight:700;color:#B91C1C;background:#FEF2F2;border:none;border-radius:8px;padding:6px 12px;cursor:pointer")}
                        >
                          取り消し
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <div style={sx("display:flex;align-items:center;gap:14px;flex-wrap:wrap")}>
        <button
          onClick={() => setSaved(true)}
          style={sx(btn(saved ? C.green : C.blue, "#fff") + "display:flex;align-items:center;gap:8px")}
        >
          <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 4h11l3 3v13H5V4Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M8 4v5h7M8 14h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
          {saved ? "✓ 設定を保存しました" : "設定を保存"}
        </button>
        {saved ? <span style={sx("font-size:12px;color:" + C.green + ";font-weight:700")}>基準値・テンプレートを反映しました</span> : null}
        <span style={sx("font-size:11px;color:" + C.sub)}>※ メンバーの権限・招待は変更後すぐ保存されます</span>
      </div>
    </div>
  );
}
