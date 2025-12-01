'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateTournament } from '@/features/tournaments/api/use-tournaments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { TournamentType, TournamentVisibility } from '@/features/tournaments/types'

export default function NewTournamentPage() {
  const router = useRouter()
  const { mutate: createTournament, isPending, error } = useCreateTournament()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game: '',
    type: 'DOUBLE_ELIMINATION' as TournamentType,
    visibility: 'PUBLIC' as TournamentVisibility,
    maxParticipants: 16,
    entryFee: 0,
    prizePool: 0,
    registrationStart: '',
    registrationEnd: '',
    startDate: '',
    endDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createTournament(formData, {
      onSuccess: (tournament) => {
        router.push(`/dashboard/tournaments/${tournament.id}`)
      },
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'maxParticipants' || name === 'entryFee' || name === 'prizePool'
          ? parseFloat(value) || 0
          : value,
    }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/tournaments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Tournament</h1>
          <p className="text-muted-foreground">
            Set up a new tournament for your game
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                General details about your tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error instanceof Error
                      ? error.message
                      : 'Failed to create tournament'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Spring Championship 2025"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game">Game *</Label>
                <Input
                  id="game"
                  name="game"
                  placeholder="Valorant, League of Legends, etc."
                  value={formData.game}
                  onChange={handleChange}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your tournament..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tournament Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value as TournamentType }))
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE_ELIMINATION">
                        Single Elimination
                      </SelectItem>
                      <SelectItem value="DOUBLE_ELIMINATION">
                        Double Elimination
                      </SelectItem>
                      <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                      <SelectItem value="SWISS">Swiss</SelectItem>
                      <SelectItem value="BATTLE_ROYALE">Battle Royale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility *</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        visibility: value as TournamentVisibility,
                      }))
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Participants & Pricing</CardTitle>
              <CardDescription>
                Configure participant limits and financial details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="2"
                    max="1024"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee ($)</Label>
                  <Input
                    id="entryFee"
                    name="entryFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.entryFee}
                    onChange={handleChange}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prizePool">Prize Pool ($)</Label>
                  <Input
                    id="prizePool"
                    name="prizePool"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prizePool}
                    onChange={handleChange}
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Set important dates for your tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registrationStart">Registration Start *</Label>
                  <Input
                    id="registrationStart"
                    name="registrationStart"
                    type="datetime-local"
                    value={formData.registrationStart}
                    onChange={handleChange}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationEnd">Registration End *</Label>
                  <Input
                    id="registrationEnd"
                    name="registrationEnd"
                    type="datetime-local"
                    value={formData.registrationEnd}
                    onChange={handleChange}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Tournament Start *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Tournament End (Optional)</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tournament
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
