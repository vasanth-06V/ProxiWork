import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProjects } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import styles from './MessagesPage.module.css';

export default function MessagesPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getUserProjects();
                
                const uniqueProjectsMap = new Map();
                response.data.forEach(item => {
                    uniqueProjectsMap.set(item.job_id, item);
                });
                const uniqueProjects = Array.from(uniqueProjectsMap.values());

                setProjects(uniqueProjects);
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) return <div className={styles.container}>Loading messages...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Messages</h1>
            <div className={styles.projectList}>
                {projects.length > 0 ? (
                    projects.map(project => {
                        const isClient = user.id === project.client_id;
                        const otherName = isClient ? project.provider_name : project.client_name;
                        
                        return (
                            <Link to={`/projects/${project.job_id}/chat`} key={project.job_id} className={styles.projectCard}>
                                <div className={styles.avatarPlaceholder}>
                                    {otherName ? otherName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className={styles.info}>
                                    <h3 className={styles.projectTitle}>{project.title}</h3>
                                    <p className={styles.subInfo}>
                                        Chatting with: <strong>{otherName}</strong>
                                    </p>
                                    <span className={`${styles.statusBadge} ${styles[project.status]}`}>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className={styles.arrow}>→</div>
                            </Link>
                        );
                    })
                ) : (
                    <div className={styles.noMessages}>
                        <p>No active conversations found.</p>
                        <small style={{display:'block', marginTop:'0.5rem', color:'var(--text-secondary)'}}>
                            Conversations appear here once a proposal is accepted.
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}