import Allergy from '../models/Allergy.js';
import Medication from '../models/Medication.js';
import LabResult from '../models/LabResult.js';
import VitalSign from '../models/VitalSign.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

/**
 * Add allergy for patient
 */
export const addPatientAllergy = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    const { allergen, severity, reaction, diagnosedDate, notes } = req.body;

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found',
        },
      });
    }

    const allergy = await Allergy.create({
      patient: patientId,
      allergen,
      severity,
      reaction,
      diagnosedDate,
      notes,
      addedBy: doctorId,
      addedByRole: 'doctor',
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
 * Update patient allergy
 */
export const updatePatientAllergy = async (req, res, next) => {
  try {
    const { patientId, allergyId } = req.params;
    const { allergen, severity, reaction, diagnosedDate, notes, isActive } = req.body;

    const allergy = await Allergy.findOne({ _id: allergyId, patient: patientId });

    if (!allergy) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ALLERGY_NOT_FOUND',
          message: 'Allergy not found',
        },
      });
    }

    if (allergen) allergy.allergen = allergen;
    if (severity) allergy.severity = severity;
    if (reaction) allergy.reaction = reaction;
    if (diagnosedDate) allergy.diagnosedDate = diagnosedDate;
    if (notes !== undefined) allergy.notes = notes;
    if (isActive !== undefined) allergy.isActive = isActive;

    await allergy.save();
    await allergy.populate('addedBy', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: allergy,
      message: 'Allergy updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete patient allergy
 */
export const deletePatientAllergy = async (req, res, next) => {
  try {
    const { patientId, allergyId } = req.params;

    const allergy = await Allergy.findOne({ _id: allergyId, patient: patientId });

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
 * Prescribe medication
 */
export const prescribeMedication = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    const {
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      instructions,
      relatedAppointmentId,
      notes,
    } = req.body;

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found',
        },
      });
    }

    const medication = await Medication.create({
      patient: patientId,
      medicationName,
      dosage,
      frequency,
      prescribingDoctor: doctorId,
      prescribedDate: new Date(),
      startDate,
      endDate,
      status: 'active',
      instructions,
      relatedAppointment: relatedAppointmentId,
      notes,
    });

    await medication.populate('prescribingDoctor', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      data: medication,
      message: 'Medication prescribed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update medication
 */
export const updateMedication = async (req, res, next) => {
  try {
    const { patientId, medicationId } = req.params;
    const { dosage, frequency, endDate, instructions, notes, status } = req.body;

    const medication = await Medication.findOne({ _id: medicationId, patient: patientId });

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEDICATION_NOT_FOUND',
          message: 'Medication not found',
        },
      });
    }

    if (dosage) medication.dosage = dosage;
    if (frequency) medication.frequency = frequency;
    if (endDate !== undefined) medication.endDate = endDate;
    if (instructions !== undefined) medication.instructions = instructions;
    if (notes !== undefined) medication.notes = notes;
    if (status) medication.status = status;

    await medication.save();
    await medication.populate('prescribingDoctor', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: medication,
      message: 'Medication updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Discontinue medication
 */
export const discontinueMedication = async (req, res, next) => {
  try {
    const { patientId, medicationId } = req.params;
    const { reason } = req.body;

    const medication = await Medication.findOne({ _id: medicationId, patient: patientId });

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEDICATION_NOT_FOUND',
          message: 'Medication not found',
        },
      });
    }

    medication.status = 'discontinued';
    medication.discontinuedDate = new Date();
    medication.discontinuedReason = reason || 'Discontinued by doctor';

    await medication.save();
    await medication.populate('prescribingDoctor', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: medication,
      message: 'Medication discontinued successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create lab order
 */
export const createLabOrder = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    const { labOrderName, tests, orderedDate, relatedAppointmentId, notes } = req.body;

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found',
        },
      });
    }

    const labResult = await LabResult.create({
      patient: patientId,
      orderingDoctor: doctorId,
      labOrderName,
      orderedDate: orderedDate || new Date(),
      tests: tests || [],
      overallStatus: tests && tests.length > 0 ? 'partial' : 'pending',
      relatedAppointment: relatedAppointmentId,
      notes,
    });

    await labResult.populate('orderingDoctor', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      data: labResult,
      message: 'Lab order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lab results
 */
export const updateLabResults = async (req, res, next) => {
  try {
    const { patientId, labResultId } = req.params;
    const { collectionDate, resultDate, overallStatus, notes, tests } = req.body;

    const labResult = await LabResult.findOne({ _id: labResultId, patient: patientId });

    if (!labResult) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LAB_RESULT_NOT_FOUND',
          message: 'Lab result not found',
        },
      });
    }

    if (collectionDate !== undefined) labResult.collectionDate = collectionDate;
    if (resultDate !== undefined) labResult.resultDate = resultDate;
    if (overallStatus) labResult.overallStatus = overallStatus;
    if (notes !== undefined) labResult.notes = notes;
    if (tests) labResult.tests = tests;

    await labResult.save();
    await labResult.populate('orderingDoctor', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: labResult,
      message: 'Lab results updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add test results to existing lab order
 */
export const addTestResults = async (req, res, next) => {
  try {
    const { patientId, labResultId } = req.params;
    const { tests } = req.body;

    const labResult = await LabResult.findOne({ _id: labResultId, patient: patientId });

    if (!labResult) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LAB_RESULT_NOT_FOUND',
          message: 'Lab result not found',
        },
      });
    }

    if (tests && Array.isArray(tests)) {
      labResult.tests.push(...tests);
      labResult.overallStatus = 'partial';
    }

    await labResult.save();
    await labResult.populate('orderingDoctor', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: labResult,
      message: 'Test results added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record vital signs for patient
 */
export const recordVitalSigns = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    const {
      recordedDate,
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      oxygenSaturation,
      relatedAppointmentId,
      notes,
    } = req.body;

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found',
        },
      });
    }

    const vitalSign = await VitalSign.create({
      patient: patientId,
      recordedDate: recordedDate || new Date(),
      recordedBy: doctorId,
      recordedByRole: 'doctor',
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      oxygenSaturation,
      relatedAppointment: relatedAppointmentId,
      notes,
    });

    await vitalSign.populate('recordedBy', 'firstName lastName specialization');

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
 * Add medical history entry
 */
