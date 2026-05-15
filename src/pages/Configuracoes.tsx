import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Megaphone, Shield, Smartphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useClinicContext } from '../hooks/useClinicContext'
import { usePetviaAdmin } from '../hooks/usePetviaAdmin'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Clinic } from '../types/app'
import * as clinicService from '../services/clinicService'

function ClinicSettingsForm({ clinic }: { clinic: Clinic }) {
  const { clinicId } = useClinicContext()
  const { session } = useAuth()
  const uid = session?.user.id
  const qc = useQueryClient()
  const [name, setName] = useState(clinic.name ?? '')
  const [phone, setPhone] = useState(clinic.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(clinic.whatsapp_number ?? '')
  const [email, setEmail] = useState(clinic.email ?? '')
  const [address, setAddress] = useState(clinic.address ?? '')
  const [city, setCity] = useState(clinic.city ?? '')
  const [stateUf, setStateUf] = useState(clinic.state ?? '')
  const [openingHours, setOpeningHours] = useState(clinic.opening_hours ?? '')

  const saveM = useMutation({
    mutationFn: () =>
      clinicService.updateClinicRecord(clinicId!, {
        name: name.trim(),
        phone: phone.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: stateUf.trim() || null,
        opening_hours: openingHours.trim() || null,
      }),
    onSuccess: () => {
      toast.success('Dados da clínica salvos.')
      void qc.invalidateQueries({ queryKey: ['my-clinics', uid] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10 text-brand-purple dark:text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="text-base font-extrabold tracking-tight">Identificação e contato</div>
          <Input label="Nome da clínica" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="UF" value={stateUf} onChange={(e) => setStateUf(e.target.value)} maxLength={2} />
          </div>
          <label className="block text-sm font-semibold">
            Horários de atendimento
            <textarea
              className="mt-1 min-h-[88px] w-full rounded-2xl border px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/40"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="Ex.: Seg–Sex 8h–18h, Sáb 8h–12h"
            />
          </label>
          <div className="flex justify-end pt-2">
            <Button type="button" loading={saveM.isPending} onClick={() => saveM.mutate()}>
              Salvar alterações
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Configuracoes() {
  const navigate = useNavigate()
  const { clinic, clinicId } = useClinicContext()
  const petviaAdmin = usePetviaAdmin()

  if (!isSupabaseConfigured) return <Card padding="lg">Configure o Supabase.</Card>
  if (!clinicId || !clinic) return null

  return (
    <div className="space-y-4">
      {petviaAdmin.data ? (
        <Card padding="md" className="border-brand-purple/20 bg-gradient-to-r from-brand-purple/8 to-brand-teal/8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-brand-purple shadow-sm dark:bg-slate-950/50 dark:text-brand-teal">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight">Marketing IA (PetVia)</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Posts institucionais no Instagram — acesso exclusivo da equipe interna.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={() => void navigate('/marketing-ia')}>
              Abrir Marketing IA
            </Button>
          </div>
        </Card>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Configurações</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Dados da clínica sincronizados com o Supabase</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
          <Shield className="h-4 w-4 text-brand-purple" />
          Clínica atual
        </div>
      </div>

      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight">WhatsApp (Evolution)</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Conecte o número da clínica por QR Code para inbox, tickets e IA.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" type="button" onClick={() => void navigate('/app/whatsapp')}>
            Configurar WhatsApp
          </Button>
        </div>
      </Card>

      <ClinicSettingsForm key={`${clinic.id}-${clinic.updated_at}`} clinic={clinic} />
    </div>
  )
}
