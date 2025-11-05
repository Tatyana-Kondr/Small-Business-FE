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
  Factory as FactoryIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { closeModal, openModal } from "../modal/modalSlice";
import { selectUser } from "../features/auth/authSlice";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 200;
const collapsedWidth = 60;
const headerHeight = 64;

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
    label: "Hertellungen",
    to: "/productions",
    icon: <FactoryIcon />,
    children: [
      {
        label: "Neue Herstellung",
        modal: {
          name: "createProduction",
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

export default function Sidebar({ mobileOpen, onDrawerToggle, onCollapseChange, }: { mobileOpen: boolean; onDrawerToggle: () => void; onCollapseChange?: (collapsed: boolean) => void; }) {

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

  const handleCollapseToggle = () => {
    setCollapsed((prev) => {
      const newVal = !prev;
      onCollapseChange?.(newVal);
      return newVal;
    });
  };

  return (
    <>
      {/* 📱 Мобильный Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedWidth : drawerWidth,
            boxSizing: "border-box",
            top: headerHeight,
            height: `calc(100vh - ${headerHeight}px)`,
          },
        }}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          openMenus={openMenus}
          handleCollapseToggle={handleCollapseToggle}
          handleParentClick={handleParentClick}
          handleOpenModal={handleOpenModal}
          isAdmin={isAdmin}
          location={location}
          navigate={navigate}
        />
      </Drawer>

      {/* 💻 Постоянный Drawer для десктопа */}
      <Drawer
        variant="permanent"
        sx={{
          position: "fixed", // ← фиксируем Sidebar
          zIndex: 1200,
          "& .MuiDrawer-paper": {
            position: "fixed", // ← чтобы сама бумага не влияла на layout
            top: headerHeight,
            height: `calc(100vh - ${headerHeight}px)`,
            width: collapsed ? collapsedWidth : drawerWidth,
            transition: "width 0.3s",
            boxSizing: "border-box",
            borderRight: "1px solid #e0e0e0",
          },
        }}
        open
      >
        <SidebarContent
          collapsed={collapsed}
          openMenus={openMenus}
          handleCollapseToggle={handleCollapseToggle}
          handleParentClick={handleParentClick}
          handleOpenModal={handleOpenModal}
          isAdmin={isAdmin}
          location={location}
          navigate={navigate}
        />
      </Drawer>
    </>
  );
}

function SidebarContent({
  collapsed,
  openMenus,
  handleCollapseToggle,
  handleParentClick,
  handleOpenModal,
  isAdmin,
  location,
  navigate,
}: any) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Collapse кнопка */}
      <Box
        sx={{
          position: "fixed", // ← фиксируем относительно окна
          top: headerHeight + 8, // ← чуть ниже хедера
          left: collapsed ? collapsedWidth  : drawerWidth , // ← на краю панели
          width: 20,
          height: 30,
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderLeft: "none",
          borderRadius: "0 6px 6px 0",
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1301, // чуть выше Drawer
          transition: "left 0.3s ease",
        }}

        onClick={handleCollapseToggle}
      >
        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </Box>

      <Divider />

      <List>
        {navItems.map(({ label, to, icon, children }) => {
          if (label === "Zahlungen" && !isAdmin) return null;
          if (label === "Hertellungen" && !isAdmin) return null;
          if (label === "Admin Settings" && !isAdmin) return null;

          const filteredChildren =
            label === "Home" && !isAdmin
              ? (children ?? []).filter((child) => child.label !== "Produktkategorien")
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
                    "& .MuiListItemIcon-root": { color: "#0097a7" },
                  },
                  "& .MuiListItemIcon-root": { color: isActive ? "#0097a7" : undefined },
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

                      const bulletIcon = isModal ? (
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
                            {bulletIcon}
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
    </Box>
  );
}
