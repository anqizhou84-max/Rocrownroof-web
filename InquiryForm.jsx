import { useState } from "react";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  product: "",
  message: "",
  website: "",
};

const validators = {
  name: (value) => value.trim().length > 1,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/.test(value),
};

export default function InquiryForm({
  endpoint = "/api/inquiries",
  onSuccess,
}) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const errors = Object.fromEntries(
    Object.entries(validators).map(([name, validate]) => [
      name,
      touched[name] && !validate(values[name]),
    ])
  );

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function markTouched(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  function validateForm() {
    const nextTouched = { name: true, email: true, phone: true };
    setTouched((current) => ({ ...current, ...nextTouched }));
    return Object.entries(validators).every(([name, validate]) =>
      validate(values[name])
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (values.website) {
      setStatus({ type: "error", message: "Submission blocked. Please try again." });
      return;
    }

    if (!validateForm()) {
      setStatus({
        type: "error",
        message: "Please complete all required fields before submitting.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Submission failed");

      setValues(initialValues);
      setTouched({});
      setStatus({
        type: "success",
        message: "Submitted successfully. We will reply within 24 hours.",
      });
      onSuccess?.(values);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Submission failed. Please email sales@cnrocrown.com or try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="b2b-inquiry-form" onSubmit={handleSubmit} noValidate>
      <div className={`form-status ${status.type}`} role="status" aria-live="polite">
        {status.message}
      </div>

      <Field label="Name" required error={errors.name} hint="Please enter your name.">
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={values.name}
          onChange={updateField}
          onBlur={markTouched}
          required
        />
      </Field>

      <Field label="Email" required error={errors.email} hint="Please enter a valid business email address.">
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={values.email}
          onChange={updateField}
          onBlur={markTouched}
          required
        />
      </Field>

      <Field label="Phone / WhatsApp" required error={errors.phone} hint="Please enter a valid international phone number.">
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+971 50 123 4567"
          value={values.phone}
          onChange={updateField}
          onBlur={markTouched}
          required
        />
      </Field>

      <Field label="Company Name" hint="Optional. Helps us understand your purchasing background.">
        <input
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="Company or project name"
          value={values.company}
          onChange={updateField}
        />
      </Field>

      <Field label="Country / Region" hint="Optional. Helps with export packing and shipping terms.">
        <input
          name="country"
          type="text"
          autoComplete="country-name"
          placeholder="UAE, Saudi Arabia, Nigeria..."
          value={values.country}
          onChange={updateField}
        />
      </Field>

      <Field label="Product Requirement" hint="Optional. Choose the closest product category.">
        <select name="product" value={values.product} onChange={updateField}>
          <option value="">Select a product if known</option>
          <option>ASA Synthetic Resin Roof Tile</option>
          <option>PVC Roof Sheet</option>
          <option>Aluminium Sandwich Panel</option>
          <option>UPVC Hollow Roof Sheet</option>
          <option>Clear Transparent Roof Sheet</option>
          <option>Not sure, need recommendation</option>
        </select>
      </Field>

      <Field className="full-field" label="Message" hint="Optional. More project details help us quote accurately.">
        <textarea
          name="message"
          placeholder="Tell us roof area, color, thickness, quantity, target port, project climate or installation requirements."
          value={values.message}
          onChange={updateField}
        />
      </Field>

      <label className="hp-field" aria-hidden="true">
        <span>Website</span>
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={updateField}
        />
      </label>

      <button className="inquiry-submit" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Inquiry →"}
      </button>

      <p className="form-privacy">
        Your inquiry will be used only for quotation and project communication.
      </p>
    </form>
  );
}

function Field({ label, required, error, hint, className = "", children }) {
  return (
    <label className={`${className} ${error ? "is-invalid" : ""}`.trim()}>
      <span>
        {label} {required && <strong>*</strong>}
      </span>
      {children}
      <small>{hint}</small>
    </label>
  );
}
