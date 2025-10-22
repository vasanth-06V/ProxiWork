// client/src/components/RatingModal.jsx
import { useState } from 'react';
import Modal from './Modal';
import styles from './RatingModal.module.css';

// Simple Star Rating Component
const StarRating = ({ rating, setRating }) => {
  return (
    <div className={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function RatingModal({ isOpen, onClose, onSubmit, jobTitle }) {
    const [score, setScore] = useState(0); // 0 means no rating selected yet
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (score === 0) {
            setError('Please select a star rating (1-5).');
            return;
        }
        try {
            await onSubmit({ score, comment }); // Call the function passed from the parent
            // Reset form on success, parent will handle closing
            setScore(0);
            setComment('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to submit rating.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Rate Provider for "${jobTitle}"`}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Your Rating (1-5 Stars)</label>
                    <StarRating rating={score} setRating={setScore} />
                </div>
                 <div className={styles.inputGroup}>
                    <label htmlFor="rating-comment" className={styles.label}>Comments (Optional)</label>
                    <textarea 
                        id="rating-comment" 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                        className={styles.textarea}
                        placeholder="Share your experience..."
                    ></textarea>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                
                <div className={styles.buttonGroup}>
                    <button type="button" onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>Cancel</button>
                    <button type="submit" className={`${styles.button} ${styles.submitButton}`}>Submit Rating</button>
                </div>
            </form>
        </Modal>
    );
}