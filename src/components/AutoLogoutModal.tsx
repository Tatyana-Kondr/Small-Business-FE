import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

interface AutoLogoutModalProps {
  show: boolean;
  endTime: number;
  warningTime: number;
}

// Плавное смешение цветов
function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);

  const ar = (ah >> 16) & 0xff;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;

  const br = (bh >> 16) & 0xff;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;

  const rr = Math.round(ar + t * (br - ar));
  const rg = Math.round(ag + t * (bg - ag));
  const rb = Math.round(ab + t * (bb - ab));

  return "#" + ((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, "0");
}

export default function AutoLogoutModal({
  show,
  endTime,
  warningTime,
}: AutoLogoutModalProps) {
  const [timeLeft, setTimeLeft] = useState(Math.max(endTime - Date.now(), 0));

  // ---------------------------------------------
  // Обратный отсчёт
  // ---------------------------------------------

  useEffect(() => {
    if (!show) {
      return;
    }

    const updateTime = () => {
      setTimeLeft(Math.max(endTime - Date.now(), 0));
    };

    // Сразу обновляем значение при открытии
    updateTime();

    const interval = setInterval(updateTime, 200);

    return () => {
      clearInterval(interval);
    };
  }, [show, endTime]);

  // ---------------------------------------------
  // Расчёт оставшегося времени
  // ---------------------------------------------

  const safeWarningTime = Math.max(warningTime, 1);

  const clamped = Math.min(Math.max(timeLeft, 0), safeWarningTime);

  const secondsLeft = Math.ceil(clamped / 1000);

  const percent = clamped / safeWarningTime;

  // ---------------------------------------------
  // Цвет индикатора
  // ---------------------------------------------

  const color = useMemo(() => {
    if (percent > 0.5) {
      const t = (1 - percent) / 0.5;

      return lerpColor("#08dbd1", "#d9ff00", t);
    }

    const t = (0.5 - percent) / 0.5;

    return lerpColor("#d9ff00", "#f51808", t);
  }, [percent]);

  // ---------------------------------------------
  // Круговой индикатор
  // ---------------------------------------------

  const size = 140;
  const radius = 60;

  const center = size / 2;

  const circumference = 2 * Math.PI * radius;

  const dashOffset = Math.max(0, (1 - percent) * circumference);

  return (
    <Dialog
      open={show}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            textAlign: "center",
            animation: "fadeIn 200ms ease-out",
          },
        },
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.7)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          pb: 0,
        }}
      >
        Sie werden in
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            my: 2,
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Фоновый круг */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#e0e0e0"
              strokeWidth="10"
              fill="none"
            />

            {/* Цветной индикатор */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                transition:
                  "stroke 200ms linear, stroke-dashoffset 200ms linear",
              }}
            />
          </svg>

          {/* Цифры */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                fontSize: 32,
                fontWeight: 800,
                color,
                animation:
                  secondsLeft <= 10
                    ? "pulseText 1s ease-in-out infinite"
                    : "none",
              }}
            >
              {secondsLeft}
            </Box>
          </Box>
        </Box>

        <Typography
          sx={{
            fontWeight: 700,
          }}
        >
          Sekunden abgemeldet.
        </Typography>
      </DialogContent>

      <style>
        {`
          @keyframes pulseText {
            0% {
              transform: scale(1);
              opacity: 1;
            }

            50% {
              transform: scale(1.18);
              opacity: 0.85;
            }

            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.97);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </Dialog>
  );
}
