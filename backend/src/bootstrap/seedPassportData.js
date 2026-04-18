/**
 * seedPassportData — seeds bonsai passport registry + certificates
 *
 * Idempotent: skips entirely if BNS-DPK-00001 already exists.
 * Registration numbers use high sequence (9901–9906) to avoid
 * conflicts with real competition entries.
 */
const { Event, Participant, Bonsai, Scoring, Certificate } = require('../models');

const SEED_BONSAI = [
  {
    passportId: 'BNS-DPK-00001',
    treeName: 'Rajawali Hijau',
    species: 'Ficus Retusa',
    ownerName: 'Ahmad Wijaya',
    phone: '081200009901',
    city: 'Depok',
    category: 'Large',
    heightCm: 65,
    estimatedAge: 35,
    style: 'Informal Upright',
    passportStatus: 'judged',
    regSeq: 9901,
    scoring: { nebari: 17.5, trunk: 17.5, branch: 16.5, composition: 17.5, pot: 15.5, total: 84.5 },
  },
  {
    passportId: 'BNS-DPK-00002',
    treeName: 'Naga Kecil',
    species: 'Juniperus Chinensis',
    ownerName: 'Siti Rahmawati',
    phone: '081200009902',
    city: 'Depok',
    category: 'Shohin',
    heightCm: 18,
    estimatedAge: 12,
    style: 'Cascade',
    passportStatus: 'judged',
    regSeq: 9902,
    scoring: { nebari: 16, trunk: 15, branch: 18, composition: 17, pot: 16, total: 82 },
  },
  {
    passportId: 'BNS-DPK-00003',
    treeName: 'Sang Penjaga',
    species: 'Pemphis Acidula',
    ownerName: 'Bambang Sutrisno',
    phone: '081200009903',
    city: 'Bogor',
    category: 'Medium',
    heightCm: 38,
    estimatedAge: 28,
    style: 'Windswept',
    passportStatus: 'approved',
    regSeq: 9903,
    scoring: null,
  },
  {
    passportId: 'BNS-DPK-00004',
    treeName: 'Bintang Senja',
    species: 'Bougainvillea Glabra',
    ownerName: 'Dewi Lestari',
    phone: '081200009904',
    city: 'Depok',
    category: 'Mame',
    heightCm: 13,
    estimatedAge: 8,
    style: 'Broom',
    passportStatus: 'registered',
    regSeq: 9904,
    scoring: null,
  },
  {
    passportId: 'BNS-DPK-00005',
    treeName: 'Permata Kecil',
    species: 'Serissa Foetida',
    ownerName: 'Rudi Hermawan',
    phone: '081200009905',
    city: 'Depok',
    category: 'Sito',
    heightCm: 8,
    estimatedAge: 5,
    style: 'Formal Upright',
    passportStatus: 'approved',
    regSeq: 9905,
    scoring: null,
  },
  {
    passportId: 'BNS-DPK-00006',
    treeName: 'Garuda Tua',
    species: 'Casuarina Equisetifolia',
    ownerName: 'Hendra Prasetyo',
    phone: '081200009906',
    city: 'Jakarta',
    category: 'Large',
    heightCm: 72,
    estimatedAge: 45,
    style: 'Twin Trunk',
    passportStatus: 'judged',
    regSeq: 9906,
    scoring: { nebari: 18.5, trunk: 18.5, branch: 17.5, composition: 18.5, pot: 17.5, total: 90.5 },
  },
];

const SEED_CERTIFICATES = [
  {
    certNumber: 'CERT-DPK-2026-001',
    passportId: 'BNS-DPK-00001',
    rank: 1,
    category: 'Large',
    eventName: 'Depok Bonsai Festival 2026',
    issueDate: '2026-04-17',
  },
  {
    certNumber: 'CERT-DPK-2026-002',
    passportId: 'BNS-DPK-00002',
    rank: 3,
    category: 'Shohin',
    eventName: 'Depok Bonsai Festival 2026',
    issueDate: '2026-04-17',
  },
  {
    certNumber: 'CERT-DPK-2026-006',
    passportId: 'BNS-DPK-00006',
    rank: 1,
    category: 'Large',
    eventName: 'Depok Bonsai Festival 2026',
    issueDate: '2026-04-17',
  },
];

