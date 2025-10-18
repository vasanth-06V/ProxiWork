// client/src/components/ProposalCard.jsx
import styles from './ProposalCard.module.css';

export default function ProposalCard({ proposal, onAccept, isJobOpen }) {
  const formattedBid = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(proposal.bid_amount);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.providerName}>{proposal.full_name}</h3>
        <span className={styles.bidAmount}>{formattedBid}</span>
      </div>
      <p className={styles.tagline}>{proposal.tagline}</p>
      <div className={styles.divider}></div>
      <p className={styles.coverLetter}>{proposal.cover_letter}</p>
      <div className={styles.footer}>
        {/* The button is only enabled if the job is still open */}
        <button 
          onClick={() => onAccept(proposal.proposal_id)}
          disabled={!isJobOpen}
          className={styles.acceptButton}
        >
          Accept Proposal
        </button>
      </div>
    </div>
  );
}