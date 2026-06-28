"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { NavId, headers } from "@/lib/data";
import { booking, asset } from "@/lib/modules-static";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Dashboard } from "@/components/Dashboard";
import { FloatingChat } from "@/components/FloatingChat";
import { StaticModule } from "@/components/StaticModule";
import { AssignModule } from "@/components/modules/AssignModule";
import { CrmModule } from "@/components/modules/CrmModule";
import { ManifestModule } from "@/components/modules/ManifestModule";
import { RouteModule } from "@/components/modules/RouteModule";
import { SettingsModule } from "@/components/modules/SettingsModule";
import { SalesModule } from "@/components/modules/SalesModule";

export default function Page() {
  const [active, setActive] = useState<NavId>("dashboard");
  const [showStorm, setShowStorm] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [thread, setThread] = useState("snorkel");
  const [clock, setClock] = useState("09:42");

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setClock(
        String(d.getHours()).padStart(2, "0") +
          ":" +
          String(d.getMinutes()).padStart(2, "0")
      );
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const [title, sub] = headers[active];

  function renderMain() {
    switch (active) {
      case "dashboard":
        return (
          <Dashboard showStorm={showStorm} onDismissStorm={() => setShowStorm(false)} />
        );
      case "booking":
        return <StaticModule html={booking()} />;
      case "assign":
        return <AssignModule />;
      case "asset":
        return <StaticModule html={asset()} />;
      case "route":
        return <RouteModule />;
      case "crm":
        return <CrmModule />;
      case "manifest":
        return <ManifestModule />;
      case "sales":
        return <SalesModule />;
      case "settings":
        return <SettingsModule />;
    }
  }

  return (
    <div
      style={sx(
        "display:flex;height:100vh;width:100%;background:#EEF5FA;color:#0E2A3D;overflow:hidden;font-size:14px"
      )}
    >
      <Sidebar active={active} onSelect={setActive} />

      <div style={sx("flex:1;display:flex;flex-direction:column;overflow:hidden")}>
        <Topbar title={title} sub={sub} clock={clock} />
        <main style={sx("flex:1;overflow-y:auto;padding:22px 26px 40px")}>{renderMain()}</main>
      </div>

      <FloatingChat
        open={chatOpen}
        onToggle={() => setChatOpen((v) => !v)}
        thread={thread}
        onThread={setThread}
      />
    </div>
  );
}
