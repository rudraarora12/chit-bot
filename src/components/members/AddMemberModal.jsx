import { useState } from 'react';
import { memberService } from '@/services/memberService';
import './AddMemberModal.css';

const EMPTY_FORM = {
  name: '',
  id: '',
  phone: '',
  email: '',
  address: '',
  monthlyContribution: '',
};

export function AddMemberModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.id.trim()) errs.id = 'Member ID is required.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.monthlyContribution) errs.monthlyContribution = 'Monthly contribution is required.';
    else if (isNaN(Number(form.monthlyContribution)) || Number(form.monthlyContribution) <= 0)
      errs.monthlyContribution = 'Enter a valid amount.';
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (apiError) setApiError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const memberPayload = {
      name: form.name.trim(),
      memberId: form.id.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      monthlyContribution: Number(form.monthlyContribution),
    };

    try {
      setIsSubmitting(true);
      setApiError(null);
      const newMember = await memberService.createMember(memberPayload);

      onAdd(newMember);
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      console.error('Failed to create member:', err);
      setApiError(err.message || 'Failed to create member. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">Add New Member</h2>
          <button className="modal__close" onClick={onClose} type="button" aria-label="Close modal" disabled={isSubmitting}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {apiError && (
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#dc2626', fontSize: '0.875rem' }}>
            {apiError}
          </div>
        )}

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          <div className="modal__grid">
            <div className="modal__field">
              <label className="modal__label" htmlFor="name">Full Name <span aria-hidden="true">*</span></label>
              <input id="name" name="name" className={`modal__input${errors.name ? ' modal__input--error' : ''}`} type="text" value={form.name} onChange={handleChange} placeholder="e.g. Ravi Kumar" disabled={isSubmitting} />
              {errors.name && <p className="modal__error">{errors.name}</p>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="id">Member ID <span aria-hidden="true">*</span></label>
              <input id="id" name="id" className={`modal__input${errors.id ? ' modal__input--error' : ''}`} type="text" value={form.id} onChange={handleChange} placeholder="e.g. CL-011" disabled={isSubmitting} />
              {errors.id && <p className="modal__error">{errors.id}</p>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="phone">Phone Number <span aria-hidden="true">*</span></label>
              <input id="phone" name="phone" className={`modal__input${errors.phone ? ' modal__input--error' : ''}`} type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" disabled={isSubmitting} />
              {errors.phone && <p className="modal__error">{errors.phone}</p>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="email">Email <span aria-hidden="true">*</span></label>
              <input id="email" name="email" className={`modal__input${errors.email ? ' modal__input--error' : ''}`} type="email" value={form.email} onChange={handleChange} placeholder="member@email.com" disabled={isSubmitting} />
              {errors.email && <p className="modal__error">{errors.email}</p>}
            </div>

            <div className="modal__field modal__field--full">
              <label className="modal__label" htmlFor="address">Address</label>
              <input id="address" name="address" className="modal__input" type="text" value={form.address} onChange={handleChange} placeholder="Street, City, State, PIN" disabled={isSubmitting} />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="monthlyContribution">Monthly Contribution (₹) <span aria-hidden="true">*</span></label>
              <input id="monthlyContribution" name="monthlyContribution" className={`modal__input${errors.monthlyContribution ? ' modal__input--error' : ''}`} type="number" min="1" value={form.monthlyContribution} onChange={handleChange} placeholder="e.g. 8500" disabled={isSubmitting} />
              {errors.monthlyContribution && <p className="modal__error">{errors.monthlyContribution}</p>}
            </div>
          </div>

          <div className="modal__actions">
            <button className="modal__btn modal__btn--cancel" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="modal__btn modal__btn--submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
