import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onToggleControls: () => void;
  onToggleTimeDilation: () => void;
  onToggleLensing: () => void;
  onTogglePhotonSphere: () => void;
  onToggleISCO: () => void;
  onResetDefaults: () => void;
}

export function useKeyboardShortcuts({
  onToggleControls,
  onToggleTimeDilation,
  onToggleLensing,
  onTogglePhotonSphere,
  onToggleISCO,
  onResetDefaults,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          onToggleControls();
          break;
        case "t":
          e.preventDefault();
          onToggleTimeDilation();
          break;
        case "g":
          e.preventDefault();
          onToggleLensing();
          break;
        case "p":
          e.preventDefault();
          onTogglePhotonSphere();
          break;
        case "i":
          e.preventDefault();
          onToggleISCO();
          break;
        case "r":
          e.preventDefault();
          onResetDefaults();
          break;
        case "?":
          e.preventDefault();
          // Handled by parent to toggle help
          document.dispatchEvent(new CustomEvent("toggle-shortcuts-help"));
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    onToggleControls,
    onToggleTimeDilation,
    onToggleLensing,
    onTogglePhotonSphere,
    onToggleISCO,
    onResetDefaults,
  ]);
}

const shortcuts = [
  { key: "C", desc: "Toggle controls panel" },
  { key: "T", desc: "Toggle time dilation panel" },
  { key: "G", desc: "Toggle gravitational lensing" },
  { key: "P", desc: "Toggle photon sphere" },
  { key: "I", desc: "Toggle ISCO ring" },
  { key: "R", desc: "Reset to defaults" },
  { key: "?", desc: "Show/hide this help" },
];

export function ShortcutsHelp({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed top-4 right-4 z-50 w-56 rounded-2xl border border-border bg-card/90 backdrop-blur-lg p-4">
      <h3 className="font-display text-base text-primary mb-2">⌨ Shortcuts</h3>
      <div className="space-y-1">
        {shortcuts.map(({ key, desc }) => (
          <div key={key} className="flex items-center gap-2 font-body text-xs">
            <kbd className="inline-flex items-center justify-center w-6 h-5 rounded bg-muted text-foreground font-semibold text-[10px] border border-border">
              {key}
            </kbd>
            <span className="text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
