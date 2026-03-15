import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { PassThrough } from 'stream';

interface PlayerExportData {
  id: string;
  firstName: string;
  lastName: string;
  primaryPosition: string;
  jerseyNumber: number;
  height?: number | null;
  weight?: number | null;
  currentRating?: number | null;
  potentialRating?: number | null;
  currentTechnical?: any;
  currentPhysical?: any;
  currentMental?: any;
  strengths: string[];
  weaknesses: string[];
  dateOfBirth: Date;
}

@injectable()
export class ExportService {
  constructor(
    @inject(PrismaClient) private prisma: PrismaClient
  ) {}

  /**
   * Generate PDF report for a single player
   */
  async generatePlayerPDF(playerId: string): Promise<Buffer> {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: {
        team: true,
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!player) throw new Error('Player not found');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('VolleyCoaching', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Rapport de Joueur', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2563EB');
      doc.moveDown();

      // Player Info
      doc.fontSize(18).font('Helvetica-Bold')
        .text(`${player.firstName} ${player.lastName}`, { align: 'left' });
      doc.moveDown(0.5);

      const info = [
        ['Poste', player.primaryPosition],
        ['Numéro', `#${player.jerseyNumber}`],
        ['Équipe', player.team.name],
        ['Taille', player.height ? `${player.height} cm` : 'N/A'],
        ['Poids', player.weight ? `${player.weight} kg` : 'N/A'],
      ];

      doc.fontSize(11).font('Helvetica');
      for (const [label, value] of info) {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(String(value));
      }
      doc.moveDown();

      // Overall Rating
      if (player.currentRating) {
        doc.fontSize(14).font('Helvetica-Bold').text('Note Globale');
        doc.fontSize(36).font('Helvetica-Bold')
          .fillColor('#2563EB')
          .text(`${player.currentRating.toFixed(1)} / 10`, { align: 'center' });
        doc.fillColor('black');
        doc.moveDown();
      }

      // Skills breakdown
      const sections = [
        { title: 'Technique', data: player.currentTechnical },
        { title: 'Physique', data: player.currentPhysical },
        { title: 'Mental', data: player.currentMental },
      ];

      for (const section of sections) {
        if (!section.data) continue;
        doc.fontSize(14).font('Helvetica-Bold').text(section.title);
        doc.moveDown(0.3);

        doc.fontSize(10).font('Helvetica');
        const entries = this.flattenSkills(section.data);
        for (const [skill, value] of entries) {
          const barWidth = 200;
          const barHeight = 12;
          const y = doc.y;

          doc.text(skill, 50, y, { width: 180 });

          // Background bar
          doc.rect(240, y, barWidth, barHeight).fill('#E5E7EB');
          // Value bar
          const fillWidth = (Number(value) / 10) * barWidth;
          const color = Number(value) >= 7 ? '#22C55E' : Number(value) >= 5 ? '#F59E0B' : '#EF4444';
          doc.rect(240, y, fillWidth, barHeight).fill(color);
          // Value text
          doc.fillColor('black').fontSize(10)
            .text(`${Number(value).toFixed(1)}`, 450, y);

          doc.moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Strengths & Weaknesses
      if (player.strengths.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Forces');
        doc.fontSize(10).font('Helvetica');
        for (const s of player.strengths) {
          doc.text(`  + ${s}`);
        }
        doc.moveDown(0.5);
      }

      if (player.weaknesses.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Axes d\'amélioration');
        doc.fontSize(10).font('Helvetica');
        for (const w of player.weaknesses) {
          doc.text(`  - ${w}`);
        }
        doc.moveDown(0.5);
      }

      // Evaluation History
      if (player.evaluations.length > 0) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('Historique des Évaluations');
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        for (const eval_ of player.evaluations) {
          const date = new Date(eval_.evaluationDate).toLocaleDateString('fr-FR');
          doc.font('Helvetica-Bold').text(`${date} - Note: ${eval_.overallRating.toFixed(1)}/10`);
          if (eval_.notes) {
            doc.font('Helvetica').text(`  ${eval_.notes}`);
          }
          doc.moveDown(0.3);
        }
      }

      // Footer
      doc.fontSize(8).font('Helvetica')
        .text(
          `Généré le ${new Date().toLocaleDateString('fr-FR')} - VolleyCoaching - CONFIDENTIEL`,
          50, doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    });
  }

  /**
   * Generate Excel report for a team
   */
  async generateTeamExcel(teamId: string): Promise<Buffer> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: {
          include: {
            evaluations: {
              orderBy: { evaluationDate: 'desc' },
              take: 1,
            },
          },
          orderBy: { jerseyNumber: 'asc' },
        },
        coach: true,
      },
    });

    if (!team) throw new Error('Team not found');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VolleyCoaching';
    workbook.created = new Date();

    // Sheet 1: Overview
    const overviewSheet = workbook.addWorksheet('Vue d\'ensemble', {
      properties: { tabColor: { argb: '2563EB' } },
    });

    overviewSheet.columns = [
      { header: '#', key: 'number', width: 6 },
      { header: 'Joueur', key: 'name', width: 25 },
      { header: 'Poste', key: 'position', width: 18 },
      { header: 'Taille (cm)', key: 'height', width: 12 },
      { header: 'Poids (kg)', key: 'weight', width: 12 },
      { header: 'Note', key: 'rating', width: 10 },
      { header: 'Potentiel', key: 'potential', width: 10 },
      { header: 'Statut', key: 'status', width: 12 },
    ];

    // Header styling
    overviewSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    overviewSheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' },
    };

    for (const player of team.players) {
      const row = overviewSheet.addRow({
        number: player.jerseyNumber,
        name: `${player.firstName} ${player.lastName}`,
        position: player.primaryPosition,
        height: player.height || '',
        weight: player.weight || '',
        rating: player.currentRating?.toFixed(1) || 'N/A',
        potential: player.potentialRating?.toFixed(1) || 'N/A',
        status: player.status,
      });

      // Color-code rating
      if (player.currentRating) {
        const ratingCell = row.getCell('rating');
        if (player.currentRating >= 7) {
          ratingCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        } else if (player.currentRating >= 5) {
          ratingCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        } else {
          ratingCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        }
      }
    }

    // Sheet 2: Skills Detail
    const skillsSheet = workbook.addWorksheet('Détail Compétences', {
      properties: { tabColor: { argb: '22C55E' } },
    });

    skillsSheet.columns = [
      { header: 'Joueur', key: 'name', width: 25 },
      { header: 'Poste', key: 'position', width: 15 },
      { header: 'Service', key: 'serving', width: 10 },
      { header: 'Réception', key: 'passing', width: 10 },
      { header: 'Passe', key: 'setting', width: 10 },
      { header: 'Attaque', key: 'attacking', width: 10 },
      { header: 'Contre', key: 'blocking', width: 10 },
      { header: 'Défense', key: 'defense', width: 10 },
      { header: 'Forces', key: 'strengths', width: 35 },
      { header: 'Faiblesses', key: 'weaknesses', width: 35 },
    ];

    skillsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    skillsSheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: '22C55E' },
    };

    for (const player of team.players) {
      const tech = player.currentTechnical as any || {};
      skillsSheet.addRow({
        name: `${player.firstName} ${player.lastName}`,
        position: player.primaryPosition,
        serving: this.avgSkill(tech.serving),
        passing: this.avgSkill(tech.passing),
        setting: this.avgSkill(tech.setting),
        attacking: this.avgSkill(tech.attacking),
        blocking: this.avgSkill(tech.blocking),
        defense: this.avgSkill(tech.defense),
        strengths: player.strengths.join(', '),
        weaknesses: player.weaknesses.join(', '),
      });
    }

    // Sheet 3: Physical Data
    const physicalSheet = workbook.addWorksheet('Données Physiques', {
      properties: { tabColor: { argb: 'F59E0B' } },
    });

    physicalSheet.columns = [
      { header: 'Joueur', key: 'name', width: 25 },
      { header: 'Taille', key: 'height', width: 10 },
      { header: 'Poids', key: 'weight', width: 10 },
      { header: 'Allonge', key: 'reach', width: 10 },
      { header: 'Envergure', key: 'wingspan', width: 12 },
      { header: 'Main dominante', key: 'hand', width: 15 },
      { header: 'Expérience (ans)', key: 'experience', width: 16 },
    ];

    physicalSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    physicalSheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'F59E0B' },
    };

    for (const player of team.players) {
      physicalSheet.addRow({
        name: `${player.firstName} ${player.lastName}`,
        height: player.height || '',
        weight: player.weight || '',
        reach: player.armReach || '',
        wingspan: player.wingspan || '',
        hand: player.dominantHand,
        experience: player.yearsOfExperience,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private flattenSkills(data: any): [string, number][] {
    const result: [string, number][] = [];
    if (!data || typeof data !== 'object') return result;

    for (const [category, skills] of Object.entries(data)) {
      if (typeof skills === 'object' && skills !== null) {
        for (const [skill, value] of Object.entries(skills as Record<string, unknown>)) {
          if (typeof value === 'number') {
            result.push([`${category} - ${skill}`, value]);
          }
        }
      } else if (typeof skills === 'number') {
        result.push([category, skills]);
      }
    }
    return result;
  }

  private avgSkill(skillObj: any): string {
    if (!skillObj || typeof skillObj !== 'object') return 'N/A';
    const values = Object.values(skillObj).filter((v): v is number => typeof v === 'number');
    if (values.length === 0) return 'N/A';
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }
}
