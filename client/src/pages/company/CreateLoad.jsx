import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Select, Textarea } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { loadAPI } from '../../api'

const CreateLoad = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Form, 2: Estimate, 3: Payment
  const [estimatedDetails, setEstimatedDetails] = useState(null)
  const [showEstimateModal, setShowEstimateModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    tipAmount: 0,
    paymentScreenshot: null,
    remarks: ''
  })
  const [formData, setFormData] = useState({
    goodsType: '',
    weight: '',
    requiredVehicleType: '',
    pickupLocation: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    dropLocation: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    pickupDate: '',
    distance: '',
    estimatedCost: '',
    specialInstructions: ''
  })

  // Pre-fill form for repeat load
  useEffect(() => {
    if (location.state?.repeatData) {
      setFormData(location.state.repeatData)
    }
  }, [location.state])

  const goodsTypes = [
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Food', label: 'Food' },
    { value: 'Chemicals', label: 'Chemicals' },
    { value: 'Textiles', label: 'Textiles' },
    { value: 'Machinery', label: 'Machinery' },
    { value: 'Automotive Parts', label: 'Automotive Parts' },
    { value: 'Construction Materials', label: 'Construction Materials' },
    { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'General Cargo', label: 'General Cargo' },
    { value: 'Other', label: 'Other' }
  ]

  const vehicleTypes = [
    { value: 'Mini Truck', label: 'Mini Truck' },
    { value: 'Small Truck', label: 'Small Truck' },
    { value: 'Medium Truck', label: 'Medium Truck' },
    { value: 'Large Truck', label: 'Large Truck' },
    { value: 'Container 20ft', label: 'Container 20ft' },
    { value: 'Container 40ft', label: 'Container 40ft' },
    { value: 'Trailer', label: 'Trailer' },
    { value: 'Tanker', label: 'Tanker' }
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }))
  }

  // Cost estimation logic with smart vehicle suggestion
  const calculateEstimatedCost = () => {
    const baseRatePerKm = {
      'Mini Truck': 15,
      'Small Truck': 20,
      'Medium Truck': 25,
      'Large Truck': 35,
      'Container 20ft': 40,
      'Container 40ft': 50,
      'Trailer': 60,
      'Tanker': 55
    }

    const weight = parseFloat(formData.weight) || 0
    const distance = parseFloat(formData.distance) || 0

    // Smart vehicle suggestion based on weight
    let suggestedVehicle = formData.requiredVehicleType
    if (!suggestedVehicle) {
      if (weight <= 1) suggestedVehicle = 'Mini Truck'
      else if (weight <= 3) suggestedVehicle = 'Small Truck'
      else if (weight <= 7) suggestedVehicle = 'Medium Truck'
      else if (weight <= 15) suggestedVehicle = 'Large Truck'
      else if (weight <= 20) suggestedVehicle = 'Container 20ft'
      else if (weight <= 25) suggestedVehicle = 'Container 40ft'
      else suggestedVehicle = 'Trailer'

      // Override for specific goods types
      if (formData.goodsType === 'Chemicals' || formData.goodsType === 'Pharmaceuticals') {
        suggestedVehicle = 'Tanker'
      }
    }

    const rate = baseRatePerKm[suggestedVehicle] || 25
    const baseCost = distance * rate
    const fuelSurcharge = baseCost * 0.15 // 15% fuel surcharge
    const toll = distance * 2 // Approximate toll
    const handling = weight * 50 // Handling charges
    
    const totalCost = Math.round(baseCost + fuelSurcharge + toll + handling)

    return {
      baseCost: Math.round(baseCost),
      fuelSurcharge: Math.round(fuelSurcharge),
      toll: Math.round(toll),
      handling: Math.round(handling),
      totalCost,
      suggestedVehicle,
      estimatedTime: Math.ceil(distance / 60) // Assuming avg 60 km/hr
    }
  }

  const handleEstimateCost = (e) => {
    e.preventDefault()
    
    // Validate required fields for estimation
    if (!formData.weight || !formData.distance || !formData.goodsType) {
      setError('Please fill in weight, distance, and goods type to estimate cost')
      return
    }

    const estimation = calculateEstimatedCost()
    setEstimatedDetails(estimation)
    setFormData(prev => ({
      ...prev,
      requiredVehicleType: estimation.suggestedVehicle,
      estimatedCost: estimation.totalCost
    }))
    setShowEstimateModal(true)
    setError('')
  }

  const proceedToPayment = () => {
    setShowEstimateModal(false)
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // In production, would upload payment screenshot to Cloudinary first
      await loadAPI.createLoad(formData)
      navigate('/company/loads')
    } catch (err) {
      setError(err.message || 'Failed to create load')
    } finally {
      setLoading(false)
    }
  }

  // Render Payment Summary Step
  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Summary</h1>
          <p className="text-gray-600 mt-1">Review and complete payment</p>
        </div>

        {/* Load Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Load Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Route:</span>
              <p className="font-medium">{formData.pickupLocation.city} → {formData.dropLocation.city}</p>
            </div>
            <div>
              <span className="text-gray-600">Distance:</span>
              <p className="font-medium">{formData.distance} km</p>
            </div>
            <div>
              <span className="text-gray-600">Goods Type:</span>
              <p className="font-medium">{formData.goodsType}</p>
            </div>
            <div>
              <span className="text-gray-600">Weight:</span>
              <p className="font-medium">{formData.weight} tons</p>
            </div>
            <div>
              <span className="text-gray-600">Vehicle Type:</span>
              <p className="font-medium">{formData.requiredVehicleType}</p>
            </div>
            <div>
              <span className="text-gray-600">Pickup Date:</span>
              <p className="font-medium">{new Date(formData.pickupDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
          {estimatedDetails && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Cost ({formData.distance} km × ₹{(estimatedDetails.baseCost / formData.distance).toFixed(2)}/km):</span>
                <span className="font-medium">₹{estimatedDetails.baseCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fuel Surcharge (15%):</span>
                <span className="font-medium">₹{estimatedDetails.fuelSurcharge.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Toll:</span>
                <span className="font-medium">₹{estimatedDetails.toll.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Handling Charges:</span>
                <span className="font-medium">₹{estimatedDetails.handling.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Subtotal:</span>
                <span className="font-semibold text-lg">₹{estimatedDetails.totalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tip Option */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Tip (Optional)</h2>
          <p className="text-sm text-gray-600 mb-4">Show appreciation for excellent service</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[0, 100, 200, 500].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setPaymentData({ ...paymentData, tipAmount: amount })}
                className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                  paymentData.tipAmount === amount
                    ? 'border-primary-800 bg-primary-50 text-primary-900 font-semibold'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {amount === 0 ? 'No Tip' : `₹${amount}`}
              </button>
            ))}
          </div>
          <Input
            type="number"
            label="Custom Tip Amount"
            placeholder="Enter custom amount"
            value={paymentData.tipAmount || ''}
            onChange={(e) => setPaymentData({ ...paymentData, tipAmount: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>

        {/* Bank Details & Payment Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Instructions</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-amber-900 mb-2">Company Bank Account</h3>
            <div className="space-y-1 text-sm text-amber-800">
              <p><span className="font-medium">Account Name:</span> Cargo Connect Private Limited</p>
              <p><span className="font-medium">Account Number:</span> 1234567890123456</p>
              <p><span className="font-medium">IFSC Code:</span> HDFC0001234</p>
              <p><span className="font-medium">Bank:</span> HDFC Bank, Cyber City Branch</p>
              <p><span className="font-medium">Total Amount:</span> ₹{((estimatedDetails?.totalCost || 0) + (paymentData.tipAmount || 0)).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Screenshot *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentData({ ...paymentData, paymentScreenshot: e.target.files[0] })}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-900 hover:file:bg-primary-100"
                required
              />
            </div>

            <Textarea
              label="Payment Remarks (Optional)"
              placeholder="Transaction ID, reference number, or any notes..."
              value={paymentData.remarks}
              onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => setStep(1)}>
            ← Back to Form
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !paymentData.paymentScreenshot} className="flex-1">
            {loading ? 'Submitting...' : 'Submit Load'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Post New Load</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new shipment request</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Load Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Load Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Goods Type"
              value={formData.goodsType}
              onChange={(e) => handleChange('goodsType', e.target.value)}
              options={goodsTypes}
              required
            />
            <Input
              type="number"
              label="Weight (in tons)"
              placeholder="Enter weight"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              min="0.1"
              step="0.1"
              required
            />
            <Select
              label="Vehicle Type"
              value={formData.requiredVehicleType}
              onChange={(e) => handleChange('requiredVehicleType', e.target.value)}
              options={vehicleTypes}
              required
            />
            <Input
              type="date"
              label="Pickup Date"
              value={formData.pickupDate}
              onChange={(e) => handleChange('pickupDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <Input
              type="number"
              label="Distance (in km)"
              placeholder="Enter distance"
              value={formData.distance}
              onChange={(e) => handleChange('distance', e.target.value)}
              min="1"
              required
            />
            <Input
              type="number"
              label="Estimated Cost (₹)"
              placeholder="Enter estimated cost"
              value={formData.estimatedCost}
              onChange={(e) => handleChange('estimatedCost', e.target.value)}
              min="1"
              required
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Special Instructions"
              placeholder="Additional details about the load"
              value={formData.specialInstructions}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Pickup Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pickup Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Full Address"
                placeholder="Street, Building, Landmark"
                value={formData.pickupLocation.address}
                onChange={(e) => handleAddressChange('pickupLocation', 'address', e.target.value)}
                required
              />
            </div>
            <Input
              label="City"
              placeholder="Enter city"
              value={formData.pickupLocation.city}
              onChange={(e) => handleAddressChange('pickupLocation', 'city', e.target.value)}
              required
            />
            <Input
              label="State"
              placeholder="Enter state"
              value={formData.pickupLocation.state}
              onChange={(e) => handleAddressChange('pickupLocation', 'state', e.target.value)}
              required
            />
            <Input
              label="Pincode"
              placeholder="6-digit pincode"
              value={formData.pickupLocation.pincode}
              onChange={(e) => handleAddressChange('pickupLocation', 'pincode', e.target.value)}
              pattern="[0-9]{6}"
              maxLength="6"
              required
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Full Address"
                placeholder="Street, Building, Landmark"
                value={formData.dropLocation.address}
                onChange={(e) => handleAddressChange('dropLocation', 'address', e.target.value)}
                required
              />
            </div>
            <Input
              label="City"
              placeholder="Enter city"
              value={formData.dropLocation.city}
              onChange={(e) => handleAddressChange('dropLocation', 'city', e.target.value)}
              required
            />
            <Input
              label="State"
              placeholder="Enter state"
              value={formData.dropLocation.state}
              onChange={(e) => handleAddressChange('dropLocation', 'state', e.target.value)}
              required
            />
            <Input
              label="Pincode"
              placeholder="6-digit pincode"
              value={formData.dropLocation.pincode}
              onChange={(e) => handleAddressChange('dropLocation', 'pincode', e.target.value)}
              pattern="[0-9]{6}"
              maxLength="6"
              required
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/company/loads')}>
            Cancel
          </Button>
          <Button type="button" onClick={handleEstimateCost} className="flex-1">
            Estimate Cost →
          </Button>
        </div>
      </form>

      {/* Cost Estimation Modal */}
      {showEstimateModal && estimatedDetails && (
        <Modal
          isOpen={showEstimateModal}
          onClose={() => setShowEstimateModal(false)}
          title="Cost Estimation"
        >
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="font-semibold text-primary-900 mb-2">Recommended Vehicle</h3>
              <p className="text-2xl font-bold text-primary-900">{estimatedDetails.suggestedVehicle}</p>
              <p className="text-sm text-primary-700 mt-1">
                Based on your load weight of {formData.weight} tons
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Cost:</span>
                  <span className="font-medium">₹{estimatedDetails.baseCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Surcharge:</span>
                  <span className="font-medium">₹{estimatedDetails.fuelSurcharge.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toll Charges:</span>
                  <span className="font-medium">₹{estimatedDetails.toll.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Handling:</span>
                  <span className="font-medium">₹{estimatedDetails.handling.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Estimated Cost:</span>
                  <span className="font-bold text-xl text-primary-900">₹{estimatedDetails.totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estimated Transit Time:</span>
                <span className="font-medium">{estimatedDetails.estimatedTime} hours</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowEstimateModal(false)}>
                Adjust Details
              </Button>
              <Button type="button" onClick={proceedToPayment} className="flex-1">
                Proceed to Payment →
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CreateLoad
