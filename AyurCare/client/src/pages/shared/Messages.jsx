import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { formatName } from '../../utils/formatters';
import api from '../../services/api';

const Messages = () => {
  const { user } = useSelector((state) => state.auth);
  const isDoctor = user?.role === 'doctor';
  const { toasts, toast, removeToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const endpoint = isDoctor ? '/doctor/messages/conversations' : '/patient/messages/conversations';
      const response = await api.get(endpoint);
      setConversations(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error(error);
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
      toast.error('Failed to load messages');
      console.error(error);
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

      // Add message to local state
      setMessages((prev) => [...prev, response.data.data]);
      setMessageText('');

      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to send message');
      console.error(error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getParticipant = (conversation) => {
    return isDoctor ? conversation.participants.patient : conversation.participants.doctor;
  };

  const getUnreadCount = (conversation) => {
    return isDoctor ? conversation.unreadCount.doctor : conversation.unreadCount.patient;
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <Button onClick={fetchConversations} variant="outline" size="sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => {
                    const participant = getParticipant(conversation);
                    const unreadCount = getUnreadCount(conversation);

                    return (
                      <button
                        key={conversation._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                          selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {participant.firstName.charAt(0)}
                            {participant.lastName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">
                                {isDoctor ? '' : 'Dr. '}
                                {formatName(participant)}
                              </p>
                              {unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage?.text || 'No messages yet'}
                            </p>
                            {conversation.lastMessage?.timestamp && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimestamp(conversation.lastMessage.timestamp)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {isDoctor
                        ? 'Conversations with patients will appear here'
                        : 'Start a conversation with your doctor'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Thread Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold">
                        {getParticipant(selectedConversation).firstName.charAt(0)}
                        {getParticipant(selectedConversation).lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {isDoctor ? '' : 'Dr. '}
                          {formatName(getParticipant(selectedConversation))}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {isDoctor ? 'Patient' : getParticipant(selectedConversation).specialization || 'Doctor'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => {
                        const isMyMessage = message.sender._id === user._id;

                        return (
                          <div
                            key={message._id}
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-md px-4 py-2 rounded-lg ${
                                isMyMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isMyMessage ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={sendingMessage}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendingMessage}
                        loading={sendingMessage}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
