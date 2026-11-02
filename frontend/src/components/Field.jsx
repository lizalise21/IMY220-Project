// A label + input/textarea/select. Clicking the label focuses the input.
export default function Field({ id, label, as: Tag = 'input', error, hint, className = '', ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">{label}</label>
      <Tag
        id={id}
        className={`input ${error ? '!border-danger' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {error && <p className="mt-1 text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}