import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './FormElements'

export const RatingModal = ({ isOpen, onClose, onSubmit, recipientName, recipientType }) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ stars: rating, comment })
      onClose()
      // Reset form
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert(error.response?.data?.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              className={`w-12 h-12 ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rate ${recipientType}`}>
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-700 mb-2">
            How was your experience with <span className="font-semibold">{recipientName}</span>?
          </p>
          <p className="text-sm text-gray-500">
            Your rating helps build trust in the community
          </p>
        </div>

        {renderStars()}

        {rating > 0 && (
          <div className="text-center text-sm font-medium text-gray-700 mb-2">
            {rating === 1 && '⭐ Poor'}
            {rating === 2 && '⭐⭐ Below Average'}
            {rating === 3 && '⭐⭐⭐ Average'}
            {rating === 4 && '⭐⭐⭐⭐ Good'}
            {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default RatingModal
