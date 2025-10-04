import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import ListItemButton from '@mui/material/ListItemButton';
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import {
  Home as HomeIcon,
  Payments as PaymentsIcon,
  People as PeopleIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { closeModal, openModal } from "../modal/modalSlice";
import { selectUser } from "../features/auth/authSlice";
import SettingsIcon from "@mui/icons-material/Settings";



const drawerWidth = 200;
const collapsedWidth = 60;

type ModalConfig = {
  name: string;
  props?: Record<string, any>;
};

type NavItemChild = {
  label: string;
  to?: string;
  modal?: ModalConfig;
};

type NavItem = {
  label: string;
  to?: string;
  icon: React.ReactNode;
  children?: NavItemChild[];
};

const navItems: NavItem[] = [
  {
    label: "Home",
    to: "/",
    icon: <HomeIcon />,
    children: [
      {
        label: "Neues Produkt",
        modal: {
          name: "createProduct",
          props: {},
        },
      },
      { label: "Produktkategorien", to: "/product-categories" },
    ],
  },
  {
    label: "Aufträge",
    to: "/sales",
    icon: <RequestPageIcon />,
    children: [
      {
        label: "Neuer Auftrag",
        modal: {
          name: "createSale",
          props: {},
        },
      },
    ],
  },
  {
    label: "Bestellungen",
    to: "/purchases",
    icon: <ReceiptIcon />,
    children: [
      {
        label: "Neue Bestellung",
        modal: {
          name: "createPurchase",
          props: {},
        },
      },
    ],
  },
  {
    label: "Zahlungen",
    to: "/payments",
    icon: <PaymentsIcon />,
    children: [
      {
        label: "Neue Zahlung",
        modal: {
          name: "createPayment",
          props: {},
        },
      },
      { label: "Zahlungsmethoden", to: "/payment-methods" },
      { label: "Zahlungsvorgänge", to: "/payment-processes" },
    ],
  },
  {
    label: "Kunden",
    to: "/kunden",
    icon: <PeopleIcon />,
    children: [
      {
        label: "Neuen Kunde",
        modal: {
          name: "createCustomer",
          props: {},
        },
      },
    ],
  },
  {
    label: "Lieferanten",
    to: "/lieferanten",
    icon: <GroupsIcon />,
    children: [
      {
        label: "Neuen Lieferant",
        modal: {
          name: "createCustomer",
          props: {},
        },
      },
    ],
  },
  {
    label: "Admin Settings",
    to: "/settings",
    icon: <SettingsIcon />,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    const initialOpenMenus: { [key: string]: boolean } = {};

    navItems.forEach(({ label, children }) => {
      if (children) {
        const isChildActive = children.some(
          (child) =>
            child.to &&
            (location.pathname === child.to || location.pathname.startsWith(child.to + "/"))
        );

        if (isChildActive) {
          initialOpenMenus[label] = true;
        }
      }
    });

    setOpenMenus(initialOpenMenus);
  }, []);

  const handleParentClick = (label: string, to?: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));

    if (to) {
      navigate(to);
    }
  };

  const handleOpenModal = (modalConfig: ModalConfig) => {
    const baseProps = {
      onClose: () => dispatch(closeModal()),
      onSubmitSuccess: () => {
        console.log(`✅ ${modalConfig.name} erfolgreich erstellt.`);
      },
    };

    dispatch(openModal({
      name: modalConfig.name,
      props: { ...baseProps, ...modalConfig.props },
    }));
  };


  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        mt: 8,
        [`& .MuiDrawer-paper`]: {
          mt: 8,
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          overflow: "visible",
          transition: "width 0.3s",
        },
      }}
    >
      {/* Collapse кнопка */}
      <Box
        sx={{
          position: "absolute",
          top: 9,
          right: -22,
          width: 20,
          height: 30,
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderLeft: "none",
          borderRadius: "0 6px 6px 0",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
      </Box>

      <Divider />

      <List>
        {navItems.map(({ label, to, icon, children }) => {
          // Скрываем раздел "Zahlungen" для не-админов
          if (label === "Zahlungen" && !isAdmin) return null;

           // скрываем Admin Settings для не-админов
          if (label === "Admin Settings" && !isAdmin) return null;

          // Скрываем "Produktkategorien" внутри Home для не-админов
           const filteredChildren =
            label === "Home" && !isAdmin
              ? (children ?? []).filter(
                  (child) => child.label !== "Produktkategorien"
                )
              : children ?? [];

          
          const isOpen = openMenus[label];
          const hasChildren = !!children?.length;

          const isActive =
            to
              ? to === "/"
                ? location.pathname === "/"
                : location.pathname === to || location.pathname.startsWith(to + "/")
              : false;

          return (
            <Box key={label}>
              <ListItemButton
                onClick={() => handleParentClick(label, to)}
                selected={isActive}
                sx={{
                  justifyContent: collapsed ? "center" : "initial",
                  color: isActive ? "#0097a7" : undefined,
                  backgroundColor: isActive
                    ? (theme) => theme.palette.action.selected
                    : undefined,
                  "&:hover": {
                    color: "#0097a7",
                    backgroundColor: (theme) => theme.palette.action.hover,
                    "& .MuiListItemIcon-root": {
                      color: "#0097a7",
                    },
                  },
                  "& .MuiListItemIcon-root": {
                    color: isActive ? "#0097a7" : undefined,
                  },
                }}
              >
                <Tooltip title={collapsed ? label : ""} placement="right">
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                      {icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText primary={label} sx={{ pl: 2 }} />
                        {hasChildren &&
                          (isOpen ? (
                            <ExpandLess fontSize="small" />
                          ) : (
                            <ExpandMore fontSize="small" />
                          ))}
                      </>
                    )}
                  </Box>
                </Tooltip>
              </ListItemButton>

              {hasChildren && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {filteredChildren.map((child) => {
                      const isLink = !!child.to;
                      const isModal = !!child.modal;

                      const isChildActive = child.to
                        ? location.pathname === child.to
                        : false;

                      const handleClick = () => {
                        if (isModal && child.modal) {
                          handleOpenModal(child.modal);
                        } else if (isLink && child.to) {
                          navigate(child.to);
                        }
                      };

                      const icon = isModal ? (
                        <Box
                          sx={{
                            fontWeight: "bold",
                            fontSize: 16,
                            width: 16,
                            textAlign: "center",
                            userSelect: "none",
                          }}
                        >
                          +
                        </Box>
                      ) : isLink ? (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: isChildActive ? "#0097a7" : "currentColor",
                            userSelect: "none",
                          }}
                        />
                      ) : null;

                      return (
                        <Tooltip
                          key={child.label}
                          title={collapsed ? child.label : ""}
                          placement="right"
                        >
                          <ListItemButton
                            onClick={handleClick}
                            sx={{
                              pl: collapsed ? 2 : 6,
                              minHeight: 36,
                              gap: 1,
                              justifyContent: collapsed ? "center" : "initial",
                              color: isChildActive ? "#0097a7" : undefined,
                              backgroundColor: isChildActive
                                ? (theme) => theme.palette.action.selected
                                : undefined,
                              "&:hover": {
                                color: "#0097a7",
                                backgroundColor: (theme) =>
                                  theme.palette.action.hover,
                              },
                            }}
                          >
                            {icon}
                            {!collapsed && (
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{ fontSize: "0.9rem" }}
                              />
                            )}
                          </ListItemButton>
                        </Tooltip>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}