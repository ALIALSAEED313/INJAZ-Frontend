import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createPaymentDetails,
  deletePaymentDetails,
  getPaymentDetails,
  updatePaymentDetails,
} from "../services/paymentDetailsService";

const initialForm = {
  accountHolderName: "",
  bankName: "",
  iban: "",
  swiftCode: "",
  country: "",
  currency: "BHD",
  paymentMethod: "Bank Transfer",
};

const currencyOptions = ["BHD", "USD", "EUR", "GBP", "SAR", "AED", "QAR", "JOD", "KWD", "OMR"];
const paymentMethodOptions = [
  "Bank Transfer",
  "Wire Transfer",
  "ACH",
  "SEPA",
  "Direct Deposit",
];

function validateForm(values) {
  const nextErrors = {};

  if (!values.accountHolderName?.trim()) {
    nextErrors.accountHolderName = "Account holder name is required.";
  }

  if (!values.bankName?.trim()) {
    nextErrors.bankName = "Bank name is required.";
  }

  if (!values.iban?.trim()) {
    nextErrors.iban = "IBAN is required.";
  } else if (!/^[A-Z]{2}[0-9A-Z]{11,30}$/.test(values.iban.replace(/\s+/g, "").toUpperCase())) {
    nextErrors.iban = "Please enter a valid IBAN.";
  }

  if (values.swiftCode && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(values.swiftCode.replace(/\s+/g, "").toUpperCase())) {
    nextErrors.swiftCode = "Please enter a valid SWIFT/BIC code.";
  }

  if (!values.country?.trim()) {
    nextErrors.country = "Country is required.";
  }

  if (!values.currency) {
    nextErrors.currency = "Currency is required.";
  }

  if (!values.paymentMethod) {
    nextErrors.paymentMethod = "Payment method is required.";
  }

  return nextErrors;
}

function PaymentDetailsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasPaymentDetails = useMemo(
    () => Boolean(paymentDetails && Object.keys(paymentDetails).length > 0),
    [paymentDetails],
  );

  useEffect(() => {
    async function fetchPaymentDetails() {
      if (!user || !user.isSeller) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPaymentDetails();
        setPaymentDetails(data);
        if (data) {
          setFormData({
            accountHolderName: data.accountHolderName || "",
            bankName: data.bankName || "",
            iban: "",
            swiftCode: data.swiftCode || "",
            country: data.country || "",
            currency: data.currency || "BHD",
            paymentMethod: data.paymentMethod || "Bank Transfer",
          });
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          setErrorMessage("Unable to load your payment settings right now.");
        }
        setPaymentDetails(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentDetails();
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        accountHolderName: formData.accountHolderName.trim(),
        bankName: formData.bankName.trim(),
        iban: formData.iban.replace(/\s+/g, "").toUpperCase(),
        swiftCode: formData.swiftCode.replace(/\s+/g, "").toUpperCase(),
        country: formData.country.trim(),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
      };

      let result;
      if (hasPaymentDetails && isEditing) {
        result = await updatePaymentDetails(payload);
      } else {
        result = await createPaymentDetails(payload);
      }

      setPaymentDetails(result);
      setSuccessMessage(
        hasPaymentDetails && isEditing
          ? "Payment details updated successfully."
          : "Payment details saved successfully.",
      );
      setIsEditing(false);
      setFormData({
        accountHolderName: result.accountHolderName || "",
        bankName: result.bankName || "",
        iban: "",
        swiftCode: result.swiftCode || "",
        country: result.country || "",
        currency: result.currency || "BHD",
        paymentMethod: result.paymentMethod || "Bank Transfer",
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Something went wrong while saving payment details.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await deletePaymentDetails();
      setPaymentDetails(null);
      setIsEditing(false);
      setFormData(initialForm);
      setShowDeleteModal(false);
      setSuccessMessage("Payment details deleted successfully.");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to delete payment details right now.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit() {
    setIsEditing(true);
    setErrorMessage("");
    setSuccessMessage("");
    setFormData({
      accountHolderName: paymentDetails?.accountHolderName || "",
      bankName: paymentDetails?.bankName || "",
      iban: "",
      swiftCode: paymentDetails?.swiftCode || "",
      country: paymentDetails?.country || "",
      currency: paymentDetails?.currency || "BHD",
      paymentMethod: paymentDetails?.paymentMethod || "Bank Transfer",
    });
  }

  if (!user || !user.isSeller) {
    return (
      <main className="payment-details-page">
        <div className="payment-details-shell">
          <div className="payment-empty-state large">
            <div className="payment-empty-icon">🔒</div>
            <h2>Access restricted</h2>
            <p>Only sellers can manage payment details for payouts.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-details-page">
      <div className="payment-details-shell">
        <header className="payment-details-header">
          <div>
            <span className="section-label">Seller payout</span>
            <h1>Payment Details</h1>
          </div>
          {hasPaymentDetails && !isEditing && (
            <button type="button" className="primary-btn" onClick={handleEdit}>
              Edit details
            </button>
          )}
        </header>

        {successMessage && <div className="form-success-banner">{successMessage}</div>}
        {errorMessage && <div className="form-error-banner">{errorMessage}</div>}

        {!hasPaymentDetails && !isEditing && !isLoading ? (
          <div className="payment-empty-state">
            <div className="payment-empty-icon">💳</div>
            <h2>No payment details yet</h2>
            <p>Add your bank details to receive payouts when your services are completed.</p>
            <button type="button" className="primary-btn" onClick={() => setIsEditing(true)}>
              Add payment details
            </button>
          </div>
        ) : (
          <div className="payment-details-grid">
            <section className="payment-details-panel form-panel">
              <div className="panel-head">
                <h2>{hasPaymentDetails && !isEditing ? "Payment information" : "Add payment information"}</h2>
              </div>

              <form onSubmit={handleSubmit} className="payment-form">
                <div className="field-row two-col">
                  <label>
                    <span>Account Holder Name</span>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className={errors.accountHolderName ? "input-error" : ""}
                    />
                    {errors.accountHolderName && <small>{errors.accountHolderName}</small>}
                  </label>

                  <label>
                    <span>Bank Name</span>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Bank of Bahrain"
                      className={errors.bankName ? "input-error" : ""}
                    />
                    {errors.bankName && <small>{errors.bankName}</small>}
                  </label>
                </div>

                <div className="field-row two-col">
                  <label>
                    <span>IBAN</span>
                    <input
                      type="text"
                      name="iban"
                      value={formData.iban}
                      onChange={handleChange}
                      placeholder="BH29BDCC00001234567891"
                      className={errors.iban ? "input-error" : ""}
                    />
                    {errors.iban && <small>{errors.iban}</small>}
                  </label>

                  <label>
                    <span>SWIFT/BIC Code</span>
                    <input
                      type="text"
                      name="swiftCode"
                      value={formData.swiftCode}
                      onChange={handleChange}
                      placeholder="BBAH BH 22"
                      className={errors.swiftCode ? "input-error" : ""}
                    />
                    {errors.swiftCode && <small>{errors.swiftCode}</small>}
                  </label>
                </div>

                <div className="field-row two-col">
                  <label>
                    <span>Country</span>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Bahrain"
                      className={errors.country ? "input-error" : ""}
                    />
                    {errors.country && <small>{errors.country}</small>}
                  </label>

                  <label>
                    <span>Currency</span>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className={errors.currency ? "input-error" : ""}
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                    {errors.currency && <small>{errors.currency}</small>}
                  </label>
                </div>

                <div className="field-row single-col">
                  <label>
                    <span>Payment Method</span>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className={errors.paymentMethod ? "input-error" : ""}
                    >
                      {paymentMethodOptions.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                    {errors.paymentMethod && <small>{errors.paymentMethod}</small>}
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-btn" disabled={isSaving}>
                    {isSaving ? "Saving..." : hasPaymentDetails && isEditing ? "Update details" : "Save details"}
                  </button>
                  {hasPaymentDetails && !isEditing && (
                    <button type="button" className="secondary-btn danger-btn" onClick={() => setShowDeleteModal(true)}>
                      Delete
                    </button>
                  )}
                  {hasPaymentDetails && isEditing && (
                    <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {hasPaymentDetails && !isEditing && (
              <aside className="payment-details-panel summary-panel">
                <div className="panel-head">
                  <h2>Saved payout details</h2>
                </div>

                <div className="summary-card payment-summary-card">
                  <div className="summary-row">
                    <span className="summary-label">Account holder</span>
                    <strong>{paymentDetails.accountHolderName}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Bank</span>
                    <strong>{paymentDetails.bankName}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">IBAN</span>
                    <strong>{paymentDetails.maskedIban || paymentDetails.iban}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">SWIFT/BIC</span>
                    <strong>{paymentDetails.swiftCode || "Not provided"}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Country</span>
                    <strong>{paymentDetails.country}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Currency</span>
                    <strong>{paymentDetails.currency}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Method</span>
                    <strong>{paymentDetails.paymentMethod}</strong>
                  </div>
                </div>

                <div className="summary-actions">
                  <button type="button" className="secondary-btn" onClick={handleEdit}>
                    Edit
                  </button>
                  <button type="button" className="danger-btn secondary-btn" onClick={() => setShowDeleteModal(true)}>
                    Delete
                  </button>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="delete-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Delete payment details?</h3>
            <p>This will remove your saved payout information and you will need to add it again before receiving payouts.</p>
            <div className="delete-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button type="button" className="danger-btn secondary-btn" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PaymentDetailsPage;
