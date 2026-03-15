export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-primary-100 text-primary-800',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const LoadStatusBadge = ({ status }) => {
  const statusConfig = {
    Posted: { variant: 'info', text: 'Posted' },
    Approved: { variant: 'success', text: 'Approved' },
    Accepted: { variant: 'primary', text: 'Accepted' },
    'Reached Pickup': { variant: 'warning', text: 'Reached Pickup' },
    'On Route': { variant: 'warning', text: 'On Route' },
    Delivered: { variant: 'success', text: 'Delivered' },
    Completed: { variant: 'success', text: 'Completed' },
    Cancelled: { variant: 'danger', text: 'Cancelled' },
  }

  const config = statusConfig[status] || { variant: 'info', text: status }

  return <Badge variant={config.variant}>{config.text}</Badge>
}
