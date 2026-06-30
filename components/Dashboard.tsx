import { sx } from "@/lib/sx";
import { kpis, timeline, alerts, channels } from "@/lib/data";
import { Html } from "./Html";
import { WeatherHero } from "./WeatherHero";

export function Dashboard({
  showStorm,
  onDismissStorm,
}: {
  showStorm: boolean;
  onDismissStorm: () => void;
}) {
  return (
    <>
      {/* BAD WEATHER ALERT BANNER */}
      {showStorm ? (
        <div
          className="r-wrap"
          style={{
            ...sx(
              "background:linear-gradient(100deg,#FFF3E6,#FFE8E8);border:1px solid #F7C39B;border-radius:16px;padding:16px 20px;display:flex;align-items:center;gap:16px;margin-bottom:18px"
            ),
            animation: "floatin .4s ease",
          }}
        >
          <div
            style={sx(
              "width:46px;height:46px;border-radius:13px;background:#F97316;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 6px 16px rgba(249,115,22,.4)"
            )}
          >
            <Html html='<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 16a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.6-1.3A3.8 3.8 0 0 1 18 14" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13l-2 4h3l-2 4" stroke="#FFD45E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
          </div>
          <div style={sx("flex:1")}>
            <div style={sx("font-weight:900;font-size:15px;color:#B4480E")}>
              悪天候警報 — 波高 2.4m / 風速 14m/s が基準値を超過
            </div>
            <div style={sx("font-size:12px;color:#9A5B2E;margin-top:3px")}>
              影響: 午前のシュノーケル・パラセーリング系{" "}
              <b>3ツアー / 顧客 38名</b>{" "}
              ・ 自動でリスケ/返金案内を一括送信できます
            </div>
          </div>
          <button
            onClick={onDismissStorm}
            style={sx(
              "background:#fff;border:1px solid #E7C9AE;color:#9A5B2E;font-family:inherit;font-weight:700;font-size:13px;padding:11px 16px;border-radius:11px;cursor:pointer"
            )}
          >
            個別に確認
          </button>
          <button
            onClick={onDismissStorm}
            style={sx(
              "background:#F97316;border:none;color:#fff;font-family:inherit;font-weight:800;font-size:13px;padding:11px 18px;border-radius:11px;cursor:pointer;box-shadow:0 6px 14px rgba(249,115,22,.35);display:flex;align-items:center;gap:7px"
            )}
          >
            <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>' />
            全顧客へ一括リスケ・返金案内
          </button>
        </div>
      ) : null}

      {/* KPI STRIP */}
      <div
        className="r-grid-4"
        style={sx(
          "display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px"
        )}
      >
        {kpis.map((k, i) => (
          <div
            key={i}
            style={sx(
              "background:#fff;border:1px solid #E6EEF4;border-radius:16px;padding:16px 18px;position:relative;overflow:hidden"
            )}
          >
            <div
              style={sx(
                "position:absolute;right:-10px;top:-10px;width:62px;height:62px;border-radius:50%;background:" +
                  k.tint +
                  ";opacity:.5"
              )}
            />
            <div style={sx("display:flex;align-items:center;gap:8px;position:relative")}>
              <Html
                style={sx(
                  "width:30px;height:30px;border-radius:9px;background:" +
                    k.iconBg +
                    ";display:flex;align-items:center;justify-content:center"
                )}
                html={k.icon}
              />
              <span style={sx("font-size:12px;color:#6E8BA0;font-weight:600")}>{k.label}</span>
            </div>
            <div
              className="font-outfit"
              style={sx("font-weight:800;font-size:26px;margin-top:10px;position:relative")}
            >
              {k.value}
            </div>
            <div
              style={sx(
                "font-size:11px;margin-top:2px;position:relative;color:" +
                  k.deltaColor +
                  ";font-weight:600"
              )}
            >
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* ROW: weather + timeline | alerts */}
      <div
        className="r-split"
        style={sx(
          "display:grid;grid-template-columns:1.55fr 1fr;gap:18px;align-items:start"
        )}
      >
        {/* LEFT COLUMN */}
        <div style={sx("display:flex;flex-direction:column;gap:18px")}>
          {/* WEATHER / SEA PANEL */}
          <section
            style={sx(
              "border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#0C6FB8 0%,#0E8FC9 55%,#22B3C9 100%);color:#fff;position:relative;box-shadow:0 12px 28px rgba(12,111,184,.28)"
            )}
          >
            <div
              style={sx(
                "position:absolute;inset:0;opacity:.25;background:radial-gradient(220px 120px at 85% 0%,#9FF0EA,transparent)"
              )}
            />
            <div
              style={sx(
                "position:absolute;bottom:0;left:0;right:0;height:46px;overflow:hidden;opacity:.5"
              )}
            >
              <div
                style={{
                  ...sx(
                    "width:200%;height:100%;background:radial-gradient(50% 18px at 12% 100%,#fff,transparent),radial-gradient(50% 16px at 38% 100%,#fff,transparent),radial-gradient(50% 18px at 62% 100%,#fff,transparent),radial-gradient(50% 16px at 88% 100%,#fff,transparent);opacity:.3"
                  ),
                  animation: "wave 8s linear infinite",
                }}
              />
            </div>
            <WeatherHero />
          </section>

          {/* TODAY TIMELINE */}
          <section
            style={sx(
              "background:#fff;border:1px solid #E6EEF4;border-radius:18px;padding:18px 20px"
            )}
          >
            <div
              style={sx(
                "display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"
              )}
            >
              <div style={sx("font-weight:800;font-size:15px")}>本日のタイムライン</div>
              <div style={sx("display:flex;gap:14px;font-size:11px;color:#6E8BA0")}>
                <span style={sx("display:flex;align-items:center;gap:5px")}>
                  <span style={sx("width:9px;height:9px;border-radius:3px;background:#16A34A")} />
                  進行中
                </span>
                <span style={sx("display:flex;align-items:center;gap:5px")}>
                  <span style={sx("width:9px;height:9px;border-radius:3px;background:#0E8FC9")} />
                  準備中
                </span>
                <span style={sx("display:flex;align-items:center;gap:5px")}>
                  <span style={sx("width:9px;height:9px;border-radius:3px;background:#C9D6E0")} />
                  終了
                </span>
              </div>
            </div>
            <div style={sx("display:flex;flex-direction:column;gap:10px")}>
              {timeline.map((t, i) => (
                <div key={i} style={sx("display:flex;align-items:center;gap:14px")}>
                  <div
                    className="font-outfit"
                    style={sx("width:46px;text-align:right;font-weight:700;font-size:13px;color:#0E2A3D")}
                  >
                    {t.time}
                  </div>
                  <div
                    style={sx(
                      "width:8px;height:8px;border-radius:50%;background:" +
                        t.dot +
                        ";flex-shrink:0;box-shadow:0 0 0 4px " +
                        t.dotRing
                    )}
                  />
                  <div
                    style={sx(
                      "flex:1;background:" +
                        t.bg +
                        ";border:1px solid " +
                        t.border +
                        ";border-radius:12px;padding:10px 13px;display:flex;align-items:center;gap:12px"
                    )}
                  >
                    <div style={sx("flex:1;min-width:0")}>
                      <div
                        style={sx(
                          "font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px"
                        )}
                      >
                        {t.title}
                        <span
                          style={sx(
                            "font-size:10px;font-weight:700;color:" +
                              t.chipColor +
                              ";background:" +
                              t.chipBg +
                              ";padding:2px 7px;border-radius:6px"
                          )}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div style={sx("font-size:11px;color:#6E8BA0;margin-top:3px")}>{t.meta}</div>
                    </div>
                    <div style={sx("text-align:right")}>
                      <div
                        className="font-outfit"
                        style={sx("font-weight:700;font-size:13px;color:" + t.fillColor)}
                      >
                        {t.seats}
                      </div>
                      <div
                        style={sx(
                          "width:64px;height:5px;background:#EAF0F5;border-radius:4px;margin-top:4px;overflow:hidden"
                        )}
                      >
                        <div
                          style={sx(
                            "height:100%;width:" +
                              t.fillPct +
                              ";background:" +
                              t.fillColor +
                              ";border-radius:4px"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={sx(
                "margin-top:12px;border:1.5px dashed #BFE0F0;background:#F2FAFE;border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:12px;color:#0A6FB0"
              )}
            >
              <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#0A6FB0" stroke-width="2" stroke-linecap="round"/></svg>' />
              <span>
                <b>ウォークイン空き枠:</b> 11:00 ジェットスキー <b>+4席</b> ・ 14:00 シティバイク{" "}
                <b>+6席</b> 当日受付可能
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={sx("display:flex;flex-direction:column;gap:18px")}>
          {/* EXCEPTION ALERTS */}
          <section
            style={sx(
              "background:#fff;border:1px solid #E6EEF4;border-radius:18px;padding:18px 18px 8px"
            )}
          >
            <div
              style={sx(
                "display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"
              )}
            >
              <div
                style={sx(
                  "font-weight:800;font-size:15px;display:flex;align-items:center;gap:8px"
                )}
              >
                要対応アラート
                <span
                  style={sx(
                    "font-size:11px;background:#FDE8E8;color:#E5484D;font-weight:800;padding:2px 9px;border-radius:20px"
                  )}
                >
                  {alerts.length}
                </span>
              </div>
              <span style={sx("font-size:11px;color:#6E8BA0;cursor:pointer")}>すべて表示</span>
            </div>
            <div style={sx("display:flex;flex-direction:column")}>
              {alerts.map((a, i) => (
                <div
                  key={i}
                  style={sx(
                    "display:flex;gap:12px;padding:12px 4px;border-bottom:1px solid #F0F5F8"
                  )}
                >
                  <Html
                    style={sx(
                      "width:34px;height:34px;border-radius:10px;background:" +
                        a.bg +
                        ";display:flex;align-items:center;justify-content:center;flex-shrink:0"
                    )}
                    html={a.icon}
                  />
                  <div style={sx("flex:1;min-width:0")}>
                    <div style={sx("font-weight:700;font-size:13px;line-height:1.3")}>{a.title}</div>
                    <div style={sx("font-size:11px;color:#6E8BA0;margin-top:2px")}>{a.meta}</div>
                  </div>
                  <button
                    style={sx(
                      "align-self:center;background:" +
                        a.btnBg +
                        ";color:" +
                        a.btnColor +
                        ";border:none;font-family:inherit;font-weight:700;font-size:11px;padding:7px 11px;border-radius:9px;cursor:pointer;white-space:nowrap"
                    )}
                  >
                    {a.action}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SALES + CHANNEL */}
          <section
            style={sx(
              "background:#fff;border:1px solid #E6EEF4;border-radius:18px;padding:18px 20px"
            )}
          >
            <div style={sx("font-weight:800;font-size:15px;margin-bottom:3px")}>
              売上・チャネルサマリー
            </div>
            <div style={sx("font-size:11px;color:#6E8BA0")}>本日の総売上着地（見込）</div>
            <div style={sx("display:flex;align-items:baseline;gap:8px;margin-top:6px")}>
              <div className="font-outfit" style={sx("font-weight:800;font-size:32px")}>
                $8,420
              </div>
              <div style={sx("font-size:12px;color:#16A34A;font-weight:700")}>▲ 12% 前週比</div>
            </div>
            <div
              style={sx(
                "display:flex;height:14px;border-radius:8px;overflow:hidden;margin-top:16px;gap:2px"
              )}
            >
              <div style={sx("width:46%;background:#0E8FC9")} />
              <div style={sx("width:31%;background:#22B3C9")} />
              <div style={sx("width:23%;background:#7FD4C0")} />
            </div>
            <div style={sx("display:flex;flex-direction:column;gap:11px;margin-top:16px")}>
              {channels.map((c, i) => (
                <div key={i} style={sx("display:flex;align-items:center;gap:10px")}>
                  <span
                    style={sx("width:10px;height:10px;border-radius:3px;background:" + c.color)}
                  />
                  <span style={sx("flex:1;font-size:13px;font-weight:600")}>{c.label}</span>
                  <span style={sx("font-size:12px;color:#6E8BA0")}>{c.count}</span>
                  <span
                    className="font-outfit"
                    style={sx("font-weight:700;font-size:13px;width:64px;text-align:right")}
                  >
                    {c.amount}
                  </span>
                  <span style={sx("font-size:12px;color:#9DB4C4;width:38px;text-align:right")}>
                    {c.pct}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={sx(
                "margin-top:14px;background:#F2FAFE;border-radius:12px;padding:11px 14px;font-size:12px;color:#0A6FB0;display:flex;align-items:center;gap:8px"
              )}
            >
              <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#0A6FB0" stroke-width="2"/><path d="M12 7v5l3 2" stroke="#0A6FB0" stroke-width="2" stroke-linecap="round"/></svg>' />
              <span>
                未収金 <b>$640</b>（3件）・ 代理店回収予定 <b>$1,180</b>
              </span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
