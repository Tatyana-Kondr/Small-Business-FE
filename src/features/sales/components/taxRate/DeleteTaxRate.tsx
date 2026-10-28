import { useAppDispatch } from "../../../../redux/hooks";

import { deleteTaxRate } from "../../taxRatesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeleteTaxRateProps {
  taxRateId: number;
  value: number;
  defaultRate: boolean;
}

export default function DeleteTaxRate({
  taxRateId,
  value,
  defaultRate,
}: DeleteTaxRateProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    if (defaultRate) return;

    try {
      await dispatch(deleteTaxRate(taxRateId)).unwrap();

      showSuccessToast("Erfolg", "Der Steuersatz wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen des Steuersatzes ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog
      onConfirm={handleDelete}
      buttonMinWidth={110}
      disabled={defaultRate}
    >
      Möchten Sie den Steuersatz{" "}
      <strong>
        {value.toLocaleString("de-DE", {
          maximumFractionDigits: 2,
        })}{" "}
        %
      </strong>{" "}
      wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
