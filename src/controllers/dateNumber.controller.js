const DateNumber = require("../models/dateNumber.model");

/**
 * Add date & number
 */
exports.addDateNumber = async (req, res) => {
  try {
    const { date, number } = req.body;

    const exists = await DateNumber.findOne({ date });
    if (exists) {
      return res.status(400).json({
        message: "Date already exists",
      });
    }

    const data = await DateNumber.create({ date, number });

    res.status(201).json({
      message: "Date & number added successfully",
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
      { number },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Date not found",
      });
    }

    res.json({
      message: "Number updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
