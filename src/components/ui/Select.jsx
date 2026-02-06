export function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5
          text-neutral-800 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 outline-none transition
          disabled:bg-neutral-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) =>
          typeof opt === 'object' ? (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ) : (
            <option key={opt} value={opt}>
              {opt}
            </option>
          )
        )}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
