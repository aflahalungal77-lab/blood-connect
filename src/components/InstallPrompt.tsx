
"use client";

import { useEffect, useState } from "react";

type InstallPromptProps = {
  appName: string;
};

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt({ appName }: InstallPromptProps) {
  const [show, setShow] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<InstallEvent | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  
useEffect(() => {
  const key = `install-dismissed-${appName}`;

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  // Installed app ആണെങ്കിൽ popup കാണിക്കരുത്
  if (isStandalone()) {
    setShow(false);
  } else if (!sessionStorage.getItem(key)) {
    setShow(true);
  }

  const handleInstall = (event: Event) => {
    event.preventDefault();
    setInstallEvent(event as InstallEvent);
  };

  const handleAppInstalled = () => {
    setShow(false);
    setInstallEvent(null);
    sessionStorage.setItem(key, "true");
  };

  window.addEventListener("beforeinstallprompt", handleInstall);
  window.addEventListener("appinstalled", handleAppInstalled);

  // Display mode മാറിയാൽ വീണ്ടും പരിശോധിക്കുക
  const media = window.matchMedia("(display-mode: standalone)");

  const handleDisplayChange = () => {
    if (isStandalone()) setShow(false);
  };

  media.addEventListener("change", handleDisplayChange);

  return () => {
    window.removeEventListener("beforeinstallprompt", handleInstall);
    window.removeEventListener("appinstalled", handleAppInstalled);
    media.removeEventListener("change", handleDisplayChange);
  };
}, [appName]);

  async function install() {
    if (!installEvent) {
      setMessage(
        /iphone|ipad|ipod/i.test(navigator.userAgent)
          ? 'Safari-യിലെ Share ബട്ടൺ അമർത്തി "Add to Home Screen" തിരഞ്ഞെടുക്കുക.'
          : "Browser menu തുറന്ന് Install app അല്ലെങ്കിൽ Add to Home Screen തിരഞ്ഞെടുക്കുക."
      );
      return;
    }

    try {
      setBusy(true);
      await installEvent.prompt();
      const result = await installEvent.userChoice;

if (result.outcome === "accepted") {
  setShow(false);
  sessionStorage.setItem(`install-dismissed-${appName}`, "true");
}
      setInstallEvent(null);
    } catch {
      setMessage("Installation ഇപ്പോൾ ആരംഭിക്കാനായില്ല. വീണ്ടും ശ്രമിക്കൂ.");
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    sessionStorage.setItem(`install-dismissed-${appName}`, "true");
    setShow(false);
  }

  if (!show) return null;

  const isAdmin = appName.toLowerCase().includes("admin");
  const accent = isAdmin ? "#7f1d1d" : "#dc2626";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(10, 15, 25, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "bcFade .3s ease both",
        fontFamily: "inherit",
      }}
    >
      <style>{`
        @keyframes bcFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bcPop {
          from { opacity: 0; transform: translateY(22px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bcPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,.12); }
          50% { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
        }
        .bc-install-primary:hover {
          filter: brightness(1.07);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(127,29,29,.28);
        }
        .bc-install-secondary:hover {
          background: #f8fafc !important;
          color: #111827 !important;
        }
        .bc-install-primary:focus-visible,
        .bc-install-secondary:focus-visible {
          outline: 3px solid #fca5a5;
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .bc-install-card, .bc-install-mark { animation: none !important; }
          .bc-install-primary { transition: none !important; }
        }
      `}</style>

      <section
        className="bc-install-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 390,
          boxSizing: "border-box",
          overflow: "hidden",
          padding: "32px 25px 24px",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,.85)",
          background: "linear-gradient(155deg,#fff 0%,#fffafa 65%,#fff1f2 100%)",
          color: "#111827",
          textAlign: "center",
          boxShadow: "0 30px 100px rgba(0,0,0,.3)",
          animation: "bcPop .42s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto",
            height: 5,
            background: `linear-gradient(90deg,${accent},#f87171,#fecaca)`,
          }}
        />

        <div
          className="bc-install-mark"
          style={{
            width: 78,
            height: 78,
            margin: "0 auto 21px",
            display: "grid",
            placeItems: "center",
            borderRadius: 24,
            color: accent,
            background: "linear-gradient(145deg,#fee2e2,#fff1f2)",
            border: "1px solid #fecaca",
            fontSize: 43,
            animation: "bcPulse 2.4s ease-in-out infinite",
          }}
          aria-hidden="true"
        >
          ♥
        </div>

        <div
          style={{
            color: accent,
            fontSize: 10,
            fontWeight: 850,
            letterSpacing: 3,
            marginBottom: 11,
          }}
        >
          {isAdmin ? "ADMIN WORKSPACE" : "COMMUNITY • CARE • HOPE"}
        </div>

        <h2
          id="install-title"
          style={{
            margin: 0,
            fontSize: "clamp(24px, 6vw, 30px)",
            fontWeight: 850,
            letterSpacing: "-1px",
            lineHeight: 1.2,
          }}
        >
          {isAdmin ? "Your dashboard," : "Care is one tap"}{" "}
          <span style={{ color: accent }}>
            {isAdmin ? "anywhere." : "away."}
          </span>
        </h2>

        <p
          style={{
            margin: "13px auto 22px",
            maxWidth: 300,
            color: "#6b7280",
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          Install <strong style={{ color: "#374151" }}>{appName}</strong>{" "}
          for quick access from your home screen.
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            padding: 16,
            marginBottom: 23,
            textAlign: "left",
            background: "rgba(254,226,226,.38)",
            border: "1px solid #fee2e2",
            borderRadius: 17,
          }}
        >
          {[
            "Quick access from your home screen",
            "A dedicated app-like experience",
            "Reach the website in fewer steps",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#374151",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  width: 21,
                  height: 21,
                  borderRadius: "50%",
                  color: "#fff",
                  background: accent,
                  fontSize: 11,
                }}
              >
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>

        {message && (
          <p
            role="status"
            style={{
              padding: 12,
              margin: "0 0 14px",
              borderRadius: 12,
              color: "#991b1b",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            {message}
          </p>
        )}

        <button
          className="bc-install-primary"
          onClick={install}
          disabled={busy}
          style={{
            width: "100%",
            minHeight: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 18px",
            border: 0,
            borderRadius: 15,
            color: "#fff",
            background: `linear-gradient(135deg,${accent},#ef4444)`,
            boxShadow: "0 9px 22px rgba(185,28,28,.22)",
            fontSize: 14,
            fontWeight: 800,
            cursor: busy ? "wait" : "pointer",
            transition: "transform .2s ease,box-shadow .2s ease",
          }}
        >
          {busy ? "Opening installer…" : "Install App"}
          {!busy && <span aria-hidden="true">→</span>}
        </button>

        <button
          className="bc-install-secondary"
          onClick={cancel}
          style={{
            width: "100%",
            minHeight: 47,
            marginTop: 10,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "transparent",
            color: "#6b7280",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "background .2s ease,color .2s ease",
          }}
        >
          Continue on Website
        </button>

        <p
          style={{
            margin: "17px 0 0",
            color: "#9ca3af",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          BLOOD CONNECT MEENARKUZHI
        </p>
      </section>
    </div>
  );
}