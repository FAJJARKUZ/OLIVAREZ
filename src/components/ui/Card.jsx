export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm border border-gray-200 p-6 transition-shadow hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={`text-lg font-semibold text-gray-800 mb-4 ${className}`}>
      {children}
    </h2>
  )
}
