import { useAppDispatch } from "../../../../redux/hooks";

import { deletePaymentProcess } from "../../paymentProcessesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeletePaymentProcessProps {
  processId: number;
  processName: string;
}

export default function DeletePaymentProcess({
  processId,
  processName,
}: DeletePaymentProcessProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deletePaymentProcess(processId)).unwrap();

      showSuccessToast(
        "Erfolg",
        "Der Zahlungsvorgang wurde erfolgreich gelöscht.",
      );
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen des Zahlungsvorgangs ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog onConfirm={handleDelete} buttonMinWidth={110}>
      Möchten Sie den Zahlungsvorgang <strong>{processName}</strong> wirklich
      löschen?
    </ConfirmDeleteDialog>
  );
}
