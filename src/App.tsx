import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { GuestGate } from './components/auth/GuestGate'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireClinic } from './components/auth/RequireClinic'
import { RequirePetviaAdmin } from './components/auth/RequirePetviaAdmin'
import { AppShell } from './components/layout/AppShell'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import Agenda from './pages/Agenda'
import Automacoes from './pages/Automacoes'
import BuscaGlobalPage from './pages/BuscaGlobalPage'
import CentralIA from './pages/CentralIA'
import ClientesPage from './pages/ClientesPage'
import Configuracoes from './pages/Configuracoes'
import Conversas from './pages/Conversas'
import Dashboard from './pages/Dashboard'
import EquipePage from './pages/EquipePage'
import Financeiro from './pages/Financeiro'
import PacienteDetalhe from './pages/PacienteDetalhe'
import Pacientes from './pages/Pacientes'
import PublicHome from './pages/PublicHome'
import EstoquePage from './pages/EstoquePage'
import LembretesPage from './pages/LembretesPage'
import RelatoriosPage from './pages/RelatoriosPage'
import MarketingIAPage from './pages/marketing/MarketingIAPage'

function RedirectPacienteToPet() {
  const { id } = useParams()
  return <Navigate to={`/app/pets/${id ?? ''}`} replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/home" element={<PublicHome />} />

          <Route element={<GuestGate />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<RequirePetviaAdmin />}>
              <Route path="/marketing-ia" element={<MarketingIAPage />} />
            </Route>
            <Route element={<RequireClinic />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="busca" element={<BuscaGlobalPage />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="conversas" element={<Conversas />} />
                <Route path="central-ia" element={<CentralIA />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="lembretes" element={<LembretesPage />} />
                <Route path="estoque" element={<EstoquePage />} />
                <Route path="relatorios" element={<RelatoriosPage />} />
                <Route path="pets" element={<Pacientes />} />
                <Route path="pets/:id" element={<PacienteDetalhe />} />
                <Route path="pacientes" element={<Navigate to="/app/pets" replace />} />
                <Route path="pacientes/:id" element={<RedirectPacienteToPet />} />
                <Route path="automacoes" element={<Automacoes />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="equipe" element={<EquipePage />} />
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
