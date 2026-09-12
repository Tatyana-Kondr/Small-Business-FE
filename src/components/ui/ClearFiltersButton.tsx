import { Button } from "@mui/material";
import { outlinedButtonStyle } from "../../styles/buttonStyles";

type ClearFiltersButtonProps = {
  onClick: () => void;
};

export default function ClearFiltersButton({
  onClick,
}: ClearFiltersButtonProps) {
  return (
    <Button
      variant="outlined"
      sx={outlinedButtonStyle}
      onClick={onClick}
    >
      Filter zurücksetzen
    </Button>
  );
}