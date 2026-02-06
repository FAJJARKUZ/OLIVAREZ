const variants = {
  primary:
    'bg-olive-600 text-white hover:bg-olive-700 focus:ring-olive-500',
  secondary:
    'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus:ring-neutral-400',
  outline:
    'border-2 border-olive-500 text-olive-600 hover:bg-olive-50 focus:ring-olive-500',
  ghost: 'text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
        font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] ?? variants.primary}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
