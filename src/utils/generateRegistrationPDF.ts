import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface RegistrationEntry {
  participant: {
    registrationNumber: string;
    judgingNumber: string;
    judgingNumberStatus: string;
    status: string;
  };
  bonsai: {
    name: string;
    species: string;
    sizeCategory?: string;
    accessories?: string[];
  };
}

export interface RegistrationPDFData {
  eventName: string;
  eventLocation: string;
  eventStartDate: string;
  ownerName: string;
  ownerCity: string;
  ownerPhone: string;
  registrations: RegistrationEntry[];
}

// ─── Color helpers ────────────────────────────────────────────────────────────
type RGB = [number, number, number];
const C = {
  green:      [4, 120, 87]      as RGB, // emerald-700
  greenLight: [209, 250, 229]   as RGB, // emerald-100
  greenDim:   [16, 185, 129]    as RGB, // emerald-500
  dark:       [17, 24, 39]      as RGB, // gray-900
  muted:      [107, 114, 128]   as RGB, // gray-500
  mutedBg:    [249, 250, 251]   as RGB, // gray-50
  border:     [229, 231, 235]   as RGB, // gray-200
  amberBg:    [255, 251, 235]   as RGB, // amber-50
  amberBorder:[251, 191, 36]    as RGB, // amber-400
  amberText:  [120, 53, 15]     as RGB, // amber-900
  white:      [255, 255, 255]   as RGB,
};

export async function generateRegistrationPDF(data: RegistrationPDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  let y = 0;

  // ─── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(...C.green);
  doc.rect(0, 0, W, 42, 'F');

  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('PERKUMPULAN PENGGEMAR BONSAI INDONESIA  —  CABANG KOTA DEPOK', W / 2, 11, { align: 'center' });

  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('BUKTI PENDAFTARAN PESERTA', W / 2, 23, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.eventName, W / 2, 32, { align: 'center' });

  doc.setFontSize(8);
  doc.text(`${data.eventLocation}  ·  ${data.eventStartDate}`, W / 2, 38, { align: 'center' });

  // ─── Participant info box ────────────────────────────────────────────────────
  y = 50;

  doc.setFillColor(...C.greenLight);
  doc.roundedRect(14, y, W - 28, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.green);
  doc.text('PESERTA', 20, y + 6);
  doc.text('KOTA', 90, y + 6);
  doc.text('NO. TELEPON', 140, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.dark);
  doc.text(data.ownerName, 20, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.ownerCity, 90, y + 14);
  doc.text(data.ownerPhone, 140, y + 14);

  // ─── Bonsai cards ───────────────────────────────────────────────────────────
  y = 80;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text('DAFTAR POHON YANG DIDAFTARKAN', 14, y);

  y += 5;

  for (let i = 0; i < data.registrations.length; i++) {
    const reg = data.registrations[i];
    const cardH = reg.bonsai.accessories && reg.bonsai.accessories.length > 0 ? 36 : 30;

    // Card background
    doc.setFillColor(...C.mutedBg);
    doc.setDrawColor(...C.border);
    doc.roundedRect(14, y, W - 28, cardH, 2, 2, 'FD');

    // Card number badge
    doc.setFillColor(...C.green);
    doc.roundedRect(14, y, 16, cardH, 2, 2, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(String(i + 1), 22, y + cardH / 2 + 5, { align: 'center' });

    // Tree name & species
    doc.setTextColor(...C.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(reg.bonsai.name, 35, y + 9);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.muted);
    doc.text(reg.bonsai.species, 35, y + 15);

    // Size category & accessories
    let detailY = y + 21;
    if (reg.bonsai.sizeCategory) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(`Kategori: ${reg.bonsai.sizeCategory}`, 35, detailY);
      detailY += 5;
    }
    if (reg.bonsai.accessories && reg.bonsai.accessories.length > 0) {
      doc.text(`Perlengkapan: ${reg.bonsai.accessories.join(', ')}`, 35, detailY);
    }

    // Divider
    doc.setDrawColor(...C.border);
    doc.line(115, y + 4, 115, y + cardH - 4);

    // Registration number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text('NOMOR REGISTRASI', 120, y + 8);

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.green);
    doc.text(reg.participant.registrationNumber, 120, y + 16);

    // Judging number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text('NOMOR PENJURIAN', 120, y + 24);

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.greenDim);
    doc.text(reg.participant.judgingNumber, 120, y + 31);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    const statusLabel = reg.participant.judgingNumberStatus === 'confirmed' ? '● Dikonfirmasi' : '○ Reserved (dikonfirmasi saat check-in)';
    doc.text(statusLabel, 120, y + cardH - 4);

    y += cardH + 4;
  }

  // ─── QR Code + portal link ───────────────────────────────────────────────────
  y += 4;

  const portalUrl = `${window.location.origin}/peserta?reg=${data.registrations[0].participant.registrationNumber}`;
  const qrDataUrl = await QRCode.toDataURL(portalUrl, {
    width: 120,
    margin: 1,
    color: { dark: '#047857', light: '#FFFFFF' },
  });

  doc.setFillColor(...C.mutedBg);
  doc.setDrawColor(...C.border);
  doc.roundedRect(14, y, W - 28, 34, 2, 2, 'FD');

  doc.addImage(qrDataUrl, 'PNG', 18, y + 2, 30, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text('Cek status pendaftaran kapan saja', 53, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text('Scan QR code atau kunjungi:', 53, y + 17);

  doc.setTextColor(...C.green);
  doc.setFont('helvetica', 'bold');
  doc.text(portalUrl, 53, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text('Cari dengan nomor telepon, nomor registrasi, atau nomor penjurian.', 53, y + 30);

  // ─── Instructions box ────────────────────────────────────────────────────────
  y += 42;

  doc.setFillColor(...C.amberBg);
  doc.setDrawColor(...C.amberBorder);
  doc.roundedRect(14, y, W - 28, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.amberText);
  doc.text('PENTING — Harap simpan dokumen ini', 20, y + 8);

  const notes = [
    'Tunjukkan nomor registrasi saat proses check-in di lokasi event.',
    'Nomor penjurian akan dikonfirmasi oleh panitia setelah check-in selesai.',
    'Jika kehilangan nomor, gunakan QR di atas atau cek di portal peserta dengan nomor HP.',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  notes.forEach((note, i) => {
    doc.text(`${i + 1}.  ${note}`, 20, y + 14 + i * 4.5);
  });

  // ─── Footer ──────────────────────────────────────────────────────────────────
  const footerY = 282;
  doc.setDrawColor(...C.greenLight);
  doc.line(14, footerY, W - 14, footerY);

  const now = new Date();
  const printed = now.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(`Dicetak: ${printed}`, 14, footerY + 5);
  doc.text('PPBI Depok — Bonsai Registry & Competition Platform', W / 2, footerY + 5, { align: 'center' });
  doc.text('Dokumen resmi, tidak perlu tanda tangan', W - 14, footerY + 5, { align: 'right' });

  // ─── Save ────────────────────────────────────────────────────────────────────
  const filename = `Bukti-Daftar-${data.registrations[0].participant.registrationNumber}.pdf`;
  doc.save(filename);
}