const pad = (n) => String(n).padStart(4, '0');

const ensurePassportSeedData = async () => {
  // Idempotency check
  const exists = await Bonsai.findOne({ where: { passport_id: 'BNS-DPK-00001' } });
  if (exists) {
    console.log('[seed] Passport data already seeded — skipping.');
    return;
  }

  console.log('[seed] Seeding passport registry data...');

  // Find or create seed event
  const [seedEvent] = await Event.findOrCreate({
    where: { name: 'Depok Bonsai Festival 2026' },
    defaults: {
      name: 'Depok Bonsai Festival 2026',
      location: 'Balai Kota Depok',
      description: 'Event tahunan bonsai kota Depok. Data ini di-seed otomatis.',
      start_date: new Date('2026-04-15'),
      end_date: new Date('2026-04-17'),
      publish_at: new Date('2026-03-01'),
      registration_open_at: new Date('2026-04-08'),
      registration_close_at: new Date('2026-04-14'),
      status: 'finished',
    },
  });

  const bonsaiMap = {}; // passportId → Bonsai record

  for (const data of SEED_BONSAI) {
    // Participant
    const [participant] = await Participant.findOrCreate({
      where: { registration_number: `PPBI-DPK-2026-${pad(data.regSeq)}` },
      defaults: {
        event_id: seedEvent.id,
        name: data.ownerName,
        phone: data.phone,
        city: data.city,
        registration_number: `PPBI-DPK-2026-${pad(data.regSeq)}`,
        judging_number: `DBF-${data.regSeq}`,
        judging_number_status: 'confirmed',
        status: data.passportStatus === 'judged' ? 'judged'
          : data.passportStatus === 'approved' ? 'checked_in'
          : 'registered',
      },
    });

    // Bonsai
    const [bonsai] = await Bonsai.findOrCreate({
      where: { passport_id: data.passportId },
      defaults: {
        owner_id: participant.id,
        name: data.treeName,
        species: data.species,
        size_category: data.category,
        photo_url: null,
        passport_id: data.passportId,
        height_cm: data.heightCm,
        estimated_age: data.estimatedAge,
        style: data.style,
        passport_status: data.passportStatus,
      },
    });

    bonsaiMap[data.passportId] = { bonsai, participant, data };

    // Scoring (aggregate row, judge_id = null)
    if (data.scoring) {
      const existingScore = await Scoring.findOne({
        where: { participant_id: participant.id, judge_id: null },
      });
      if (!existingScore) {
        await Scoring.create({
          participant_id: participant.id,
          judging_number: participant.judging_number,
          judge_id: null,
          nebari_score: data.scoring.nebari,
          trunk_score: data.scoring.trunk,
          branch_score: data.scoring.branch,
          composition_score: data.scoring.composition,
          pot_score: data.scoring.pot,
          total_score: data.scoring.total,
        });
      }
    }
  }

  // Certificates
  for (const certData of SEED_CERTIFICATES) {
    const entry = bonsaiMap[certData.passportId];
    if (!entry) continue;

    await Certificate.findOrCreate({
      where: { certificate_number: certData.certNumber },
      defaults: {
        certificate_number: certData.certNumber,
        participant_id: entry.participant.id,
        event_id: seedEvent.id,
        bonsai_id: entry.bonsai.id,
        owner_name: entry.data.ownerName,
        tree_species: entry.data.species,
        category: certData.category,
        rank: certData.rank,
        event_name: certData.eventName,
        issue_date: certData.issueDate,
        is_verified: true,
      },
    });
  }

  console.log('[seed] Passport registry seeded: 6 bonsai, 3 certificates.');
};

module.exports = { ensurePassportSeedData };
