import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MailPlus, Trash2, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useClinicContext } from '../hooks/useClinicContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as teamService from '../services/teamService'
import type { ClinicMemberRole } from '../types/app'

const roleLabels: Record<ClinicMemberRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  veterinarian: 'Veterinário',
  receptionist: 'Recepção',
  assistant: 'Assistente',
}

export default function EquipePage() {
  const { clinicId } = useClinicContext()
  const qc = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<ClinicMemberRole>('receptionist')

  const membersQ = useQuery({
    queryKey: ['team-members', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => teamService.listTeamMembers(clinicId!),
  })

  const invitesQ = useQuery({
    queryKey: ['team-invites', clinicId],
    enabled: Boolean(clinicId && isSupabaseConfigured),
    queryFn: () => teamService.listInvitations(clinicId!),
  })

  const inviteM = useMutation({
    mutationFn: () => teamService.createInvitation(clinicId!, inviteEmail, inviteRole),
    onSuccess: () => {
      toast.success('Convite enviado.')
      void qc.invalidateQueries({ queryKey: ['team-invites', clinicId] })
      setInviteEmail('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const revokeM = useMutation({
    mutationFn: (id: string) => teamService.revokeInvitation(id),
    onSuccess: () => {
      toast.success('Convite revogado.')
      void qc.invalidateQueries({ queryKey: ['team-invites', clinicId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!isSupabaseConfigured) return <Card padding="lg">Configure o Supabase para gerir a equipe.</Card>
  if (!clinicId) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Equipe</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Membros ativos e convites pendentes</p>
      </div>

      <Card padding="md">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
            <MailPlus className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold">Novo convite</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">O convidado precisa de conta no sistema para aceitar.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input label="E-mail" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="nome@clinica.com" />
              </div>
              <label className="block text-sm font-semibold sm:w-44">
                Papel
                <select
                  className="mt-1 w-full rounded-2xl border px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/40"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ClinicMemberRole)}
                >
                  {(Object.keys(roleLabels) as ClinicMemberRole[]).map((r) => (
                    <option key={r} value={r}>
                      {roleLabels[r]}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                loading={inviteM.isPending}
                onClick={() => {
                  if (!inviteEmail.trim().includes('@')) {
                    toast.error('Informe um e-mail válido.')
                    return
                  }
                  inviteM.mutate()
                }}
              >
                Convidar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-slate-200/80 px-4 py-3 text-sm font-extrabold dark:border-white/10">Membros</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {(membersQ.data ?? []).map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-semibold">{m.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.email ?? '—'}</td>
                <td className="px-4 py-3">{roleLabels[m.role] ?? m.role}</td>
                <td className="px-4 py-3">
                  <Badge tone={m.status === 'active' ? 'success' : 'neutral'}>{m.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200/80 px-4 py-3 dark:border-white/10">
          <UsersRound className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-extrabold">Convites</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Expira</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {(invitesQ.data ?? []).map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-medium">{inv.email}</td>
                <td className="px-4 py-3">{roleLabels[inv.role] ?? inv.role}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(inv.expires_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <Badge tone={inv.status === 'pending' ? 'amber' : 'neutral'}>{inv.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {inv.status === 'pending' ? (
                    <Button type="button" size="sm" variant="outline" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => revokeM.mutate(inv.id)}>
                      Revogar
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
