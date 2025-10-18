// client/src/components/ConfirmationModal.jsx
import Modal from './Modal';
import styles from './ConfirmationModal.module.css';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className={`${styles.button} ${styles.confirmButton}`}>
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}