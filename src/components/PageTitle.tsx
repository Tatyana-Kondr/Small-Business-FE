// src/components/common/PageTitle.tsx

import { Typography } from "@mui/material";
import { pageTitleStyle } from "../styles/typographyStyles";



type PageTitleProps = {
  children: React.ReactNode;
};

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <Typography variant="h6" sx={pageTitleStyle}>
      {children}
    </Typography>
  );
}