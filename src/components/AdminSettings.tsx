import {
  Box,
  Button,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getAllUsers } from "../features/auth/authSlice";
import UsersList from "../features/auth/components/UsersList";
import CompanyCard from "../features/company/components/CompanyCard";
import RegisterCompany from "../features/company/components/RegisterCompany";
import { getCompany, selectCompany } from "../features/company/companiesSlice";
import { getShippings } from "../features/sales/shippingsSlice";
import ShippingsList from "../features/sales/components/shipping/ShippingsList";
import UnitsList from "../features/products/components/unitOfMeasurement/UnitsList";
import { getUnits } from "../features/products/unitsOfMeasurementSlice";
import DocumentTypesList from "../features/purchases/documentTypes/DocumentTypesList";
import { getTermsOfPayment } from "../features/sales/termOfPaymentSlice";
import TermOfPaymentList from "../features/sales/components/termOfPayment/TermOfPaymentList";
import { getTaxRates } from "../features/sales/taxRatesSlice";
import TaxRatesList from "../features/sales/components/taxRate/TaxRatesList";
import { getDiscountRates } from "../features/sales/discountRatesSlice";
import DiscountRatesList from "../features/sales/components/discountRate/DiscountRatesList";
import { productCardTabsStyle } from "../styles/productCardStyles";

interface AdminSettingsProps {
  autoLogoutMinutes: number;
  setAutoLogoutMinutes: (minutes: number) => void;
}

export default function AdminSettings({
  autoLogoutMinutes,
  setAutoLogoutMinutes,
}: AdminSettingsProps) {
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState(0);
  const [minutes, setMinutes] = useState(autoLogoutMinutes);
  const company = useAppSelector(selectCompany);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCompany());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getShippings());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getUnits());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTermsOfPayment());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTaxRates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getDiscountRates());
  }, [dispatch]);

  // При монтировании синхронизируем состояние с App
  useEffect(() => {
    setMinutes(autoLogoutMinutes);
  }, [autoLogoutMinutes]);

  const handleSaveAutoLogout = () => {
    const parsed = Number(minutes);
    if (!isNaN(parsed) && parsed > 0) {
      setAutoLogoutMinutes(parsed);
      alert(`Auto-Logout timeout updated to ${parsed} minutes`);
    } else {
      alert("Введите корректное число минут (>0)");
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        minHeight: "calc(100vh - 96px)",
        boxSizing: "border-box",
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        sx={productCardTabsStyle}
      >
        <Tab label="Benutzer" />
        <Tab label="Versand" />
        <Tab label="Maßeinheit" />
        <Tab label="Dokumenttyp" />
        <Tab label="Zahlungsbedingungen" />
        <Tab label="Steuersätze" />
        <Tab label="Rabatte" />
        <Tab label="Unternehmen" />
        <Tab label="Einstellungen" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && (
          <Box>
            <UsersList />
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <ShippingsList />
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <UnitsList />
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <DocumentTypesList />
          </Box>
        )}

        {tab === 4 && (
          <Box>
            <TermOfPaymentList />
          </Box>
        )}

        {tab === 5 && (
          <Box>
            <TaxRatesList />
          </Box>
        )}

        {tab === 6 && (
          <Box>
            <DiscountRatesList />
          </Box>
        )}

        {tab === 7 && (
          <Box>
            {company && company.id ? <CompanyCard /> : <RegisterCompany />}
          </Box>
        )}

        {tab === 8 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Auto-Logout-Einstellungen (in Minuten)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Auto-Logout (Minuten)"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleSaveAutoLogout}>
                  Speichern
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
