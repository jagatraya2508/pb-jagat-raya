import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TournamentPage from './pages/TournamentPage'
import TournamentBracketPage from './pages/TournamentBracketPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import MemberManagement from './pages/admin/MemberManagement'
import TournamentManagement from './pages/admin/TournamentManagement'
import CategoryManagement from './pages/admin/CategoryManagement'
import RegistrationManagement from './pages/admin/RegistrationManagement'
import BracketManagement from './pages/admin/BracketManagement'
import UserManagement from './pages/admin/UserManagement'
import SlideManagement from './pages/admin/SlideManagement'
import ContentManagement from './pages/admin/ContentManagement'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/kejuaraan" element={<TournamentPage />} />
          <Route path="/bracket/:tournamentId" element={<TournamentBracketPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <ProtectedRoute>
                <MemberManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tournaments"
            element={
              <ProtectedRoute>
                <TournamentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <ProtectedRoute>
                <RegistrationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/brackets"
            element={
              <ProtectedRoute>
                <BracketManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/slides"
            element={
              <ProtectedRoute>
                <SlideManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute>
                <ContentManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

