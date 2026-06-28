import { sx } from "@/lib/sx";

// ログイン / サインアップ画面の共通レイアウト
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={sx(
        "min-height:100vh;display:flex;align-items:center;justify-content:center;background:#EEF5FA;color:#0E2A3D;padding:24px"
      )}
    >
      <div
        style={sx(
          "width:100%;max-width:400px;background:#fff;border:1px solid #E0EBF2;border-radius:16px;padding:34px 30px;box-shadow:0 14px 40px rgba(14,42,61,.08)"
        )}
      >
        <div style={sx("text-align:center;margin-bottom:24px")}>
          <div
            style={sx(
              "font-family:Outfit,sans-serif;font-size:24px;font-weight:800;letter-spacing:.5px;color:#0A5688"
            )}
          >
            Tourhub
          </div>
          <div style={sx("font-size:18px;font-weight:900;margin-top:14px")}>
            {title}
          </div>
          <div style={sx("font-size:12px;color:#6E8BA0;margin-top:4px")}>
            {subtitle}
          </div>
        </div>
        {children}
        {footer && (
          <div
            style={sx(
              "margin-top:20px;text-align:center;font-size:12px;color:#6E8BA0"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export const fieldStyle = sx(
  "width:100%;box-sizing:border-box;padding:11px 13px;border:1px solid #D7E4EE;border-radius:10px;font-size:14px;background:#F8FBFD;color:#0E2A3D;outline:none"
);

export const labelStyle = sx(
  "display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#37536A"
);

export const buttonStyle = sx(
  "width:100%;padding:12px;border:none;border-radius:10px;background:#0A5688;color:#fff;font-size:14px;font-weight:700;cursor:pointer"
);

export const errorStyle = sx(
  "background:#FDECEC;border:1px solid #F5C2C2;color:#C0392B;font-size:12px;border-radius:9px;padding:10px 12px;margin-bottom:16px"
);
