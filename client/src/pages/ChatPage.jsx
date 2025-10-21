// client/src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessagesForProject } from '../services/api';
import { socket } from '../services/socket';
import styles from './ChatPage.module.css';

export default function ChatPage() {
    const { projectId } = useParams();
    const { user, profile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null); // Ref to auto-scroll to bottom

    // Effect for fetching history and setting up socket listeners
    useEffect(() => {
        // 1. Join the specific project room
        socket.emit('join_project_room', projectId);

        // 2. Fetch message history
        const fetchHistory = async () => {
            try {
                const response = await getMessagesForProject(projectId);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to fetch message history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();

        // 3. Set up listener for incoming messages
        const handleReceiveMessage = (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        };
        socket.on('receive_message', handleReceiveMessage);

        // 4. Cleanup function to leave the room and remove listener
        return () => {
            socket.emit('leave_project_room', projectId); // Good practice
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [projectId]);

    // Effect to auto-scroll when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;

        const messageData = {
            projectId,
            senderId: user.id,
            sender_name: profile.full_name,
            content: newMessage,
        };
        socket.emit('send_message', messageData);
        setNewMessage('');
    };
    
    if (loading) return <div>Loading Chat...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.chatWindow}>
                <div className={styles.messagesContainer}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`${styles.message} ${(msg.senderId === user.id || msg.sender_id === user.id) ? styles.myMessage : styles.otherMessage}`}>
                            <div className={styles.messageContent}>
                                {/* Also fix the sender name display */}
                                <div className={styles.senderName}>{(msg.senderId === user.id || msg.sender_id === user.id) ? 'You' : msg.sender_name}</div>
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
                </div>
                <form onSubmit={handleSendMessage} className={styles.messageForm}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={styles.messageInput}
                    />
                    <button type="submit" className={styles.sendButton}>Send</button>
                </form>
            </div>
        </div>
    );
}