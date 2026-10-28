import { useAppDispatch } from "../../../../redux/hooks";

import { deleteDiscountRate } from "../../discountRatesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeleteDiscountRateProps {
  discountRateId: number;
  value: number;
}

export default function DeleteDiscountRate({
  discountRateId,
  value,
}: DeleteDiscountRateProps) {
  const dispatch = useAppDispatch();

  const isZeroRate = value === 0;

  const handleDelete = async () => {
    if (isZeroRate) return;

    try {
      await dispatch(deleteDiscountRate(discountRateId)).unwrap();

      showSuccessToast("Erfolg", "Der Rabattsatz wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen des Rabattsatzes ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog
      onConfirm={handleDelete}
      buttonMinWidth={110}
      disabled={isZeroRate}
    >
      Möchten Sie den Rabattsatz{" "}
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