export const addMedicalHistory = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    const { condition, diagnosedDate, status, severity, notes } = req.body;

    const patient = await User.findOne({ _id: patientId, role: 'patient' });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found',
        },
      });
    }

    patient.medicalHistory.push({
      condition,
      diagnosedDate,
      status: status || 'active',
      severity,
      treatingDoctor: doctorId,
      notes,
      addedBy: doctorId,
      addedDate: new Date(),
    });

    await patient.save();
    await patient.populate('medicalHistory.treatingDoctor', 'firstName lastName specialization');
    await patient.populate('medicalHistory.addedBy', 'firstName lastName');

    const addedEntry = patient.medicalHistory[patient.medicalHistory.length - 1];

    res.status(201).json({
      success: true,
      data: addedEntry,
      message: 'Medical history added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update medical history entry
 */
export const updateMedicalHistory = async (req, res, next) => {
  try {
    const { patientId, historyId } = req.params;
    const { condition, diagnosedDate, status, severity, notes } = req.body;

    const patient = await User.findOne({ _id: patientId, role: 'patient' });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found',
        },
      });
    }

    const historyEntry = patient.medicalHistory.id(historyId);

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HISTORY_NOT_FOUND',
          message: 'Medical history entry not found',
        },
      });
    }

    if (condition) historyEntry.condition = condition;
    if (diagnosedDate) historyEntry.diagnosedDate = diagnosedDate;
    if (status) historyEntry.status = status;
    if (severity) historyEntry.severity = severity;
    if (notes !== undefined) historyEntry.notes = notes;

    await patient.save();
    await patient.populate('medicalHistory.treatingDoctor', 'firstName lastName specialization');
    await patient.populate('medicalHistory.addedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: historyEntry,
      message: 'Medical history updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all medications prescribed by this doctor
 */
export const getAllPrescribedMedications = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { status, page = 1, limit = 50 } = req.query;

    const query = { prescribingDoctor: doctorId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [medications, total] = await Promise.all([
      Medication.find(query)
        .populate('patient', 'firstName lastName email dateOfBirth')
        .populate('relatedAppointment', 'date type')
        .sort({ prescribedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Medication.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        medications,
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
 * Get medication statistics for this doctor
 */
export const getMedicationStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const [totalPrescribed, activeMedications, discontinuedMedications, completedMedications] =
      await Promise.all([
        Medication.countDocuments({ prescribingDoctor: doctorId }),
        Medication.countDocuments({ prescribingDoctor: doctorId, status: 'active' }),
        Medication.countDocuments({ prescribingDoctor: doctorId, status: 'discontinued' }),
        Medication.countDocuments({ prescribingDoctor: doctorId, status: 'completed' }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalPrescribed,
        activeMedications,
        discontinuedMedications,
        completedMedications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get complete patient chart (all medical records)
 */
export const getPatientChart = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    const patient = await User.findOne({ _id: patientId, role: 'patient' }).select(
      'firstName lastName email dateOfBirth gender medicalHistory'
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found',
        },
      });
    }

    const [allergies, medications, labResults, vitalSigns, appointments] = await Promise.all([
      Allergy.find({ patient: patientId, isActive: true })
        .populate('addedBy', 'firstName lastName')
        .sort({ severity: -1 }),
      Medication.find({ patient: patientId })
        .populate('prescribingDoctor', 'firstName lastName specialization')
        .sort({ status: 1, createdAt: -1 }),
      LabResult.find({ patient: patientId })
        .populate('orderingDoctor', 'firstName lastName specialization')
        .sort({ resultDate: -1 })
        .limit(20),
      VitalSign.find({ patient: patientId })
        .populate('recordedBy', 'firstName lastName')
        .sort({ recordedDate: -1 })
        .limit(30),
      Appointment.find({ patient: patientId, doctor: doctorId })
        .select('date status type diagnosis')
        .sort({ date: -1 })
        .limit(10),
    ]);

    await patient.populate('medicalHistory.treatingDoctor', 'firstName lastName specialization');
    await patient.populate('medicalHistory.addedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: {
        patient,
        allergies,
        medications,
        labResults,
        vitalSigns,
        recentAppointments: appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
