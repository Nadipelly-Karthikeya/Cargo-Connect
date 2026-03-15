import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LoadStatusBadge } from '../../components/Badge'
import { Button, Input } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { PageLoader } from '../../components/Loader'
import { VerifiedBadge, RatingDisplay } from '../../components/Rating'
import { RatingModal } from '../../components/RatingModal'
import { calculateETA, getETAStatusColor } from '../../utils/calculations'
import { loadAPI, ratingAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'

const LoadDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [load, setLoad] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentFile, setPaymentFile] = useState(null)
  const [uploadingPayment, setUploadingPayment] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [canRate, setCanRate] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  useEffect(() => {
    fetchLoadDetails()
    checkRatingStatus()
  }, [id])

  const fetchLoadDetails = async () => {
    try {
      const response = await loadAPI.getLoadById(id)
      // API returns { success, load }
      const loadData = response.data.load || response.data
      setLoad(loadData)
      
      // Auto-show rating modal for completed loads that haven't been rated
      if (loadData.status === 'Completed' && !hasRated) {
        setTimeout(() => setShowRatingModal(true), 1000)
      }
    } catch (error) {
      console.error('Failed to fetch load details:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkRatingStatus = async () => {
    try {
      const response = await ratingAPI.canRate(id)
      setCanRate(response.data.canRate)
      setHasRated(!response.data.canRate && response.data.alreadyRated)
    } catch (error) {
      console.error('Failed to check rating status:', error)
    }
  }

  const handleRatingSubmit = async (ratingData) => {
    try {
      await ratingAPI.createRating({
        ...ratingData,
        toUserId: load.lorryOwner._id,
        loadId: id
      })
      setHasRated(true)
      setCanRate(false)
      alert('Thank you for your rating!')
    } catch (error) {
      throw error
    }
  }

  const handlePaymentUpload = async () => {
    if (!paymentFile) return

    setUploadingPayment(true)
    try {
      await loadAPI.uploadPayment(id, { paymentProof: paymentFile })
      setShowPaymentModal(false)
      fetchLoadDetails()
    } catch (error) {
      console.error('Failed to upload payment:', error)
    } finally {
      setUploadingPayment(false)
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const response = await loadAPI.downloadInvoice(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to download invoice:', error)
    }
  }

  const handleRepeatLoad = () => {
    // Navigate to CreateLoad with pre-filled data
    const repeatData = {
      pickupLocation: load.pickupLocation,
      dropLocation: load.dropLocation,
      goodsType: load.goodsType,
      weight: load.weight,
      requiredVehicleType: load.requiredVehicleType,
      distance: load.distance,
      specialInstructions: load.specialInstructions || '',
      pickupDate: new Date().toISOString().split('T')[0], // Today's date
    }
    navigate('/company/create-load', { state: { repeatData } })
  }

  if (loading) return <PageLoader />
  if (!load) return <div className="text-center py-12">Load not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Load Details</h1>
          <p className="text-gray-600 mt-1">#{load._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex gap-3">
          {(load.status === 'Delivered' || load.status === 'Completed') && (
            <>
              <Button variant="secondary" onClick={handleDownloadInvoice}>
                Download Invoice
              </Button>
              {user?.role === 'company' && (
                <Button onClick={handleRepeatLoad}>
                  Repeat Load
                </Button>
              )}
              {canRate && load.lorryOwner && user?.role === 'company' && (
                <Button onClick={() => setShowRatingModal(true)} className="bg-yellow-500 hover:bg-yellow-600">
                  Rate Transporter
                </Button>
              )}
            </>
          )}
          {load.status === 'accepted' && !load.paymentVerified && user?.role === 'company' && (
            <Button onClick={() => setShowPaymentModal(true)}>Upload Payment</Button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Status</h2>
            <LoadStatusBadge status={load.status} size="lg" />
          </div>
          {/* Show Company Info for Lorry Owners */}
          {user?.role === 'lorry' && load.companyId && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Company</p>
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="text-lg font-semibold text-gray-900">{load.companyId.name}</p>
                <VerifiedBadge verified={load.companyId.isVerified} size="md" />
              </div>
              <p className="text-sm text-gray-600">{load.companyId.phone}</p>
              {load.companyId.ratingAverage > 0 && (
                <div className="mt-2 flex justify-end">
                  <RatingDisplay 
                    rating={parseFloat(load.companyId.ratingAverage)} 
                    count={load.companyId.ratingCount}
                    size="sm"
                  />
                </div>
              )}
            </div>
          )}
          {/* Show Lorry Owner Info for Companies */}
          {user?.role === 'company' && load.lorryOwner && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Assigned to</p>
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="text-lg font-semibold text-gray-900">{load.lorryOwner.name}</p>
                <VerifiedBadge verified={load.lorryOwner.isVerified} size="md" />
              </div>
              <p className="text-sm text-gray-600">{load.lorryOwner.phone}</p>
              {load.lorryOwner.ratingAverage > 0 && (
                <div className="mt-2 flex justify-end">
                  <RatingDisplay 
                    rating={parseFloat(load.lorryOwner.ratingAverage)} 
                    count={load.lorryOwner.ratingCount}
                    size="sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ETA Section - Show for active loads */}
      {(load.status === 'Accepted' || load.status === 'Picked Up' || load.status === 'In Transit') && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Estimated Arrival</h3>
                <p className="text-sm text-gray-600">
                  {(() => {
                    const eta = calculateETA(
                      load.distance,
                      load.pickupLocation.city,
                      load.dropLocation.city,
                      load.status,
                      load.pickupDate,
                      0 // Mock progress, can be updated with real tracking
                    )
                    return (
                      <>
                        <span className="font-medium">{eta.formattedETA}</span>
                        <span className={`ml-2 ${getETAStatusColor(eta.status)}`}>• {eta.countdown}</span>
                      </>
                    )
                  })()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Distance Remaining</p>
              <p className="text-2xl font-bold text-gray-900">{load.distance} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Load Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Load Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Load Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Goods Type:</span>
              <p className="font-medium text-gray-900">{load.goodsType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Weight:</span>
              <p className="font-medium text-gray-900">{load.weight} tons</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Vehicle Type:</span>
              <p className="font-medium text-gray-900 capitalize">{load.requiredVehicleType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Distance:</span>
              <p className="font-medium text-gray-900">{load.distance} km</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Estimated Cost:</span>
              <p className="font-medium text-gray-900">₹{load.estimatedCost.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Pickup Date:</span>
              <p className="font-medium text-gray-900">
                {new Date(load.pickupDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Payment Status:</span>
              <p className="font-medium">
                {load.paymentVerified ? (
                  <span className="text-green-700">Verified</span>
                ) : load.paymentProof ? (
                  <span className="text-yellow-700">Under Verification</span>
                ) : (
                  <span className="text-red-700">Payment Pending</span>
                )}
              </p>
            </div>
            {load.paymentProof && (
              <div>
                <span className="text-sm text-gray-600">Payment Proof:</span>
                <a
                  href={load.paymentProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-800 hover:underline block"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pickup Location</h2>
          <div className="space-y-1 text-gray-700">
            <p>{load.pickupLocation.address}</p>
            <p>{load.pickupLocation.city}, {load.pickupLocation.state}</p>
            <p>{load.pickupLocation.pincode}</p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Drop Location</h2>
          <div className="space-y-1 text-gray-700">
            <p>{load.dropLocation.address}</p>
            <p>{load.dropLocation.city}, {load.dropLocation.state}</p>
            <p>{load.dropLocation.pincode}</p>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {load.specialInstructions && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Instructions</h2>
          <p className="text-gray-700">{load.specialInstructions}</p>
        </div>
      )}

      {/* Payment Upload Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Upload Payment Proof"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Upload payment proof for verification</p>
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setPaymentFile(e.target.files[0])}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentUpload} disabled={!paymentFile || uploadingPayment}>
              {uploadingPayment ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      {load?.lorryOwner && user?.role === 'company' && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
          recipientName={load.lorryOwner.name}
          recipientType="Transport Provider"
        />
      )}

      {/* Rating Success Message */}
      {hasRated && load?.status === 'Completed' && user?.role === 'company' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">Thank you for rating this transporter!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadDetails
