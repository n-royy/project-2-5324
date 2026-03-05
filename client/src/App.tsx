import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Message, NewMessage } from '../../shared/schema';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageContent, setNewMessageContent] = useState<string>('');
  const currentUser = 'AnonymousUser'; // For simplicity, hardcode a user
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Polling for new messages (simple approach for a chat app without WebSockets)
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get<Message[]>('/api/messages');
      // Only update if messages have actually changed to avoid unnecessary re-renders
      if (JSON.stringify(response.data) !== JSON.stringify(messages)) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim()) return;

    const message: NewMessage = {
      user: currentUser,
      content: newMessageContent.trim(),
    };

    try {
      const response = await axios.post<Message>('/api/messages', message);
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessageContent('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Simple Chat App</h1>

      <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-md p-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-3 ${msg.user === currentUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow ${msg.user === currentUser
                ? 'bg-blue-500 text-white rounded-br-none' // Current user's message
                : 'bg-gray-200 text-gray-800 rounded-bl-none' // Other user's message
              }`}
            >
              <p className="font-semibold text-sm mb-1">{msg.user}</p>
              <p>{msg.content}</p>
              <p className="text-xs text-right opacity-75 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="New message"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
