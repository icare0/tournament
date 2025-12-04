'use client'

import { X, Bell, Trophy, Users, DollarSign, Settings as SettingsIcon } from 'lucide-react'
import { useNotificationStore } from '@/lib/stores/useNotificationStore'
import type { NotificationPreferences as PreferencesType } from '@/lib/types/notification'

interface NotificationPreferencesProps {
  isOpen: boolean
  onClose: () => void
}

const PREFERENCE_OPTIONS = [
  {
    key: 'tournament' as keyof PreferencesType,
    label: 'Tournois',
    description: 'Inscriptions, débuts, résultats',
    icon: Trophy,
  },
  {
    key: 'match' as keyof PreferencesType,
    label: 'Matches',
    description: 'Rappels, check-in, disputes',
    icon: Bell,
  },
  {
    key: 'social' as keyof PreferencesType,
    label: 'Social',
    description: 'Challenges, follows, messages',
    icon: Users,
  },
  {
    key: 'financial' as keyof PreferencesType,
    label: 'Finances',
    description: 'Gains, retraits, transactions',
    icon: DollarSign,
  },
  {
    key: 'system' as keyof PreferencesType,
    label: 'Système',
    description: 'Mises à jour, maintenance',
    icon: SettingsIcon,
  },
]

export function NotificationPreferences({ isOpen, onClose }: NotificationPreferencesProps) {
  const { preferences, updatePreferences } = useNotificationStore()

  if (!isOpen) return null

  const handleToggle = (key: keyof PreferencesType) => {
    updatePreferences({ [key]: !preferences[key] })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-bloom-dark/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-bloom-bg border-2 border-bloom-dark/10 rounded-2xl shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-bloom-dark/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl italic text-bloom-dark mb-1">
                  Préférences de Notifications
                </h3>
                <p className="font-sans text-sm text-bloom-dark/60">
                  Choisissez les types de notifications que vous souhaitez recevoir
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-bloom-dark/5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-bloom-dark/60" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {PREFERENCE_OPTIONS.map((option) => {
              const Icon = option.icon
              const isEnabled = preferences[option.key]

              return (
                <button
                  key={option.key}
                  onClick={() => handleToggle(option.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                    isEnabled
                      ? 'border-bloom-accent bg-bloom-accent/5'
                      : 'border-bloom-dark/10 hover:border-bloom-dark/20'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg transition-colors ${
                      isEnabled ? 'bg-bloom-accent text-white' : 'bg-bloom-dark/5 text-bloom-dark/60'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 text-left">
                    <h4 className="font-sans text-sm font-medium text-bloom-dark mb-0.5">
                      {option.label}
                    </h4>
                    <p className="font-sans text-xs text-bloom-dark/50">
                      {option.description}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isEnabled ? 'bg-bloom-accent' : 'bg-bloom-dark/10'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-bloom-dark/5 flex items-center justify-between">
            <button
              onClick={() => {
                updatePreferences({
                  tournament: false,
                  match: false,
                  social: false,
                  financial: false,
                  system: false,
                })
              }}
              className="px-4 py-2 font-sans text-sm text-bloom-dark/60 hover:text-bloom-dark transition-colors"
            >
              Tout désactiver
            </button>

            <button
              onClick={onClose}
              className="bg-bloom-dark text-bloom-bg px-6 py-3 rounded-none font-sans text-sm uppercase tracking-[0.2em] hover:bg-bloom-accent transition-all duration-300 hover:scale-105"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
