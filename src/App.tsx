import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import Login from './pages/Login'
import Agenda from './pages/Agenda'
import Automacoes from './pages/Automacoes'
import Configuracoes from './pages/Configuracoes'
import Conversas from './pages/Conversas'
import Dashboard from './pages/Dashboard'
import Financeiro from './pages/Financeiro'
import PacienteDetalhe from './pages/PacienteDetalhe'
import Pacientes from './pages/Pacientes'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="conversas" element={<Conversas />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="pacientes/:id" element={<PacienteDetalhe />} />
              <Route path="automacoes" element={<Automacoes />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
