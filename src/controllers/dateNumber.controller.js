const DateNumber = require("../models/dateNumber.model");

/**
 * Add or Update date & number (UPSERT)
 */
exports.addDateNumber = async (req, res) => {
  try {
    const { date, number } = req.body;

    if (!date || number === undefined) {
      return res.status(400).json({ message: "Date and number are required" });
    }

    const data = await DateNumber.findOneAndUpdate(
      { date },
      { $set: { number } },
      {
        new: true,
        upsert: true, // 🔥 ONE QUERY ONLY
        runValidators: true,
      }
    ).lean();

    res.status(201).json({
      message: "Date & number saved successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update number by date
 */
exports.updateNumber = async (req, res) => {
  try {
    const { date } = req.params;
    const { number } = req.body;

    const updated = await DateNumber.findOneAndUpdate(
      { date },
      { $set: { number } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Date not found" });
    }

    res.json({
      message: "Number updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all dates (FAST)
 */
exports.getAllDateNumbers = async (req, res) => {
  try {
    const data = await DateNumber
      .find({})
      .sort({ date: 1 }) // oldest → latest
      .lean(); // 🔥 FAST

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
