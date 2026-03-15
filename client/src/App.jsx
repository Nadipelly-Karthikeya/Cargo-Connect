import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Auth Pages
import HomePage from './pages/HomePage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'

// Public Info Pages
import WhyUs from './pages/WhyUs'
import Facilities from './pages/Facilities'
import Careers from './pages/Careers'
import Contact from './pages/Contact'

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard'
import CreateLoad from './pages/company/CreateLoad'
import EditLoad from './pages/company/EditLoad'
import ManageLoads from './pages/company/ManageLoads'
import LoadDetails from './pages/company/LoadDetails'
import CompanyProfile from './pages/company/CompanyProfile'
import Transactions from './pages/company/Transactions'
import LoadHistory from './pages/company/LoadHistory'

// Lorry Pages
import LorryDashboard from './pages/lorry/LorryDashboard'
import ManageVehicles from './pages/lorry/ManageVehicles'
import AddVehicle from './pages/lorry/AddVehicle'
import EditVehicle from './pages/lorry/EditVehicle'
import AvailableLoads from './pages/lorry/AvailableLoads'
import MyLoads from './pages/lorry/MyLoads'
import Earnings from './pages/lorry/Earnings'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageAdminVehicles from './pages/admin/ManageVehicles'
import ManageTransactions from './pages/admin/ManageTransactions'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-800"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/why-us" element={<WhyUs />} />
      <Route path="/facilities" element={<Facilities />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<Contact />} />

      {/* Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === 'company' && <Navigate to="/company/dashboard" replace />}
            {user?.role === 'lorry' && <Navigate to="/lorry/dashboard" replace />}
            {user?.role === 'admin' && <Navigate to="/admin/dashboard" replace />}
          </ProtectedRoute>
        }
      />

      {/* Company Owner Routes */}
      <Route
        path="/company"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CompanyDashboard />} />
        <Route path="loads/create" element={<CreateLoad />} />
        <Route path="loads/:id/edit" element={<EditLoad />} />
        <Route path="loads/:id" element={<LoadDetails />} />
        <Route path="loads" element={<ManageLoads />} />
        <Route path="load-history" element={<LoadHistory />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="profile" element={<CompanyProfile />} />
      </Route>

      {/* Lorry Owner Routes */}
      <Route
        path="/lorry"
        element={
          <ProtectedRoute allowedRoles={['lorry']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<LorryDashboard />} />
        <Route path="vehicles" element={<ManageVehicles />} />
        <Route path="vehicles/add" element={<AddVehicle />} />
        <Route path="vehicles/:id/edit" element={<EditVehicle />} />
        <Route path="loads/available" element={<AvailableLoads />} />
        <Route path="loads/my-loads" element={<MyLoads />} />
        <Route path="loads/:id" element={<LoadDetails />} />
        <Route path="earnings" element={<Earnings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="loads" element={<ManageLoads />} />
        <Route path="vehicles" element={<ManageAdminVehicles />} />
        <Route path="transactions" element={<ManageTransactions />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
