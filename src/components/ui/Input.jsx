export function Input({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5
          text-neutral-800 placeholder-neutral-400
          focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 outline-none transition
          disabled:bg-neutral-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
