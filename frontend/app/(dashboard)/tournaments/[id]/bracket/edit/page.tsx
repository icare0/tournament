'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2, GripVertical, Save, Shuffle, ArrowLeft, Trophy, AlertCircle } from 'lucide-react'
import {
  useTournamentParticipants,
  useUpdateParticipantSeed,
  useAutoSeedParticipants,
  useGenerateBracket,
} from '@/features/tournaments/api/use-tournaments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import type { Participant } from '@/features/tournaments/types'

interface BracketEditPageProps {
  params: Promise<{ id: string }>
}

interface SortableParticipantProps {
  participant: Participant
  index: number
  onSeedChange: (participantId: string, newSeed: number) => void
}

function SortableParticipant({ participant, index, onSeedChange }: SortableParticipantProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: participant.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [editingSeed, setEditingSeed] = useState(false)
  const [seedValue, setSeedValue] = useState(participant.seed?.toString() || (index + 1).toString())

  const handleSeedBlur = () => {
    setEditingSeed(false)
    const newSeed = parseInt(seedValue)
    if (!isNaN(newSeed) && newSeed > 0) {
      onSeedChange(participant.id, newSeed)
    } else {
      setSeedValue(participant.seed?.toString() || (index + 1).toString())
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-3 flex-1">
        {/* Seed Number */}
        {editingSeed ? (
          <Input
            type="number"
            value={seedValue}
            onChange={(e) => setSeedValue(e.target.value)}
            onBlur={handleSeedBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSeedBlur()
              if (e.key === 'Escape') {
                setEditingSeed(false)
                setSeedValue(participant.seed?.toString() || (index + 1).toString())
              }
            }}
            className="w-16 h-8"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingSeed(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
          >
            #{participant.seed || index + 1}
          </button>
        )}

        {/* Avatar */}
        {participant.user?.avatar ? (
          <img
            src={participant.user.avatar}
            alt={participant.user.username || 'Player'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {(participant.user?.username || 'P')[0].toUpperCase()}
          </div>
        )}

        {/* Player Name */}
        <div className="flex-1">
          <p className="font-medium">{participant.user?.username || 'Unknown Player'}</p>
          {participant.teamName && (
            <p className="text-sm text-muted-foreground">{participant.teamName}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Wins</p>
            <p className="font-bold text-green-500">{participant.wins}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Losses</p>
            <p className="font-bold text-red-500">{participant.losses}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          participant.status === 'CHECKED_IN' ? 'bg-green-500/10 text-green-500' :
          participant.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-500' :
          participant.status === 'REGISTERED' ? 'bg-gray-500/10 text-gray-500' :
          'bg-red-500/10 text-red-500'
        }`}>
          {participant.status.replace('_', ' ')}
        </div>
      </div>
    </div>
  )
}

export default function BracketEditPage({ params }: BracketEditPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: participants, isLoading, error } = useTournamentParticipants(id)
  const updateSeedMutation = useUpdateParticipantSeed()
  const autoSeedMutation = useAutoSeedParticipants()
  const generateBracketMutation = useGenerateBracket()

  const [localParticipants, setLocalParticipants] = useState<Participant[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize local participants when data loads
  useState(() => {
    if (participants) {
      const sorted = [...participants].sort((a, b) => (a.seed || 999) - (b.seed || 999))
      setLocalParticipants(sorted)
    }
  })

  // Update local participants when API data changes
  if (participants && localParticipants.length === 0) {
    const sorted = [...participants].sort((a, b) => (a.seed || 999) - (b.seed || 999))
    setLocalParticipants(sorted)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLocalParticipants((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const reordered = arrayMove(items, oldIndex, newIndex)
        setHasUnsavedChanges(true)
        return reordered
      })
    }
  }

  const handleSeedChange = (participantId: string, newSeed: number) => {
    setLocalParticipants((items) => {
      const updated = items.map((p) =>
        p.id === participantId ? { ...p, seed: newSeed } : p
      )
      setHasUnsavedChanges(true)
      return updated.sort((a, b) => (a.seed || 999) - (b.seed || 999))
    })
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Update all participants with their new seed positions
      const updates = localParticipants.map((participant, index) =>
        updateSeedMutation.mutateAsync({
          tournamentId: id,
          participantId: participant.id,
          seed: participant.seed || index + 1,
        })
      )

      await Promise.all(updates)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAutoSeed = async (method: 'random' | 'skill') => {
    try {
      await autoSeedMutation.mutateAsync({
        tournamentId: id,
        method,
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to auto-seed:', error)
    }
  }

  const handleGenerateBracket = async () => {
    if (!confirm('Generate bracket? This will create matches based on the current seeding.')) {
      return
    }

    try {
      await generateBracketMutation.mutateAsync(id)
      router.push(`/tournaments/${id}/bracket`)
    } catch (error) {
      console.error('Failed to generate bracket:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !participants) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load participants. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (participants.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No participants yet. Players need to register before you can set up the bracket.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push(`/tournaments/${id}`)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push(`/tournaments/${id}/bracket`)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Bracket Seeding</h1>
            <p className="text-muted-foreground">
              Drag participants to reorder or click seed numbers to edit directly
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleAutoSeed('random')}
            variant="outline"
            disabled={autoSeedMutation.isPending}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Random Seed
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
          <Button
            onClick={handleGenerateBracket}
            disabled={hasUnsavedChanges || generateBracketMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {generateBracketMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4 mr-2" />
            )}
            Generate Bracket
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply your new seeding.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Participants</p>
            <p className="text-2xl font-bold">{participants.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Checked In</p>
            <p className="text-2xl font-bold text-green-500">
              {participants.filter((p) => p.status === 'CHECKED_IN').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-500">
              {participants.filter((p) => p.status === 'REGISTERED' || p.status === 'CONFIRMED').length}
            </p>
          </div>
        </div>
      </Card>

      {/* Participants List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Participants ({localParticipants.length})</h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localParticipants.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {localParticipants.map((participant, index) => (
                <SortableParticipant
                  key={participant.id}
                  participant={participant}
                  index={index}
                  onSeedChange={handleSeedChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      {/* Help Text */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong> Drag participants to reorder them, or click on seed numbers to manually edit.
          Changes are saved when you click "Save Changes". Once satisfied, click "Generate Bracket" to create the tournament matches.
        </AlertDescription>
      </Alert>
    </div>
  )
}
