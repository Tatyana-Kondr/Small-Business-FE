
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { modalRegistry } from "./modalRegistry";
import { closeModal } from "./modalSlice";


export const ModalManager = () => {
  const dispatch = useAppDispatch();
  const { name, props } = useAppSelector((state) => state.modal);

  if (!name) return null;

  const ModalComponent = modalRegistry[name];

  if (!ModalComponent) {
    console.warn(`Modal "${name}" not registered`);
    return null;
  }

  return (
    <ModalComponent
      {...props}
      open={true}
      onClose={() => dispatch(closeModal())}
    />
  );
};
