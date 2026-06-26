import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';
import styles from './PostJobPage.module.css';

export default function PostJobPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: ''
    });
    const [questions, setQuestions] = useState([]); // Array of question strings
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Add a blank question slot (max 5)
    const handleAddQuestion = () => {
        if (questions.length >= 5) return;
        setQuestions([...questions, '']);
    };

    // Update a specific question text
    const handleQuestionChange = (index, value) => {
        const updated = [...questions];
        updated[index] = value;
        setQuestions(updated);
    };

    // Remove a question
    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Filter out blank questions
        const filteredQuestions = questions.map(q => q.trim()).filter(q => q.length > 0);

        try {
            await createJob({
                ...formData,
                job_questions: filteredQuestions.length > 0 ? filteredQuestions : undefined
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Post a New Job</h1>
                    <p className={styles.subtitle}>Find the perfect professional for your needs.</p>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Job Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g. Need a plumber for a leaky faucet"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="budget">Budget (₹)</label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                placeholder="5000"
                                value={formData.budget}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="deadline">Deadline</label>
                            <input
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe your project in detail..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="6"
                            className={styles.textarea}
                        ></textarea>
                    </div>

                    {/* Proposal Questions Section */}
                    <div className={styles.questionsSection}>
                        <div className={styles.questionsSectionHeader}>
                            <div>
                                <h3 className={styles.sectionTitle}>Proposal Questions</h3>
                                <p className={styles.sectionHint}>
                                    Optional — Ask providers up to 5 questions before they apply. ({questions.length}/5)
                                </p>
                            </div>
                            {questions.length < 5 && (
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className={styles.addQuestionBtn}
                                >
                                    + Add Question
                                </button>
                            )}
                        </div>

                        {questions.map((q, index) => (
                            <div key={index} className={styles.questionRow}>
                                <span className={styles.questionNumber}>Q{index + 1}</span>
                                <input
                                    type="text"
                                    value={q}
                                    maxLength={150}
                                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                                    placeholder="e.g. How many years of experience do you have?"
                                    className={styles.questionInput}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(index)}
                                    className={styles.removeQuestionBtn}
                                    title="Remove question"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        Publish Job
                    </button>
                </form>
            </div>
        </div>
    );
}