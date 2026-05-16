// Full Circle Resolutions — Tweaks panel
// Reads/writes shared.js's localStorage-backed tweak state.

const { useEffect, useState } = React;

function FCSTweaks() {
  const [tweaks, setTweaks] = useState(() => window.__fcs_tweaks || {});
  const [open, setOpen] = useState(false);

  // Edit-mode protocol
  useEffect(() => {
    function onMsg(e) {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setOpen(false);
    }
    window.addEventListener("message", onMsg);
    // announce after listener is wired
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  function set(patch) {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    window.__fcs_setTweaks(patch);
  }

  function close() {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  }

  if (!open) return null;

  const wrap = {
    position: "fixed",
    right: 20,
    bottom: 20,
    width: 320,
    background: "var(--surface)",
    border: "1px solid var(--rule)",
    borderRadius: 14,
    boxShadow: "0 18px 48px rgba(40,30,20,0.18)",
    fontFamily: "var(--sans)",
    color: "var(--on-surface)",
    zIndex: 1000,
    overflow: "hidden"
  };
  const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    borderBottom: "1px solid var(--rule)",
    background: "var(--surface-2)"
  };
  const body = { padding: "16px 18px", maxHeight: "70vh", overflow: "auto" };
  const group = { marginBottom: 18 };
  const label = {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: 8,
    fontWeight: 500
  };
  const seg = {
    display: "flex",
    background: "var(--surface-2)",
    border: "1px solid var(--rule)",
    borderRadius: 999,
    padding: 3
  };
  const segBtn = (active) => ({
    flex: 1,
    border: "none",
    background: active ? "var(--forest)" : "transparent",
    color: active ? "var(--cream-soft)" : "var(--on-surface-soft)",
    padding: "7px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.18s"
  });
  const swatchRow = { display: "flex", gap: 8 };
  const swatch = (colors, active) => ({
    flex: 1,
    height: 36,
    borderRadius: 8,
    cursor: "pointer",
    border: active ? "2px solid var(--forest)" : "2px solid transparent",
    boxShadow: active ? "0 0 0 2px var(--surface), 0 0 0 4px var(--forest)" : "none",
    background: `linear-gradient(90deg, ${colors.join(", ")})`,
    transition: "all 0.15s"
  });

  const palettes = {
    warm: ["#f3ecdf", "#c4956b", "#7aa6a3", "#445a3e"],
    cool: ["#e7ecec", "#8aa3bf", "#6c8e95", "#2f4a52"],
    forest: ["#e8e5d6", "#9b8a4f", "#7d9670", "#2f3d2b"]
  };

  return (
    <div style={wrap}>
      <div style={header}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18 }}>Tweaks</div>
        <button
          onClick={close}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18 }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div style={body}>
        <div style={group}>
          <div style={label}>Palette</div>
          <div style={swatchRow}>
            {Object.entries(palettes).map(([key, colors]) => (
              <div
                key={key}
                style={swatch(colors, tweaks.palette === key)}
                onClick={() => set({ palette: key })}
                title={key}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
            <span>Warm</span><span>Cool</span><span>Forest</span>
          </div>
        </div>

        <div style={group}>
          <div style={label}>Typography</div>
          <div style={seg}>
            {[
              ["serif", "Serif + Sans"],
              ["sans", "All Sans"],
              ["script", "Script Logo"]
            ].map(([k, lbl]) => (
              <button key={k} style={segBtn(tweaks.type === k)} onClick={() => set({ type: k })}>{lbl}</button>
            ))}
          </div>
        </div>

        <div style={group}>
          <div style={label}>Theme</div>
          <div style={seg}>
            <button style={segBtn(tweaks.theme === "light")} onClick={() => set({ theme: "light" })}>Light</button>
            <button style={segBtn(tweaks.theme === "dark")} onClick={() => set({ theme: "dark" })}>Dark</button>
          </div>
        </div>

        <div style={group}>
          <div style={label}>Section style</div>
          <div style={seg}>
            {[
              ["default", "Open"],
              ["cards", "Cards"],
              ["ribbons", "Ribbon"],
              ["boxed", "Boxed"]
            ].map(([k, lbl]) => (
              <button key={k} style={segBtn(tweaks.sectionStyle === k)} onClick={() => set({ sectionStyle: k })}>{lbl}</button>
            ))}
          </div>
        </div>

        <div style={group}>
          <div style={label}>Hero layout</div>
          <div style={seg}>
            {[
              ["split", "Split"],
              ["centered", "Centered"],
              ["overlay", "Overlay"]
            ].map(([k, lbl]) => (
              <button key={k} style={segBtn(tweaks.heroLayout === k)} onClick={() => set({ heroLayout: k })}>{lbl}</button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
          Tweaks apply to every page. Toggle off in the toolbar to preview cleanly.
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("tweaks-root"));
root.render(<FCSTweaks />);
