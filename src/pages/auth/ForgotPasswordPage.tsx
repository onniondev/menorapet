import { ArrowLeft, Mail } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { PetviaLogo } from '../../components/PetviaLogo'
import { ThemeToggle } from '../../components/layout/ThemeToggle'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Se o e-mail existir, enviaremos o link de recuperação.')
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 petvia-mesh opacity-90" />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <PetviaLogo size={44} />
          <ThemeToggle />
        </div>

        <Card padding="lg">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-brand-purple hover:underline dark:text-brand-teal">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
          <h1 className="mt-4 text-xl font-extrabold tracking-tight">Recuperar senha</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Enviaremos um link para o seu e-mail</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              left={<Mail className="h-4 w-4" />}
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Enviar link
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
