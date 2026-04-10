// client/src/components/SkeletonCard.jsx
import styles from './SkeletonCard.module.css';

export default function SkeletonCard({ rows = 3 }) {
    return (
        <div className={styles.card}>
            {/* Title bar */}
            <div className={`${styles.shimmer} ${styles.titleBar}`}></div>
            
            {/* Content rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className={`${styles.shimmer} ${styles.row}`}
                    style={{ width: i % 2 === 0 ? '80%' : '60%' }}
                ></div>
            ))}

            {/* Bottom action bar */}
            <div className={styles.actionRow}>
                <div className={`${styles.shimmer} ${styles.badge}`}></div>
                <div className={`${styles.shimmer} ${styles.button}`}></div>
            </div>
        </div>
    );
}
