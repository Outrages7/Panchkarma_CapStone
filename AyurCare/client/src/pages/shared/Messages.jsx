import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { getSpecializationLabel } from '../../utils/specializations';
import {
  FaPaperPlane,
  FaCommentMedical,
  FaSync,
  FaUserMd,
  FaUser,
  FaCheck,
  FaCheckDouble,
} from 'react-icons/fa';

const Messages = () => {
  const { user } = useSelector((state) => state.auth);
  const isDoctor = user?.role === 'doctor';

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [isDoctor]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConversation._id);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const endpoint = isDoctor ? '/doctor/messages/conversations' : '/patient/messages/conversations';
      const response = await api.get(endpoint);
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const endpoint = isDoctor
        ? `/doctor/messages/conversations/${conversationId}`
        : `/patient/messages/conversations/${conversationId}`;
      const response = await api.get(endpoint);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const endpoint = isDoctor ? '/doctor/messages/send' : '/patient/messages/send';
      const recipientKey = isDoctor ? 'patientId' : 'doctorId';
      const recipientId = isDoctor
        ? selectedConversation.participants.patient._id
        : selectedConversation.participants.doctor._id;

      const response = await api.post(endpoint, {
        [recipientKey]: recipientId,
        text: messageText,
      });

      setMessages((prev) => [...prev, response.data.data]);
      setMessageText('');
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getParticipant = (conversation) => {
    return isDoctor ? conversation.participants.patient : conversation.participants.doctor;
  };

  const getUnreadCount = (conversation) => {
    return isDoctor ? conversation.unreadCount?.doctor || 0 : conversation.unreadCount?.patient || 0;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8 mt-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
            <FaCommentMedical className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Messages
            </h1>
            <p className="text-stone-400 font-medium">
              {isDoctor ? 'Communicate with your patients securely' : 'Chat with your doctors directly'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 20rem)' }}>
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className={`w-full md:w-[340px] border-r border-stone-200 flex flex-col bg-stone-50/50 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {/* Sidebar Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">Conversations</h2>
              <button
                onClick={fetchConversations}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <FaSync className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-stone-400"></div>
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const participant = getParticipant(conversation);
                  const unreadCount = getUnreadCount(conversation);
                  const isSelected = selectedConversation?._id === conversation._id;

                  return (
                    <button
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full px-5 py-4 border-b border-stone-100 hover:bg-white transition-colors text-left ${
                        isSelected ? 'bg-emerald-50/60 border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}>
                          {participant?.firstName?.charAt(0)}{participant?.lastName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-bold text-sm truncate ${isSelected ? 'text-emerald-800' : 'text-stone-800'}`}>
                              {isDoctor ? '' : 'Dr. '}
                              {participant?.firstName} {participant?.lastName}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              {conversation.lastMessage?.timestamp && (
                                <span className="text-[10px] font-semibold text-stone-400 uppercase">
                                  {formatTimestamp(conversation.lastMessage.timestamp)}
                                </span>
                              )}
                              {unreadCount > 0 && (
                                <span className="min-w-[20px] h-5 flex items-center justify-center bg-emerald-500 text-white text-[10px] font-black rounded-full px-1.5">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-stone-500 truncate mt-0.5 font-medium">
                            {!isDoctor && participant?.specialization && (
                              <span className="text-stone-400">{getSpecializationLabel(participant.specialization)} · </span>
                            )}
                            {conversation.lastMessage?.text || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaCommentMedical className="w-6 h-6 text-stone-300" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800 mb-1">No conversations</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {isDoctor
                      ? 'Patient conversations will appear here'
                      : 'Book an appointment to start messaging your doctor'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {getParticipant(selectedConversation)?.firstName?.charAt(0)}
                    {getParticipant(selectedConversation)?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">
                      {isDoctor ? '' : 'Dr. '}
                      {getParticipant(selectedConversation)?.firstName}{' '}
                      {getParticipant(selectedConversation)?.lastName}
                    </h3>
                    <p className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                      {isDoctor ? (
                        <><FaUser className="w-2.5 h-2.5" /> Patient</>
                      ) : (
                        <><FaUserMd className="w-2.5 h-2.5" /> {getSpecializationLabel(getParticipant(selectedConversation)?.specialization) || 'Doctor'}</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-5 bg-stone-50/30">
                  {messages.length > 0 ? (
                    Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                      <div key={dateKey}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-5">
                          <div className="bg-stone-200/60 text-stone-500 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                            {formatMessageDate(msgs[0].createdAt)}
                          </div>
                        </div>

                        {msgs.map((message) => {
                          const isMyMessage = message.sender?._id === user?._id || message.sender === user?._id;
                          return (
                            <div
                              key={message._id}
                              className={`flex mb-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                                <div
                                  className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                                    isMyMessage
                                      ? 'bg-emerald-600 text-white rounded-br-md'
                                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-md shadow-sm'
                                  }`}
                                >
                                  {message.text}
                                </div>
                                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] font-semibold text-stone-400">
                                    {formatMessageTime(message.createdAt)}
                                  </span>
                                  {isMyMessage && (
                                    message.isRead
                                      ? <FaCheckDouble className="w-2.5 h-2.5 text-emerald-500" />
                                      : <FaCheck className="w-2.5 h-2.5 text-stone-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <FaCommentMedical className="w-6 h-6 text-stone-300" />
                        </div>
                        <p className="text-sm font-semibold text-stone-400">No messages yet</p>
                        <p className="text-xs text-stone-400 mt-0.5">Start the conversation!</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="px-5 py-4 border-t border-stone-200 bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-colors"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendingMessage}
                      className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-40 disabled:bg-stone-300 transition-colors shadow-sm"
                    >
                      {sendingMessage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <FaPaperPlane className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-stone-50/30">
                <div className="text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaCommentMedical className="w-7 h-7 text-stone-300" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800 mb-1">Select a conversation</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
