import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TournamentPDFData {
  tournament: {
    name: string;
    game: string;
    type: string;
    status: string;
    entryFee: string;
    prizePool: string;
    startDate: string;
    organizer: {
      username: string;
    };
  };
  summary: {
    totalParticipants: number;
    checkedInCount: number;
    totalMatches: number;
    completedMatches: number;
    completionRate: number;
    averageMatchDuration: number;
  };
  participants: Array<{
    username: string;
    teamName?: string;
    seed?: number;
    wins: number;
    losses: number;
    winRate: number;
    status: string;
  }>;
  topPerformers: Array<{
    rank: number;
    username: string;
    wins: number;
    losses: number;
    winRate: number;
  }>;
  matches: Array<{
    matchNumber: number;
    round: number;
    homePlayer?: string;
    awayPlayer?: string;
    score: string;
    winner?: string;
    status: string;
    completedAt?: string;
  }>;
}

/**
 * Generate a comprehensive tournament analytics PDF report
 */
export async function generateTournamentPDF(data: TournamentPDFData): Promise<void> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(88, 28, 135); // Purple
  doc.text(data.tournament.name, 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Tournament Analytics Report`, 14, 28);

  // Tournament Information
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Tournament Information', 14, 40);

  doc.setFontSize(10);
  doc.setTextColor(60);
  let y = 48;
  doc.text(`Game: ${data.tournament.game}`, 14, y);
  y += 6;
  doc.text(`Type: ${data.tournament.type}`, 14, y);
  y += 6;
  doc.text(`Status: ${data.tournament.status}`, 14, y);
  y += 6;
  doc.text(`Entry Fee: ${data.tournament.entryFee}`, 14, y);
  y += 6;
  doc.text(`Prize Pool: ${data.tournament.prizePool}`, 14, y);
  y += 6;
  doc.text(`Start Date: ${new Date(data.tournament.startDate).toLocaleDateString()}`, 14, y);
  y += 6;
  doc.text(`Organizer: ${data.tournament.organizer.username}`, 14, y);

  // Summary Statistics
  y += 14;
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Summary Statistics', 14, y);

  y += 8;
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Total Participants', data.summary.totalParticipants.toString()],
      ['Checked In', data.summary.checkedInCount.toString()],
      ['Total Matches', data.summary.totalMatches.toString()],
      ['Completed Matches', data.summary.completedMatches.toString()],
      ['Completion Rate', `${data.summary.completionRate.toFixed(1)}%`],
      ['Avg Match Duration', `${data.summary.averageMatchDuration.toFixed(1)} min`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [88, 28, 135] },
  });

  // Top Performers
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Top Performers', 14, 20);

  autoTable(doc, {
    startY: 28,
    head: [['Rank', 'Player', 'Wins', 'Losses', 'Win Rate']],
    body: data.topPerformers.slice(0, 10).map((p) => [
      `#${p.rank}`,
      p.username,
      p.wins.toString(),
      p.losses.toString(),
      `${p.winRate.toFixed(1)}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [88, 28, 135] },
  });

  // Participants
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('All Participants', 14, 20);

  autoTable(doc, {
    startY: 28,
    head: [['Seed', 'Player', 'Team', 'Wins', 'Losses', 'Win Rate', 'Status']],
    body: data.participants.map((p) => [
      p.seed ? `#${p.seed}` : '-',
      p.username,
      p.teamName || '-',
      p.wins.toString(),
      p.losses.toString(),
      `${p.winRate.toFixed(1)}%`,
      p.status,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [88, 28, 135] },
    styles: { fontSize: 8 },
  });

  // Matches
  if (data.matches.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Match Results', 14, 20);

    autoTable(doc, {
      startY: 28,
      head: [['Match', 'Round', 'Home', 'Away', 'Score', 'Winner', 'Status']],
      body: data.matches.slice(0, 50).map((m) => [
        `#${m.matchNumber}`,
        m.round.toString(),
        m.homePlayer || 'TBD',
        m.awayPlayer || 'TBD',
        m.score,
        m.winner || '-',
        m.status,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [88, 28, 135] },
      styles: { fontSize: 8 },
    });
  }

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save the PDF
  doc.save(`tournament-${data.tournament.name.replace(/\s+/g, '-')}-report.pdf`);
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to CSV from API endpoint
 */
export async function exportToCSV(endpoint: string, filename: string, token?: string): Promise<void> {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }

  const csvContent = await response.text();
  downloadCSV(csvContent, filename);
}
