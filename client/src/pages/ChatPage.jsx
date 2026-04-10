// client/src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessagesForProject, uploadFile, getJobById } from '../services/api';
import { socket } from '../services/socket';
import styles from './ChatPage.module.css';
import { useToast } from '../context/ToastContext';

export default function ChatPage() {
    const { projectId } = useParams();
    const { user, profile } = useAuth();
    const { showToast } = useToast();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    console.log("🔑 Logged In User:", user);
    console.log("👤 User Profile Data:", profile);

    // Fetch Job Details for Header (Title, etc.)
    useEffect(() => {
        const fetchJobInfo = async () => {
            try {
                const res = await getJobById(projectId);
                setJobDetails(res.data);
            } catch (err) {
                console.error("Failed to fetch job details", err);
            }
        };
        fetchJobInfo();
    }, [projectId]);

    // Chat Logic
    useEffect(() => {
        if (!projectId || !user) return;

        socket.emit('join_project_room', projectId);

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

        const handleReceiveMessage = (data) => {
            setMessages((prev) => [...prev, data]);
        };
        socket.on('receive_message', handleReceiveMessage);
        // Typing indicator listeners
        const handleUserTyping = () => setIsOtherTyping(true);
        const handleUserStopTyping = () => setIsOtherTyping(false);

        socket.on('user_typing', handleUserTyping);
        socket.on('user_stop_typing', handleUserStopTyping);


        return () => {
            socket.emit('leave_project_room', projectId);
            socket.off('receive_message', handleReceiveMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stop_typing', handleUserStopTyping);
        };
    }, [projectId, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData);
            const { fileUrl, fileType, fileName } = response.data;
            sendMessageToSocket(fileName, fileUrl, fileType);
        } catch (err) {
            showToast('Failed to upload file. Please try again.', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;
        sendMessageToSocket(newMessage, null, null);
        setNewMessage('');
    };

    const sendMessageToSocket = (content, attachmentUrl, attachmentType) => {
        const messageData = {
            projectId,
            senderId: user.id,
            sender_name: profile.full_name,
            content: content || "Sent an attachment",
            attachmentUrl,
            attachmentType,
            created_at: new Date().toISOString(),
        };
        socket.emit('send_message', messageData);
    };
    
    if (loading) return <div className={styles.loading}>Loading Chat...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.glassWindow}>
                
                {/* --- Header --- */}
                <div className={styles.chatHeader}>
                    <div className={styles.headerInfo}>
                        <h2 className={styles.projectTitle}>
                            {jobDetails ? jobDetails.title : 'Project Chat'}
                        </h2>
                        <span className={styles.status}>
                            {jobDetails ? jobDetails.status.replace('_', ' ') : 'Active'}
                        </span>
                    </div>
                    <Link to="/messages" className={styles.backButton}>← Back</Link>
                </div>

                {/* --- Messages Area --- */}
                <div className={styles.messagesContainer}>
                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === user.id || msg.sender_id === user.id;
                        return (
                            <div key={index} className={`${styles.messageWrapper} ${isMe ? styles.myMessageWrapper : styles.otherMessageWrapper}`}>
                                <div className={styles.messageBubble}>
                                    {!isMe && <span className={styles.senderName}>{msg.sender_name}</span>}
                                    
                                    {/* Attachment Logic */}
                                    {(msg.attachmentUrl || msg.attachment_url) ? (
                                        <div className={styles.attachmentBox}>
                                            {(msg.attachmentType === 'image' || msg.attachment_type === 'image') ? (
                                                <a href={msg.attachmentUrl || msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                                    <img 
                                                        src={msg.attachmentUrl || msg.attachment_url} 
                                                        alt="attachment" 
                                                        className={styles.chatImage} 
                                                    />
                                                </a>
                                            ) : (
                                                <a href={msg.attachmentUrl || msg.attachment_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                                    📄 {msg.content}
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <p className={styles.text}>{msg.content}</p>
                                    )}
                                    <span className={styles.timestamp}>
                                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {/* Typing indicator */}
                    {isOtherTyping && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            fontStyle: 'italic'
                        }}>
                            <span style={{ display: 'flex', gap: '3px' }}>
                                <span style={{ animation: 'bounce 1s infinite', display: 'inline-block' }}>●</span>
                                <span style={{ animation: 'bounce 1s infinite 0.2s', display: 'inline-block' }}>●</span>
                                <span style={{ animation: 'bounce 1s infinite 0.4s', display: 'inline-block' }}>●</span>
                            </span>
                            typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* --- Input Area --- */}
                <form onSubmit={handleSendMessage} className={styles.inputArea}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileSelect} 
                    />
                    
                    <button 
                        type="button" 
                        className={styles.attachButton}
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        title="Attach File"
                    >
                        {uploading ? '...' : '⬆️'}
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            // Emit typing event
                            socket.emit('typing', { projectId });
                            // Auto stop after 2 seconds of no typing
                            clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => {
                                socket.emit('stop_typing', { projectId });
                            }, 2000);
                        }}
                        placeholder="Type a message..."
                        className={styles.messageInput}
                    />

                    
                    <button type="submit" className={styles.sendButton}>
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
