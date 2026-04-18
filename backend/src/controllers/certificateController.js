const { Op } = require('sequelize');
const { Certificate, Bonsai } = require('../models');

exports.verify = async (req, res) => {
  const { cert } = req.query;
  if (!cert) return res.status(400).json({ message: 'cert parameter required' });

  try {
    const certificate = await Certificate.findOne({
      where: {
        certificate_number: { [Op.iLike]: cert.trim() },
      },
      include: [
        { model: Bonsai, required: false },
      ],
    });

    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    res.json({
      certificateNumber: certificate.certificate_number,
      ownerName: certificate.owner_name,
      treeSpecies: certificate.tree_species,
      category: certificate.category,
      rank: certificate.rank,
      eventName: certificate.event_name,
      issueDate: certificate.issue_date,
      verified: certificate.is_verified,
      photoUrl: certificate.Bonsai?.photo_url || null,
    });
  } catch (error) {
    console.error('[certificate] verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      order: [['issue_date', 'DESC'], ['rank', 'ASC']],
    });

    res.json(
      certificates.map((c) => ({
        id: c.id,
        certificateNumber: c.certificate_number,
        ownerName: c.owner_name,
        treeSpecies: c.tree_species,
        category: c.category,
        rank: c.rank,
        eventName: c.event_name,
        issueDate: c.issue_date,
        verified: c.is_verified,
      }))
    );
  } catch (error) {
    console.error('[certificate] list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
