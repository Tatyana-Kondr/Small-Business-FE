import { Box, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface AutoLogoutModalProps {
  show: boolean;
  endTime: number;      // момент завершения сессии (Date.now() в мс)
  warningTime: number;  // длительность окна предупреждения (мс)
}

// плавное смешение цвета
function lerpColor(a: string, b: string, t: number) {
  const ah = +a.replace("#", "0x"), ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const bh = +b.replace("#", "0x"), br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + t * (br - ar));
  const rg = Math.round(ag + t * (bg - ag));
  const rb = Math.round(ab + t * (bb - ab));
  return "#" + (rr << 16 | rg << 8 | rb).toString(16).padStart(6, "0");
}

const AutoLogoutModal: React.FC<AutoLogoutModalProps> = ({ show, endTime, warningTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(endTime - Date.now(), 0));
  const rafRef = useRef<number | null>(null);

  // следим за таймером
  useEffect(() => {
    if (!show) return;
    const tick = () => {
      const left = Math.max(endTime - Date.now(), 0);
      setTimeLeft(left);
      if (left > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [show, endTime]);

 // вычисления всегда должны выполняться, даже если show = false
  const clamped = Math.min(Math.max(timeLeft, 0), warningTime);
  const secondsLeft = Math.ceil(clamped / 1000);
  const percent = clamped / warningTime; // 1..0

  const color = useMemo(() => {
    if (percent > 0.5) {
      const t = (1 - percent) / 0.5;           // 0..1
      return lerpColor("#08dbd1", "#d9ff00", t); // зелёный -> жёлтый
    } else {
      const t = (0.5 - percent) / 0.5;         // 0..1
      return lerpColor("#d9ff00", "#f51808", t); // жёлтый -> красный
    }
  }, [percent]);

  const size = 140;
  const r = 60;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const dash = Math.max(0, (1 - percent) * C);

  if (!show) return null;

  return (
    <Dialog
      open={show}
      onClose={() => {}}
      disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: 3, p: 3, minWidth: 360, textAlign: "center", animation: "fadeIn 200ms ease-out" } }}
      BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.7)" } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Sie werden in</DialogTitle>
      <DialogContent>
        <Box sx={{ position: "relative", display: "inline-flex", my: 2 }}>
          <svg width={size} height={size}>
            <circle cx={cx} cy={cy} r={r} stroke="#e0e0e0" strokeWidth="10" fill="none" />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeDasharray={C}
              strokeDashoffset={dash}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>

          {/* Пульсируют только цифры */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 32,
              fontWeight: 800,
              color,
              animation: secondsLeft <= 10 ? "pulseText 1s ease-in-out infinite" : "none",
            }}
          >
            {secondsLeft}
          </Box>
        </Box>
        <Typography sx={{ fontWeight: 700 }}>Sekunden abgemeldet.</Typography>
      </DialogContent>

      <style>{`
        @keyframes pulseText {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          50%  { transform: translate(-50%, -50%) scale(1.18); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Dialog>
  );
};

export default AutoLogoutModal;