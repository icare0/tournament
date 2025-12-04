'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToCSV, generateTournamentPDF, type TournamentPDFData } from '@/lib/utils/pdf-export'
import { apiClient } from '@/lib/api/client'
import { useToast } from '@/components/ui/use-toast'

interface ExportButtonProps {
  tournamentId?: string
  playerId?: string
  type: 'tournament' | 'player' | 'leaderboard' | 'revenue'
  className?: string
}

export function ExportButton({ tournamentId, playerId, type, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExportPDF = async () => {
    if (type !== 'tournament' || !tournamentId) {
      toast({
        title: 'Error',
        description: 'PDF export is only available for tournaments',
        variant: 'destructive',
      })
      return
    }

    setIsExporting(true)
    try {
      const response = await apiClient.get<TournamentPDFData>(
        `/analytics/export/tournament/${tournamentId}/pdf-data`
      )
      await generateTournamentPDF(response.data)
      toast({
        title: 'Success',
        description: 'PDF exported successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export PDF',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      let endpoint = ''
      let filename = ''

      switch (type) {
        case 'tournament':
          if (!tournamentId) throw new Error('Tournament ID required')
          endpoint = `/analytics/export/tournament/${tournamentId}/csv`
          filename = `tournament-${tournamentId}-analytics.csv`
          break
        case 'player':
          if (!playerId) throw new Error('Player ID required')
          endpoint = `/analytics/export/player/${playerId}/csv`
          filename = `player-${playerId}-performance.csv`
          break
        case 'leaderboard':
          endpoint = `/analytics/export/leaderboard/csv?limit=100`
          filename = 'leaderboard.csv'
          break
        case 'revenue':
          endpoint = `/analytics/export/revenue/csv?period=month`
          filename = 'revenue-analytics.csv'
          break
      }

      await exportToCSV(endpoint, filename)
      toast({
        title: 'Success',
        description: 'CSV exported successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {type === 'tournament' && (
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
