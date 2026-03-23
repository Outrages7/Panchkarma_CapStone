import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

/**
 * Get all conversations for doctor
 */
export const getConversations = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const conversations = await Conversation.find({ 'participants.doctor': doctorId })
      .populate('participants.patient', 'firstName lastName email profilePicture')
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
    const doctorId = req.user._id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify doctor is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.doctor': doctorId,
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
        receiver: doctorId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for doctor
    conversation.unreadCount.doctor = 0;
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
 * Send a message to a patient
 */
export const sendMessage = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { patientId, text } = req.body;

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
          message: 'You can only message patients you have appointments with',
        },
      });
    }

    // Verify patient exists
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
          patient: 1, // Patient has 1 unread
          doctor: 0,
        },
      });
    } else {
      // Increment patient's unread count
      conversation.unreadCount.patient += 1;
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: doctorId,
      senderRole: 'doctor',
      receiver: patientId,
      text: text.trim(),
    });

    // Update conversation's last message
    conversation.lastMessage = {
      text: text.trim(),
      sender: doctorId,
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
 * Get unread message count for doctor
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const conversations = await Conversation.find({ 'participants.doctor': doctorId });
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount.doctor, 0);

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
