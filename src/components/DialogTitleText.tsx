import { Typography } from "@mui/material";
import { dialogTitleStyle } from "../styles/typographyStyles";



type DialogTitleTextProps = {
  children: React.ReactNode;
};

export default function DialogTitleText({ children }: DialogTitleTextProps) {
  return (
    <Typography variant="h6" sx={dialogTitleStyle}>
      {children}
    </Typography>
  );
}