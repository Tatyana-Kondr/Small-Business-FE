import type { ReactNode } from "react";
import dayjs from "dayjs";

import { useAppDispatch } from "../../../redux/hooks";
import { deletePayment } from "../paymentsSlice";

import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";
import { formatNumber } from "../../../utils/formatNumber";

import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

interface DeletePaymentProps {
  paymentId: number;
  customerName: string;
  amount: number;
  paymentDate: string;
  onSuccessDelete?: () => void;
  trigger?: ReactNode;
}

export default function DeletePayment({
  paymentId,
  customerName,
  amount,
  paymentDate,
  onSuccessDelete,
  trigger,
}: DeletePaymentProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deletePayment(paymentId)).unwrap();

      showSuccessToast("Erfolg", "Die Zahlung wurde erfolgreich gelöscht.");

      onSuccessDelete?.();
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen der Zahlung.");

      throw error;
    }
  };

  const formattedDate = dayjs(paymentDate).isValid()
    ? dayjs(paymentDate).format("DD.MM.YYYY")
    : paymentDate;

  return (
    <ConfirmDeleteDialog trigger={trigger} onConfirm={handleDelete}>
      Möchten Sie die Zahlung Nr. <strong>{paymentId}</strong> von{" "}
      <strong>{customerName}</strong> vom <strong>{formattedDate}</strong> in
      Höhe von <strong>{formatNumber(amount)} €</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
