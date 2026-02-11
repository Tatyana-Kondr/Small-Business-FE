import * as React from "react";
import Tooltip from "@mui/material/Tooltip";

type EllipsisTooltipProps = {
  text: string;
  children: React.ReactNode;
  placement?: React.ComponentProps<typeof Tooltip>["placement"];
};

export default function EllipsisTooltip({
  text,
  children,
  placement = "top",
}: EllipsisTooltipProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [isOverflowed, setIsOverflowed] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Проверяем реальное переполнение
    const check = () => setIsOverflowed(el.scrollWidth > el.clientWidth);

    check();

    // На случай ресайза/изменения ширины колонок
    const ro = new ResizeObserver(check);
    ro.observe(el);

    return () => ro.disconnect();
  }, [text]);

  return (
    <Tooltip
      title={isOverflowed ? text : ""}
      disableHoverListener={!isOverflowed}
      arrow
      placement={placement}
    >
      <span ref={ref} style={{ display: "inline-block", width: "100%" }}>
        {children}
      </span>
    </Tooltip>
  );
}
