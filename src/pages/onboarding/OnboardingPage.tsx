import { ArrowRight } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useMyClinics } from '../../hooks/useMyClinics'
import { createClinicOnboarding } from '../../services/clinicService'
import { useClinicStore } from '../../stores/clinicStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { LogoPetVia } from '../../components/petvia/LogoPetVia'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const { data: clinics, isLoading } = useMyClinics()
  const setCurrentClinicId = useClinicStore((s) => s.setCurrentClinicId)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [clinicName, setClinicName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [stateUf, setStateUf] = useState('')

  const [openingHours, setOpeningHours] = useState('Seg–Sex 9h–18h')
  const [vetCount, setVetCount] = useState(2)
  const [mainServices, setMainServices] = useState('Consultas, vacina, cirurgias leves')

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!isLoading && clinics && clinics.length > 0) {
    return <Navigate to="/app/dashboard" replace />
  }

  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const id = await createClinicOnboarding({
        clinicName,
        phone,
        whatsapp,
        email: (email || session.user.email) ?? '',
        city,
        state: stateUf,
        openingHours,
        vetCount,
        mainServices,
      })
      setCurrentClinicId(id)
      await queryClient.invalidateQueries({ queryKey: ['my-clinics'] })
      toast.success('Clínica criada!')
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar clínica'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface petvia-mesh px-4 py-10 text-ink dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 petvia-noise opacity-35 dark:opacity-20" />
      <div className="relative z-10 mx-auto max-w-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoPetVia size={48} withWordmark />
          <div className="mt-3 text-sm font-semibold text-slate-500">Onboarding · passo {step} de 3</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Configure sua clínica</h1>
        </div>

        <Card padding="lg">
          {step === 1 ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); next() }}>
              <Input label="Nome da clínica" required value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
              <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <Input label="E-mail da clínica" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Cidade" required value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="Estado (UF)" required value={stateUf} onChange={(e) => setStateUf(e.target.value)} maxLength={2} />
              </div>
              <Button type="submit" fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continuar
              </Button>
            </form>
          ) : null}

          {step === 2 ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); next() }}>
              <Input label="Horário de funcionamento" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} />
              <Input
                label="Quantidade de veterinários"
                type="number"
                min={1}
                value={String(vetCount)}
                onChange={(e) => setVetCount(Number(e.target.value) || 1)}
              />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-slate-200/90">Serviços principais</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-slate-200/85 bg-white/75 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-purple/45 focus:ring-2 focus:ring-brand-purple/20 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100"
                  value={mainServices}
                  onChange={(e) => setMainServices(e.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" fullWidth onClick={back}>
                  Voltar
                </Button>
                <Button type="submit" fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Continuar
                </Button>
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <form className="space-y-4" onSubmit={submit}>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Revise os dados e crie sua clínica. Você será definido como <strong>owner</strong>.
              </p>
              <ul className="space-y-1 rounded-2xl border border-slate-200/70 bg-white/50 p-3 text-sm dark:border-white/10 dark:bg-slate-950/35">
                <li>
                  <span className="text-slate-500">Clínica:</span> {clinicName}
                </li>
                <li>
                  <span className="text-slate-500">Cidade:</span> {city} / {stateUf}
                </li>
                <li>
                  <span className="text-slate-500">WhatsApp:</span> {whatsapp || '—'}
                </li>
              </ul>
              <div className="flex gap-2">
                <Button type="button" variant="outline" fullWidth onClick={back}>
                  Voltar
                </Button>
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Criar clínica
                </Button>
              </div>
            </form>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
