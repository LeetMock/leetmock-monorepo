export interface BillingFormErrors {
  fullName: string;
  email: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export const validateCardNumber = (cardNumber: string): boolean => {
  const cardRegex = /^\d{16}$/;
  return cardRegex.test(cardNumber.replace(/\s+/g, "")); // Removes any spaces
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  return expiryRegex.test(expiryDate);
};

export const validateCvv = (cvv: string): boolean => {
  const cvvRegex = /^\d{3,4}$/;
  return cvvRegex.test(cvv);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Main validation function
export const validateBillingForm = (
  fullName: string,
  email: string,
  cardNumber: string,
  expiryDate: string,
  cvv: string
): BillingFormErrors => {
  let errors: BillingFormErrors = {
    fullName: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  };

  let valid = true;

  if (!fullName) {
    errors.fullName = "Full name is required";
    valid = false;
  }

  if (!cardNumber || !validateCardNumber(cardNumber)) {
    errors.cardNumber = "Card number must be 16 digits";
    valid = false;
  }

  if (!expiryDate || !validateExpiryDate(expiryDate)) {
    errors.expiryDate = "Expiry date must be in MM/YY format";
    valid = false;
  }

  if (!cvv || !validateCvv(cvv)) {
    errors.cvv = "CVV must be 3 or 4 digits";
    valid = false;
  }

  if (!email || !validateEmail(email)) {
    errors.email = "A valid email is required";
    valid = false;
  }

  return errors;
};
