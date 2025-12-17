// client/src/components/PaymentModal.jsx
import Modal from './Modal';
import styles from './PaymentModal.module.css';

export default function PaymentModal({ isOpen, onClose, onConfirm, jobTitle, amount }) {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Release Payment & Complete Job">
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>💸</span>
        </div>
        <h3 className={styles.heading}>Confirm Payment Release</h3>
        <p className={styles.text}>
          You are about to release <strong>{formattedAmount}</strong> to the provider for the job <strong>"{jobTitle}"</strong>.
        </p>
        <p className={styles.subtext}>
          This action is irreversible. The funds will be transferred immediately, and the job will be marked as complete.
        </p>
        
        <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
                <span>Job Total:</span>
                <span>{formattedAmount}</span>
            </div>
            <div className={styles.summaryRow}>
                <span>Platform Fee (0%):</span>
                <span>₹0</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total to Pay:</span>
                <span>{formattedAmount}</span>
            </div>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button onClick={onConfirm} className={styles.payButton}>
            Pay & Complete
          </button>
        </div>
      </div>
    </Modal>
  );
}