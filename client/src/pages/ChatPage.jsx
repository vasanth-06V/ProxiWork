// client/src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessagesForProject, uploadFile } from '../services/api';
import { socket } from '../services/socket';
import styles from './ChatPage.module.css';

export default function ChatPage() {
    const { projectId } = useParams();
    const { user, profile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Effect for initializing chat
    useEffect(() => {
        if (!projectId || !user) return;

        // 1. Join the room
        socket.emit('join_project_room', projectId);

        // 2. Fetch history
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await getMessagesForProject(projectId);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to fetch message history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();

        // 3. Listen for new messages
        const handleReceiveMessage = (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        };
        socket.on('receive_message', handleReceiveMessage);

        // 4. Cleanup
        return () => {
            socket.emit('leave_project_room', projectId);
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [projectId, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle File Selection
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData);
            const { fileUrl, fileType, fileName } = response.data;
            
            // Send message with attachment immediately
            sendMessageWithAttachment(fileName, fileUrl, fileType);
        } catch (err) {
            alert('Failed to upload file.');
        } finally {
            setUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const sendMessageWithAttachment = (content, url, type) => {
        const messageData = {
            projectId,
            senderId: user.id,
            sender_name: profile.full_name,
            content: content || "Sent an attachment",
            attachmentUrl: url,
            attachmentType: type,
            created_at: new Date().toISOString(),
        };
        socket.emit('send_message', messageData);
        // Optimistic update
        setMessages((prev) => [...prev, messageData]);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !profile) return;

        const messageData = {
            projectId,
            senderId: user.id,
            sender_name: profile.full_name,
            content: newMessage,
            created_at: new Date().toISOString(),
        };
        socket.emit('send_message', messageData);
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');
    };
    
    if (loading) return <div className={styles.centeredMessage}>Loading Chat...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.chatWindow}>
                <div className={styles.messagesContainer}>
                    {messages.map((msg, index) => (
                        <div 
                            key={index}
                            className={`${styles.message} ${(msg.senderId === user.id || msg.sender_id === user.id) ? styles.myMessage : styles.otherMessage}`}
                        >
                            <div className={styles.messageContent}>
                                <div className={styles.senderName}>{(msg.senderId === user.id || msg.sender_id === user.id) ? 'You' : msg.sender_name}</div>
                                
                                {/* --- Render Attachment if it exists --- */}
                                {(msg.attachmentUrl || msg.attachment_url) ? (
                                    <div className={styles.attachment}>
                                        {(msg.attachmentType === 'image' || msg.attachment_type === 'image') ? (
                                            <img src={msg.attachmentUrl || msg.attachment_url} alt="attachment" className={styles.chatImage} />
                                        ) : (
                                            <a href={msg.attachmentUrl || msg.attachment_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                                ⬆️{msg.content}
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className={styles.messageForm}>
                    {/* Hidden file input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileSelect} 
                    />
                    
                    {/* Paperclip Button */}
                    <button 
                        type="button" 
                        className={styles.attachButton}
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        {uploading ? '...' : '⬆️'}
                    </button>

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