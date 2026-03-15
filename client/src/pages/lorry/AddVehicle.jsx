import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Select } from '../../components/FormElements'
import { lorryAPI } from '../../api'

const AddVehicle = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    capacity: '',
    currentLocationCity: '',
    currentLocationState: '',
    driverName: '',
    driverPhone: '',
    driverLicenseNumber: '',
    insuranceNumber: ''
  })
  const [documents, setDocuments] = useState({
    rcDocument: null,
    insuranceDocument: null,
    licenseDocument: null
  })
  const [insuranceExpiry, setInsuranceExpiry] = useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate vehicle number format
      const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/
      if (!vehicleNumberPattern.test(formData.vehicleNumber)) {
        throw new Error('Invalid vehicle number format. Use format like: MH12AB1234')
      }

      // Validate phone number
      const phonePattern = /^[0-9]{10}$/
      if (!phonePattern.test(formData.driverPhone)) {
        throw new Error('Driver phone must be exactly 10 digits')
      }

      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'currentLocationCity' || key === 'currentLocationState') return
        submitData.append(key, formData[key])
      })
      submitData.append('currentLocation', JSON.stringify({
        city: formData.currentLocationCity,
        state: formData.currentLocationState
      }))
      submitData.append('insuranceExpiry', insuranceExpiry)
      
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          submitData.append(key, documents[key])
        }
      })

      console.log('Submitting vehicle data...')
      const response = await lorryAPI.addLorry(submitData)
      console.log('Vehicle added successfully:', response)
      navigate('/lorry/vehicles')
    } catch (err) {
      console.error('Add vehicle error:', err)
      console.error('Error response:', err.response?.data)
      setError(err.response?.data?.message || err.message || 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Vehicle</h1>
        <p className="text-gray-600 mt-1">Register your vehicle to start accepting loads</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Vehicle Number"
                placeholder="e.g., MH12AB1234"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: 2 letters, 2 digits, 1-2 letters, 4 digits</p>
            </div>
            <Select
              label="Vehicle Type"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              options={vehicleTypes}
              required
            />
            <Input
              type="number"
              label="Capacity (in tons)"
              placeholder="Enter capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              min="0.1"
              step="0.1"
              required
            />
            <Input
              label="Current City"
              placeholder="e.g., Mumbai"
              value={formData.currentLocationCity}
              onChange={(e) => setFormData({ ...formData, currentLocationCity: e.target.value })}
              required
            />
            <Input
              label="Current State"
              placeholder="e.g., Maharashtra"
              value={formData.currentLocationState}
              onChange={(e) => setFormData({ ...formData, currentLocationState: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Driver & Insurance Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Driver & Insurance Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Driver Name"
              placeholder="Enter driver name"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              required
            />
            <Input
              label="Driver Phone"
              placeholder="10-digit phone number"
              value={formData.driverPhone}
              onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
            <Input
              label="Driver License Number"
              placeholder="Enter license number"
              value={formData.driverLicenseNumber}
              onChange={(e) => setFormData({ ...formData, driverLicenseNumber: e.target.value })}
              required
            />
            <Input
              label="Insurance Number"
              placeholder="Enter insurance number"
              value={formData.insuranceNumber}
              onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
            />
            <Input
              type="date"
              label="Insurance Expiry Date"
              value={insuranceExpiry}
              onChange={(e) => setInsuranceExpiry(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RC Copy (Registration Certificate) *
              </label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocuments({ ...documents, rcDocument: e.target.files[0] })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Document *
              </label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocuments({ ...documents, insuranceDocument: e.target.files[0] })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver License Document (Optional)
              </label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocuments({ ...documents, licenseDocument: e.target.files[0] })}
              />
            </div>
          </div>
        </div>

        {/* Information Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-700 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Verification Required</h3>
              <p className="text-sm text-yellow-700">
                Your vehicle will be reviewed by our admin team. You can start accepting loads once it's verified.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/lorry/vehicles')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddVehicle
