import * as Yup from "yup";
import { EMAIL_REGEX, IBAN_DE_REGEX, NAME_REGEX, PHONE_REGEX, VAT_REGEX } from "./regex";


export const companyValidationSchema = Yup.object().shape({
  name: Yup.string().matches(NAME_REGEX, "Ungültiger Name").required("Name ist erforderlich").min(3).max(100),
  address: Yup.string().required("Adresse ist erforderlich"),
  phone: Yup.string().matches(PHONE_REGEX, "Ungültige Telefonnummer").required("Telefon ist erforderlich"),
  email: Yup.string().matches(EMAIL_REGEX, "Ungültige E-Mail").required("E-Mail ist erforderlich"),
  bank: Yup.string().required("Bank ist erforderlich"),
  ibanNumber: Yup.string().matches(IBAN_DE_REGEX, "Ungültige IBAN").required("IBAN ist erforderlich"),
  bicNumber: Yup.string().min(8).max(11).required("BIC ist erforderlich"),
  vatId: Yup.string().matches(VAT_REGEX, "Ungültige USt-IdNr.").required("USt-IdNr. ist erforderlich"),
});
