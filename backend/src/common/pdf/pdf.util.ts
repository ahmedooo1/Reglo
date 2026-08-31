import * as PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { LineItem, computeTotals } from '../billing/billing.util';

export interface DocumentPdfData {
  type: 'devis' | 'facture';
  number: string;
  date: Date;
  dueOrValidDate?: Date;
  company: {
    companyName?: string;
    address?: string;
    siret?: string;
    vatNumber?: string;
    iban?: string;
    email?: string;
  };
  client: {
    name: string;
    address?: string;
    email?: string;
    siret?: string;
  };
  items: LineItem[];
  notes?: string;
  // Devis only -- when set, replaces the generic "sous reserve
  // d'acceptation ecrite" footer with the actual e-signature proof.
  acceptance?: { name: string; at: Date; ip?: string };
}

function formatEur(cents: number) {
  // toLocaleString('fr-FR') groups thousands with U+202F (narrow no-break
  // space), which PDFKit's base Helvetica font (WinAnsi encoding) has no
  // glyph for -- it was rendering as a stray "/" on any amount >= 1000.
  // Swap it (and the regular no-break space, same issue) for a plain space.
  const amount = (cents / 100)
    .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/[\u202f\u00a0]/g, ' ');
  return `${amount} \u20ac`;
}

export function generateDocumentPdf(data: DocumentPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    doc.pipe(stream);

    const ink = '#14171F';
    const indigo = '#2A3B8F';
    const gray = '#6B7280';
    const emerald = '#1F9D6D';

    // En-tete
    doc
      .fillColor(indigo)
      .font('Helvetica-Bold')
      .fontSize(20)
      .text(data.company.companyName || 'Mon entreprise', 50, 50);

    doc
      .fillColor(gray)
      .font('Helvetica')
      .fontSize(9)
      .text(data.company.address || '', 50, 75, { width: 250 });

    const companyMeta: string[] = [];
    if (data.company.siret) companyMeta.push(`SIRET: ${data.company.siret}`);
    if (data.company.vatNumber) companyMeta.push(`TVA: ${data.company.vatNumber}`);
    if (companyMeta.length) doc.text(companyMeta.join(' · '), 50, doc.y + 2, { width: 250 });

    const docLabel = data.type === 'devis' ? 'DEVIS' : 'FACTURE';
    doc
      .fillColor(ink)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text(docLabel, 350, 50, { width: 200, align: 'right' });

    doc
      .fillColor(gray)
      .font('Helvetica')
      .fontSize(10)
      .text(`N° ${data.number}`, 350, 78, { width: 200, align: 'right' })
      .text(`Date: ${data.date.toLocaleDateString('fr-FR')}`, 350, 92, { width: 200, align: 'right' });

    if (data.dueOrValidDate) {
      const label = data.type === 'devis' ? "Valable jusqu'au" : 'Échéance';
      doc.text(`${label}: ${data.dueOrValidDate.toLocaleDateString('fr-FR')}`, 350, 106, {
        width: 200,
        align: 'right',
      });
    }

    // Bloc client
    let y = 160;
    doc.fillColor(gray).fontSize(9).text('Adresse a', 50, y);
    y += 14;
    doc.fillColor(ink).font('Helvetica-Bold').fontSize(11).text(data.client.name, 50, y);
    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor(gray);
    if (data.client.address) {
      doc.text(data.client.address, 50, y, { width: 250 });
      y = doc.y;
    }
    if (data.client.siret) {
      doc.text(`SIRET: ${data.client.siret}`, 50, y + 2);
    }

    // Tableau des lignes
    const totals = computeTotals(data.items);
    let tableY = 250;
    const colX = { desc: 50, qty: 300, pu: 350, tva: 420, total: 470 };

    doc
      .fillColor('#FFFFFF')
      .rect(50, tableY, 500, 22)
      .fill(indigo);
    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Description', colX.desc + 8, tableY + 6)
      .text('Qte', colX.qty, tableY + 6, { width: 40, align: 'right' })
      .text('PU HT', colX.pu, tableY + 6, { width: 60, align: 'right' })
      .text('TVA', colX.tva, tableY + 6, { width: 40, align: 'right' })
      .text('Total HT', colX.total, tableY + 6, { width: 70, align: 'right' });

    tableY += 22;
    doc.font('Helvetica').fontSize(9);
    for (const item of data.items) {
      const lineTotal = Math.round(item.quantity * item.unitPriceCents);
      const rowHeight = 22;
      doc.fillColor(ink);
      doc.text(item.description, colX.desc + 8, tableY + 6, { width: 240 });
      doc.text(String(item.quantity), colX.qty, tableY + 6, { width: 40, align: 'right' });
      doc.text(formatEur(item.unitPriceCents), colX.pu, tableY + 6, { width: 60, align: 'right' });
      doc.text(`${item.vatRate}%`, colX.tva, tableY + 6, { width: 40, align: 'right' });
      doc.text(formatEur(lineTotal), colX.total, tableY + 6, { width: 70, align: 'right' });
      doc
        .strokeColor('#E5E7EB')
        .moveTo(50, tableY + rowHeight)
        .lineTo(550, tableY + rowHeight)
        .stroke();
      tableY += rowHeight;
    }

    // Totaux
    tableY += 14;
    const totalsX = 350;
    doc.font('Helvetica').fontSize(10).fillColor(gray);
    doc.text('Sous-total HT', totalsX, tableY, { width: 120 });
    doc.fillColor(ink).text(formatEur(totals.subtotalCents), totalsX + 120, tableY, { width: 80, align: 'right' });
    tableY += 16;

    for (const vat of totals.vatBreakdown) {
      doc.fillColor(gray).text(`TVA (${vat.rate}%)`, totalsX, tableY, { width: 120 });
      doc.fillColor(ink).text(formatEur(vat.vatCents), totalsX + 120, tableY, { width: 80, align: 'right' });
      tableY += 16;
    }

    doc
      .fillColor(indigo)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Total TTC', totalsX, tableY + 4, { width: 120 });
    doc.text(formatEur(totals.totalCents), totalsX + 120, tableY + 4, { width: 80, align: 'right' });

    // Notes
    tableY += 50;
    if (data.notes) {
      doc.font('Helvetica').fontSize(9).fillColor(gray).text(data.notes, 50, tableY, { width: 500 });
      tableY = doc.y + 20;
    }

    // Pied de page legal
    const footerY = 740;
    doc.font('Helvetica').fontSize(7.5).fillColor(gray);
    if (data.type === 'facture') {
      doc.text(
        "En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de recouvrement de 40 €.",
        50,
        footerY,
        { width: 500 },
      );
      if (data.company.iban) {
        doc.text(`IBAN pour règlement : ${data.company.iban}`, 50, doc.y + 4, { width: 500 });
      }
    } else if (data.acceptance) {
      const dateLabel = data.acceptance.at.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
      doc
        .font('Helvetica-Bold')
        .fillColor(emerald)
        .text(`✓ Devis accepté électroniquement par ${data.acceptance.name}, le ${dateLabel}.`, 50, footerY, {
          width: 500,
        });
      if (data.acceptance.ip) {
        doc.font('Helvetica').fillColor(gray).fontSize(7.5).text(`Adresse IP : ${data.acceptance.ip}`, 50, doc.y + 2, { width: 500 });
      }
    } else {
      doc.text("Devis valable sous réserve d'acceptation écrite du client dans le délai indiqué ci-dessus.", 50, footerY, {
        width: 500,
      });
    }

    doc.end();
  });
}
