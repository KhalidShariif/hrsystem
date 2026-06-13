const Setting = require('../models/Setting');

const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find();
    const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
    res.json(settingsObj);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
        await Setting.findOneAndUpdate(
            { key },
            { value, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
    }
    res.json({ message: 'Settings updated' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBranding = async (req, res, next) => {
  try {
    const branding = await Setting.findOne({ key: 'branding' });
    res.json(branding ? branding.value : { logo: null, primaryColor: '#00236F' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateBranding = async (req, res, next) => {
  try {
    const { primaryColor } = req.body;
    let brandingData = { primaryColor };

    // Find existing branding to preserve logo if not updated
    const existing = await Setting.findOne({ key: 'branding' });
    if (existing) {
      brandingData.logo = existing.value.logo;
    }

    if (req.file) {
      brandingData.logo = `/uploads/${req.file.filename}`;
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'branding' },
      { value: brandingData, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json(updated.value);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings, getBranding, updateBranding };
