import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

/**
 * Get all conversations for patient
 */
export const getConversations = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const conversations = await Conversation.find({ 'participants.patient': patientId })
      .populate('participants.doctor', 'firstName lastName specialization profilePicture')
      .populate('lastMessage.sender', 'firstName lastName')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for a specific conversation
 */
export const getMessages = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify patient is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.patient': patientId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversation not found or access denied',
        },
      });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'firstName lastName role');

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: patientId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for patient
    conversation.unreadCount.patient = 0;
    await conversation.save();

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Oldest first for display
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message to a doctor
 */
export const sendMessage = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message text is required',
        },
      });
    }

    // Verify appointment relationship exists
    const appointment = await Appointment.findOne({
      patient: patientId,
      doctor: doctorId,
    });

    if (!appointment) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_APPOINTMENT_RELATIONSHIP',
          message: 'You can only message doctors you have appointments with',
        },
      });
    }

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCTOR_NOT_FOUND',
          message: 'Doctor not found',
        },
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      'participants.patient': patientId,
      'participants.doctor': doctorId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: {
          patient: patientId,
          doctor: doctorId,
        },
        relatedAppointment: appointment._id,
        unreadCount: {
          patient: 0,
          doctor: 1, // Doctor has 1 unread
        },
      });
    } else {
      // Increment doctor's unread count
      conversation.unreadCount.doctor += 1;
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: patientId,
      senderRole: 'patient',
      receiver: doctorId,
      text: text.trim(),
    });

    // Update conversation's last message
    conversation.lastMessage = {
      text: text.trim(),
      sender: patientId,
      timestamp: new Date(),
    };
    await conversation.save();

    await message.populate('sender', 'firstName lastName role');

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread message count for patient
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const conversations = await Conversation.find({ 'participants.patient': patientId });
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount.patient, 0);

    res.status(200).json({
      success: true,
      data: {
        unreadCount: totalUnread,
      },
    });
  } catch (error) {
    next(error);
  }
};
