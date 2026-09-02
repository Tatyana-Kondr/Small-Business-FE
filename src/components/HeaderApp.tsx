import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  MenuItem,
  Toolbar,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import KeyboardDoubleArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftOutlined";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout, selectUser } from "../features/auth/authSlice";

import { closeModal, openModal } from "../modal/modalSlice";
import {
  getCustomers,
  getCustomersWithCustomerNumber,
} from "../features/customers/customersSlice";
import { selectCompany } from "../features/company/companiesSlice";
import { colors } from "../styles/colors";

type ModalConfig = {
  name: string;
  props?: Record<string, any>;
};

type HeaderMenuItem = {
  label?: string;
  to?: string;
  modal?: ModalConfig;
  divider?: boolean;
  adminOnly?: boolean;
};

type HeaderMenu = {
  label: string;
  to?: string;
  adminOnly?: boolean;
  items?: HeaderMenuItem[];
};

const menuBgColor = colors.accent;
const menuHoverColor = colors.gradientLight;
const headerTextColor = colors.primaryDark;

const headerMenus: HeaderMenu[] = [
  {
    label: "Produkte",
    to: "/products",
    items: [
      { label: "Neues Produkt", modal: { name: "createProduct", props: {} } },
      { label: "Produktkategorien", to: "/product-categories" },
    ],
  },
  {
    label: "Aufträge",
    to: "/sales",
    items: [
      { label: "Neuer Auftrag", modal: { name: "createSale", props: {} } },
    ],
  },
  {
    label: "Bestellungen",
    to: "/purchases",
    items: [
      {
        label: "Neue Bestellung",
        modal: { name: "createPurchase", props: {} },
      },
    ],
  },
  {
    label: "Herstellungen",
    to: "/productions",
    adminOnly: true,
    items: [
      {
        label: "Neue Herstellung",
        modal: { name: "createProduction", props: {} },
      },
    ],
  },
  {
    label: "Zahlungen",
    to: "/payments",
    adminOnly: true,
    items: [
      { label: "Neue Zahlung", modal: { name: "createPayment", props: {} } },
      { label: "Zahlungsmethoden", to: "/payment-methods" },
      { label: "Zahlungsvorgänge", to: "/payment-processes" },
    ],
  },
  {
  label: "Berichte",
  adminOnly: true,
  items: [
    {
      label: "Umsatzbericht",
      to: "/reports/sales",
    },
  ],
},
  {
    label: "Kontakte",
    items: [
      { label: "Kunden", to: "/kunden" },
      { label: "Lieferanten", to: "/lieferanten" },
      {
        label: "Neuer Kunde",
        modal: { name: "createCustomer", props: { mode: "customer" } },
      },
      {
        label: "Neuer Lieferant",
        modal: { name: "createCustomer", props: { mode: "vendor" } },
      },
    ],
  },
  {
    label: "Einstellungen",
    to: "/settings",
    adminOnly: true,
  },
];

