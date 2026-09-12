import { Components, Theme } from "@mui/material/styles";
import { colors } from "../styles/colors";

export const appComponents: Components<Omit<Theme, "components">> = {

    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 6,
                transition:
                    "background-color .2s ease, color .2s ease, transform .2s ease",

                "&:focus": {
                    outline: "none",
                },

                "&.Mui-focusVisible": {
                    outline: "none",
                    boxShadow: `0 0 0 3px ${colors.accentLight}`,
                },
            },
        },
    },

    MuiTextField: {
        defaultProps: {
            size: "small",
            variant: "outlined",
        },
    },

    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                borderRadius: 6,

                // Обычный бордер
                "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.border,
                },

                // При наведении
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.accentBlue,
                },

                "&:hover": {
                    backgroundColor: colors.accentLight,
                },

                "&.Mui-focused": {
                    backgroundColor: colors.accentLight,
                    boxShadow: `0 0 0 2px ${colors.accentLight}`,
                },

                // При фокусе
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.accentBlue,
                    borderWidth: 2,
                },

                "& input:-webkit-autofill": {
                    WebkitBoxShadow: `0 0 0 100px ${colors.accentLight} inset`,
                    WebkitTextFillColor: "#000",
                    caretColor: "#000",
                    borderRadius: 8,
                },

                "& input:-webkit-autofill:hover": {
                    WebkitBoxShadow: `0 0 0 100px ${colors.accentLight} inset`,
                },

                "& input:-webkit-autofill:focus": {
                    WebkitBoxShadow: `0 0 0 100px ${colors.accentLight} inset`,
                },

            },
        },
    },

    MuiSelect: {
        defaultProps: {
            size: "small",
        },
    },

    MuiFormControl: {
        defaultProps: {
            size: "small",
        },
    },

    MuiInputLabel: {
        styleOverrides: {
            root: {
                color: colors.grey,

                "&.Mui-focused": {
                    color: colors.accentBlue,
                },
            },
        },
    },

    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 12,
            },
        },
    },

    MuiTooltip: {
        styleOverrides: {
            tooltip: {
                backgroundColor: colors.grey,
                color: colors.white,
                fontSize: "0.8rem",
                padding: "4px 8px",
            },

            arrow: {
                color: colors.primaryDark,
            },
        },
    },

    MuiTableCell: {
        styleOverrides: {
            root: {
                borderColor: colors.border,
            },
        },
    },

    MuiTableRow: {
        styleOverrides: {
            root: {
                transition: "background-color .2s ease",
            },
        },
    },

    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            },
        },
    },

    MuiDivider: {
        styleOverrides: {
            root: {
                borderColor: colors.border,
            },
        },
    },

    MuiIconButton: {
        styleOverrides: {
            root: {
                transition: "transform .2s ease-in-out, color .2s ease-in-out",

                "&:focus": {
                    outline: "none",
                },

                "&.Mui-focusVisible": {
                    outline: "none",
                    boxShadow: `0 0 0 3px ${colors.accentLight}`,
                },
            },
        },
    },

    MuiAlert: {
        styleOverrides: {
            root: {
                borderRadius: 8,
            },
        },
    },
};