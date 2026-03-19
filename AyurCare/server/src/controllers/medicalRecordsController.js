import Allergy from '../models/Allergy.js';
import Medication from '../models/Medication.js';
import LabResult from '../models/LabResult.js';
import VitalSign from '../models/VitalSign.js';
import User from '../models/User.js';

/**
 * Get all allergies for the patient
 */
export const getAllergies = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const allergies = await Allergy.find({
      patient: patientId,
      isActive: true,
    })
      .populate('addedBy', 'firstName lastName specialization')
      .sort({ severity: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: allergies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add new allergy
 */
export const addAllergy = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { allergen, severity, reaction, diagnosedDate, notes } = req.body;

    const allergy = await Allergy.create({
      patient: patientId,
      allergen,
      severity,
      reaction,
      diagnosedDate,
      notes,
      addedBy: patientId,
      addedByRole: 'patient',
    });

    await allergy.populate('addedBy', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      data: allergy,
      message: 'Allergy added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete allergy (soft delete)
 */
export const deleteAllergy = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;

    const allergy = await Allergy.findOne({ _id: id, patient: patientId });

    if (!allergy) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ALLERGY_NOT_FOUND',
          message: 'Allergy not found',
        },
      });
    }

    allergy.isActive = false;
    await allergy.save();

    res.status(200).json({
      success: true,
      message: 'Allergy removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all medications for the patient
 */
export const getMedications = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const medications = await Medication.find({ patient: patientId })
      .populate('prescribingDoctor', 'firstName lastName specialization')
      .populate('relatedAppointment', 'date type')
      .sort({ status: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: medications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request discontinuation of medication
 */
export const requestDiscontinueMedication = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const medication = await Medication.findOne({ _id: id, patient: patientId });

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEDICATION_NOT_FOUND',
          message: 'Medication not found',
        },
      });
    }

    if (medication.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MEDICATION_NOT_ACTIVE',
          message: 'Medication is not active',
        },
      });
    }

    medication.discontinuedReason = `Patient requested: ${reason || 'No reason provided'}`;
    medication.notes = `${medication.notes || ''}\n[Patient requested discontinuation on ${new Date().toLocaleDateString()}]`;
    await medication.save();

    res.status(200).json({
      success: true,
      message: 'Discontinuation request submitted. Your doctor will review it.',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get lab results for the patient
 */
export const getLabResults = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const [labResults, total] = await Promise.all([
      LabResult.find({ patient: patientId })
        .populate('orderingDoctor', 'firstName lastName specialization')
        .populate('relatedAppointment', 'date type')
        .sort({ resultDate: -1, orderedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LabResult.countDocuments({ patient: patientId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        labResults,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single lab result details
 */
export const getLabResultDetails = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;

    const labResult = await LabResult.findOne({ _id: id, patient: patientId })
      .populate('orderingDoctor', 'firstName lastName specialization')
      .populate('relatedAppointment', 'date type');

    if (!labResult) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LAB_RESULT_NOT_FOUND',
          message: 'Lab result not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: labResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vital signs for the patient
 */
export const getVitalSigns = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = { patient: patientId };

    if (startDate || endDate) {
      query.recordedDate = {};
      if (startDate) query.recordedDate.$gte = new Date(startDate);
      if (endDate) query.recordedDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [vitalSigns, total] = await Promise.all([
      VitalSign.find(query)
        .populate('recordedBy', 'firstName lastName')
        .populate('relatedAppointment', 'date type')
        .sort({ recordedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VitalSign.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        vitalSigns,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add vital sign (patient self-recording)
 */
export const addVitalSign = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const {
      recordedDate,
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      oxygenSaturation,
      notes,
    } = req.body;

    const vitalSign = await VitalSign.create({
      patient: patientId,
      recordedDate: recordedDate || Date.now(),
      recordedBy: patientId,
      recordedByRole: 'patient',
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      oxygenSaturation,
      notes,
    });

    await vitalSign.populate('recordedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: vitalSign,
      message: 'Vital signs recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get medical history
 */
export const getMedicalHistory = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const user = await User.findById(patientId)
      .select('medicalHistory')
      .populate('medicalHistory.treatingDoctor', 'firstName lastName specialization')
      .populate('medicalHistory.addedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: user?.medicalHistory || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get medical records summary (all records in one call)
 */
export const getMedicalRecordsSummary = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const [allergies, medications, labResults, vitalSigns, user] = await Promise.all([
      Allergy.find({ patient: patientId, isActive: true })
        .populate('addedBy', 'firstName lastName')
        .sort({ severity: -1 })
        .limit(20),
      Medication.find({ patient: patientId, status: 'active' })
        .populate('prescribingDoctor', 'firstName lastName specialization')
        .sort({ createdAt: -1 })
        .limit(20),
      LabResult.find({ patient: patientId })
        .populate('orderingDoctor', 'firstName lastName specialization')
        .sort({ resultDate: -1 })
        .limit(10),
      VitalSign.find({ patient: patientId })
        .populate('recordedBy', 'firstName lastName')
        .sort({ recordedDate: -1 })
        .limit(20),
      User.findById(patientId)
        .select('medicalHistory')
        .populate('medicalHistory.treatingDoctor', 'firstName lastName specialization')
        .populate('medicalHistory.addedBy', 'firstName lastName'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        allergies,
        medications,
        labResults,
        vitalSigns,
        medicalHistory: user?.medicalHistory || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
