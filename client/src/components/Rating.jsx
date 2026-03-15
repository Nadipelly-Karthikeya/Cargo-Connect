import { FaStar } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';
export const VerifiedBadge = ({ verified = false, size = 'md' }) => {
  if (!verified) return null

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-blue-500 text-white rounded-full`}
      title="Verified"
    >
      <FaCheck className="inline mb-1" />
    </span>
  )
}

export const RatingDisplay = ({ rating, count, size = 'md', showCount = true }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const StarRating = () => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
            } ${sizeClasses[size]}`}
          >
            <FaStar className="inline mb-1" />
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating />
      <span className={`font-medium text-gray-900 ${sizeClasses[size]}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && count && (
        <span className={`text-gray-500 ${sizeClasses[size]}`}>
          ({count})
        </span>
      )}
    </div>
  )
}

export const UserRatingCard = ({ user }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl font-bold text-primary-900">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
              <VerifiedBadge verified={user?.isVerified} />
            </div>
            <p className="text-sm text-gray-600 capitalize">{user?.role || 'User'}</p>
          </div>
        </div>
      </div>
      
      {user?.ratingCount > 0 && (
        <div className="border-t pt-3">
          <RatingDisplay 
            rating={parseFloat(user.ratingAverage) || 0} 
            count={user.ratingCount}
          />
        </div>
      )}
    </div>
  )
}
