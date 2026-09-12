import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { colors } from "../../styles/colors";

type HoverExpandTextProps = {
  text: string;
  hoverBgColor?: string;
};

export default function HoverExpandText({
  text,
  hoverBgColor = colors.tableHover,
}: HoverExpandTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;

      if (element) {
        setIsOverflowed(element.scrollWidth > element.clientWidth);
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);

    if (textRef.current) {
      resizeObserver.observe(textRef.current);
    }

    window.addEventListener("resize", checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [text]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 0,

        "&:hover .expanded-text": {
          display: isOverflowed ? "flex" : "none",
        },
      }}
    >
      <Box
        ref={textRef}
        sx={{
          width: "100%",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Box>

      <Box
        className="expanded-text"
        sx={{
          display: "none",
          position: "absolute",
          left: -8,
          top: -2,
          bottom: -2,
          zIndex: 9999,
          alignItems: "center",
          whiteSpace: "nowrap",
          backgroundColor: hoverBgColor,
          fontWeight: 500,
          px: 1,
          py: 0,
          boxSizing: "border-box",
          borderRight: `1px solid ${colors.border}`,
          color: colors.primaryDark,
        }}
      >
        {text}
      </Box>
    </Box>
  );
}