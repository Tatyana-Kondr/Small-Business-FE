import { Button } from "@mui/material";
import { outlinedButtonStyle } from "../../styles/buttonStyles";

type FilterToggleButtonProps = {
  visible: boolean;
  onClick: () => void;
};

export default function FilterToggleButton({
  visible,
  onClick,
}: FilterToggleButtonProps) {
  return (
    <Button
      variant="outlined"
      sx={outlinedButtonStyle}
      onClick={onClick}
    >
      {visible ? "Filter ausblenden" : "Filter anzeigen"}
    </Button>
  );
}