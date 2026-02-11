import * as React from "react";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  text: string;
  placement?: React.ComponentProps<typeof Tooltip>["placement"];
  /** Если хочешь показывать в tooltip и многословный текст без переносов — оставь true */
  nowrapTooltip?: boolean;
};

function getFontShorthand(el: HTMLElement) {
  const cs = window.getComputedStyle(el);
  // canvas понимает font в таком формате
  return `${cs.fontStyle} ${cs.fontVariant} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;
}

export default function EllipsisTooltip({
  text,
  placement = "right-start",
  nowrapTooltip = true,
}: Props) {
  const ref = React.useRef<HTMLSpanElement>(null);

  const [isOverflowed, setIsOverflowed] = React.useState(false);
  const [remainder, setRemainder] = React.useState("");

  const recalc = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const width = el.clientWidth;
    if (!width || !text) {
      setIsOverflowed(false);
      setRemainder("");
      return;
    }

    // Быстрая проверка: есть ли переполнение вообще
    const overflowNow = el.scrollWidth > el.clientWidth;
    setIsOverflowed(overflowNow);

    if (!overflowNow) {
      setRemainder("");
      return;
    }

    // Точное вычисление: сколько символов влезает до "…"
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = getFontShorthand(el);

    const ell = "…";
    const ellW = ctx.measureText(ell).width;

    // бинарный поиск по длине префикса
    let lo = 0;
    let hi = text.length;

    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const prefix = text.slice(0, mid);
      const w = ctx.measureText(prefix).width + ellW;

      if (w <= width) lo = mid;
      else hi = mid - 1;
    }

    // lo — длина видимой части до троеточия
    const rest = text.slice(lo);
    setRemainder(rest);
  }, [text]);

  React.useLayoutEffect(() => {
    recalc();
  }, [recalc]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);

    return () => ro.disconnect();
  }, [recalc]);

  return (
    <Tooltip
      title={isOverflowed ? remainder : ""}
      disableHoverListener={!isOverflowed}
      arrow
      placement={placement}
      slotProps={{
        tooltip: {
          sx: {
            whiteSpace: nowrapTooltip ? "nowrap" : "normal",
            maxWidth: "none",
            fontSize: "inherit",
          },
        },
      }}
    >
      <span
        ref={ref}
        style={{
          display: "block",
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
}
