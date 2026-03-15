import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Input } from '../../components/FormElements'
import { PageLoader } from '../../components/Loader'
import { RatingDisplay, VerifiedBadge } from '../../components/Rating'
import { companyAPI } from '../../api'

const CompanyProfile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    address: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await companyAPI.getProfile()
      setProfile(response.data.profile)
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        companyName: response.data.profile.companyName || '',
        gstNumber: response.data.profile.gstNumber || '',
        address: response.data.profile.address || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateUser(formData)
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <VerifiedBadge verified={user.isVerified} size="lg" />
          </div>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {/* Rating Display */}
      {user.ratingCount > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rating</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-500">{user.ratingAverage}</div>
              <div className="text-sm text-gray-600 mt-1">out of 5</div>
            </div>
            <div className="flex-1">
              <RatingDisplay rating={parseFloat(user.ratingAverage)} count={user.ratingCount} size="lg" />
              <p className="text-sm text-gray-600 mt-2">
                Based on {user.ratingCount} {user.ratingCount === 1 ? 'review' : 'reviews'} from transporters
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                required
              />
              <Input
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
                required
              />
              <Input
                type="tel"
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                pattern="[0-9]{10}"
                disabled={!editing}
                required
              />
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                disabled={!editing}
                required
              />
              <Input
                label="GST Number"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                disabled={!editing}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Company Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Email Status</span>
                <p className="font-medium mt-1">
                  {user.isVerified ? (
                    <span className="text-green-700">Verified</span>
                  ) : (
                    <span className="text-yellow-700">Pending Verification</span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Account Status</span>
                <p className="font-medium mt-1">
                  {user.isSuspended ? (
                    <span className="text-red-700">Suspended</span>
                  ) : (
                    <span className="text-green-700">Active</span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Role</span>
                <p className="font-medium mt-1 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-4">
              <Button type="button" variant="secondary" onClick={() => {
                setEditing(false)
                fetchProfile()
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default CompanyProfile
