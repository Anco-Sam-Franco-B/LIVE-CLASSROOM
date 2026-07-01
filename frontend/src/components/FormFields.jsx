import { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

function FieldError({ error }) {
  if (!error) return null;
  return (
    <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#ff3232' }}>
      <AlertCircle size={12} />
      {error}
    </p>
  );
}

function FieldHelp({ helpText }) {
  if (!helpText) return null;
  return <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>{helpText}</p>;
}

function FieldLabel({ label, required, className = '' }) {
  if (!label) return null;
  return (
    <label className={`block text-sm font-medium mb-1.5 ${className}`} style={{ color: 'var(--text-secondary)' }}>
      {label}{required && <span style={{ color: '#ff3232' }} className="ml-0.5">*</span>}
    </label>
  );
}

export const Input = forwardRef(({
  label, error, helpText, required, className = '', wrapperClass = '', ...props
}, ref) => {
  return (
    <div className={wrapperClass}>
      <FieldLabel label={label} required={required} />
      <input
        ref={ref}
        className={`neon-input ${error ? 'input-error' : ''} ${className}`}
        required={required}
        {...props}
      />
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
});
Input.displayName = 'Input';

export const InputGroup = forwardRef(({
  label, error, helpText, required, className = '', wrapperClass = '', leftIcon, rightIcon, type, ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={wrapperClass}>
      <FieldLabel label={label} required={required} />
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={actualType}
          className={`neon-input ${error ? 'input-error' : ''} ${leftIcon ? 'pl-10' : ''} ${(rightIcon || isPassword) ? 'pr-10' : ''} ${className}`}
          required={required}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors" style={{ color: 'var(--text-muted)' }} tabIndex={-1}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {rightIcon && !isPassword && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
            {rightIcon}
          </div>
        )}
      </div>
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
});
InputGroup.displayName = 'InputGroup';

export const Select = forwardRef(({
  label, error, helpText, required, className = '', wrapperClass = '', children, placeholder, ...props
}, ref) => {
  return (
    <div className={wrapperClass}>
      <FieldLabel label={label} required={required} />
      <select
        ref={ref}
        className={`neon-input ${error ? 'input-error' : ''} ${className}`}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
});
Select.displayName = 'Select';

export const Textarea = forwardRef(({
  label, error, helpText, required, className = '', wrapperClass = '', rows = 3, ...props
}, ref) => {
  return (
    <div className={wrapperClass}>
      <FieldLabel label={label} required={required} />
      <textarea
        ref={ref}
        className={`neon-input ${error ? 'input-error' : ''} ${className}`}
        rows={rows}
        required={required}
        {...props}
      />
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
});
Textarea.displayName = 'Textarea';

export function Toggle({ label, error, helpText, required, checked, onChange, disabled, wrapperClass = '', ...props }) {
  return (
    <div className={wrapperClass}>
      <label className="relative inline-flex items-center cursor-pointer gap-3">
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" {...props} />
        <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--neon)] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: checked ? 'var(--neon)' : 'var(--bg-card-hover)' }} />
        {label && <span className="text-sm font-medium select-none" style={{ color: 'var(--text-secondary)' }}>{label}{required && <span style={{ color: '#ff3232' }} className="ml-0.5">*</span>}</span>}
      </label>
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
}

export function Checkbox({ label, error, helpText, required, checked, onChange, disabled, wrapperClass = '', ...props }) {
  return (
    <div className={wrapperClass}>
      <label className="relative inline-flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled}
          className="w-4 h-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ accentColor: 'var(--neon)' }} {...props} />
        {label && <span className="text-sm select-none" style={{ color: 'var(--text-secondary)' }}>{label}{required && <span style={{ color: '#ff3232' }} className="ml-0.5">*</span>}</span>}
      </label>
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
}

export function ColorPicker({ label, error, helpText, required, value, onChange, disabled, wrapperClass = '', className = '', ...props }) {
  return (
    <div className={wrapperClass}>
      <FieldLabel label={label} required={required} />
      <div className="flex items-center gap-3">
        <div className="relative">
          <input type="color" value={value || '#00ff41'} onChange={onChange} disabled={disabled} className="h-10 w-14 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ border: '1px solid var(--border-neon)', background: 'var(--bg-dark-secondary)' }} {...props} />
        </div>
        <input type="text" value={value || ''} onChange={onChange} disabled={disabled} className={`neon-input flex-1 font-mono text-sm ${className}`} {...props} />
      </div>
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
}

export function FieldSet({ label, required, error, helpText, children, className = '' }) {
  return (
    <div className={className}>
      <FieldLabel label={label} required={required} />
      {children}
      <FieldError error={error} />
      <FieldHelp helpText={helpText} />
    </div>
  );
}