export default function HeaderApp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const company = useAppSelector(selectCompany);
  const currentUser = useAppSelector(selectUser);
  const isAdmin = currentUser?.role === "ADMIN";

  const [activeMenuLabel, setActiveMenuLabel] = useState<string | null>(null);

  const visibleMenus = headerMenus.filter((menu) => {
    if (menu.adminOnly && !isAdmin) return false;
    return true;
  });

  const activeMenu = visibleMenus.find(
    (menu) => menu.label === activeMenuLabel
  );

  const isMenuActive = (menu: HeaderMenu) => {
    if (menu.to && location.pathname === menu.to) {
      return true;
    }

    if (menu.to && menu.to !== "/" && location.pathname.startsWith(menu.to + "/")) {
      return true;
    }

    return menu.items?.some((item) => {
      if (!item.to) return false;

      return (
        location.pathname === item.to ||
        location.pathname.startsWith(item.to + "/")
      );
    });
  };

  const [submenuLeft, setSubmenuLeft] = useState(0);

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .finally(() => {
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
      });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOpenModal = (modalConfig: ModalConfig) => {
    const mode = modalConfig.props?.mode;

    const baseProps = {
      onClose: () => dispatch(closeModal()),
      onSubmitSuccess: () => {
        if (modalConfig.name === "createCustomer") {
          if (mode === "customer") {
            dispatch(getCustomersWithCustomerNumber({ page: 0, size: 15 }));
          }

          if (mode === "vendor") {
            dispatch(getCustomers({ page: 0, size: 15 }));
          }
        }
      },
    };

    dispatch(
      openModal({
        name: modalConfig.name,
        props: { ...baseProps, ...modalConfig.props },
      })
    );

    setActiveMenuLabel(null);
  };

  const handleMenuItemClick = (item: HeaderMenuItem) => {
    if (item.modal) {
      handleOpenModal(item.modal);
      return;
    }

    if (item.to) {
      navigate(item.to);
      setActiveMenuLabel(null);
    }
  };

  const menuItemSx = {
    color: "white",
    fontWeight: 600,
    textTransform: "uppercase",
    minHeight: 52,
    px: 3,
    borderBottom: `1px solid ${colors.border}`,
    transition: "background-color .2s ease, color .2s ease",

    "&:hover": {
      backgroundColor: menuHoverColor,
      color: headerTextColor,
    },
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: colors.white, boxShadow: 2 }}>
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          position: "relative",
        }}
      >
        {company?.logoUrl && (
          <Box
            component="img"
            src={`${import.meta.env.VITE_API_URL}${company.logoUrl}`}
            alt="Logo"
            sx={{
              height: 56,
              mr: 2,
            }}
          />
        )}

        <Box
          onMouseLeave={() => setActiveMenuLabel(null)}
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            height: 64,
            position: "relative",
          }}
        >
          {visibleMenus.map((menu) => {
            const isHoverActive = activeMenuLabel === menu.label;
            const isRouteActive = isMenuActive(menu);
            const isActive = isHoverActive || isRouteActive;

            return (
              <Box
                key={menu.label}
                sx={{ height: 64 }}
                onMouseEnter={(e) => {
                  if (menu.items?.length) {
                    setActiveMenuLabel(menu.label);

                    const parentLeft =
                      e.currentTarget.parentElement?.getBoundingClientRect().left ?? 0;

                    const itemLeft = e.currentTarget.getBoundingClientRect().left;

                    setSubmenuLeft(itemLeft - parentLeft);
                  } else {
                    setActiveMenuLabel(null);
                  }
                }}
              >
                <Button
                  onClick={() => {
                    if (!menu.items?.length && menu.to) {
                      navigate(menu.to);
                    }

                    if (menu.items?.length && menu.to) {
                      navigate(menu.to);
                    }
                  }}
                  sx={{
                    height: 64,
                    px: 2.5,
                    borderRadius: 0,
                    transition: "background-color 0.25s ease, color 0.25s ease",
                    color: isActive ? "white" : headerTextColor,
                    backgroundColor: isActive ? menuBgColor : "transparent",
                    fontWeight: 700,
                    textTransform: "uppercase",

                    "&:hover": {
                      backgroundColor: menuBgColor,
                      color: "white",
                    },

                    "&:focus": {
                      outline: "none",
                    },

                    "&.Mui-focusVisible": {
                      outline: "none",
                    },

                    "&:active": {
                      boxShadow: "none",
                    },
                  }}
                >
                  {menu.label}
                </Button>
              </Box>
            );
          })}

          {activeMenu?.items?.length && (
            <Box
              sx={{
                position: "absolute",
                top: 64,
                left: submenuLeft,

                backgroundColor: menuBgColor,

                boxShadow: 4,

                opacity: 1,
                transform: "translateY(0)",

                transition:
                  "opacity .2s ease, transform .2s ease",

                zIndex: 2000,
              }}
            >
              {activeMenu.to && (
                <MenuItem
                  onClick={() => {
                    navigate(activeMenu.to!);
                    setActiveMenuLabel(null);
                  }}
                  sx={menuItemSx}
                >
                  Übersicht
                </MenuItem>
              )}

              {activeMenu.items
                .filter((item) => !(item.adminOnly && !isAdmin))
                .map((item, index) => {
                  if (item.divider) {
                    return (
                      <Divider
                        key={`divider-${index}`}
                        sx={{
                          borderColor: colors.grey,
                          m: 0,
                        }}
                      />
                    );
                  }

                  return (
                    <MenuItem
                      key={item.label}
                      onClick={() => handleMenuItemClick(item)}
                      sx={menuItemSx}
                    >
                      {item.modal ? `+ ${item.label}` : item.label}
                    </MenuItem>
                  );
                })}
            </Box>
          )}
        </Box>

        <Button
          onClick={handleGoBack}
          sx={{
            fontSize: 12,
            minWidth: 50,
            minHeight: 40,
            color: headerTextColor,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 0.5,

            "&:hover": {
              backgroundColor: "transparent",
              color: menuBgColor,
            },
          }}
        >
          <KeyboardDoubleArrowLeftOutlinedIcon fontSize="large" />
          ZURÜCK
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          startIcon={<ExitToAppIcon fontSize="small" />}
          sx={{
            borderRadius: "4px",
            backgroundColor: colors.danger,

            "&:hover": {
              fontWeight: "bold",
              backgroundColor: "red",
            },
          }}
        >
          Exit
        </Button>
      </Toolbar>
    </AppBar>
  );
}