// client/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './HomePage.module.css';

const CATEGORIES = [
  { icon: '💻', label: 'Development', color: '#6366f1', desc: '2.3k jobs' },
  { icon: '🎨', label: 'Design', color: '#ec4899', desc: '1.8k jobs' },
  { icon: '✍️', label: 'Writing', color: '#f59e0b', desc: '1.2k jobs' },
  { icon: '📱', label: 'Marketing', color: '#10b981', desc: '980 jobs' },
  { icon: '🎧', label: 'Support', color: '#06b6d4', desc: '760 jobs' },
  { icon: '📊', label: 'Finance', color: '#a855f7', desc: '540 jobs' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📝', title: 'Post Your Job', desc: 'Describe your project, set a budget, and publish in minutes. Receive proposals fast.', color: '#6366f1' },
  { step: '02', icon: '🤝', title: 'Review & Hire', desc: 'Browse proposals, check profiles and ratings, then hire the perfect talent.', color: '#a855f7' },
  { step: '03', icon: '💬', title: 'Collaborate', desc: 'Chat in real-time, share files, and work together seamlessly in your workspace.', color: '#ec4899' },
  { step: '04', icon: '🛡️', title: 'Pay Securely', desc: 'Funds held in escrow. Released only when you approve the final deliverable.', color: '#06b6d4' },
];

const TESTIMONIALS = [
  { name: 'Arjun Mehta', role: 'Startup Founder', avatar: 'AM', rating: 5, text: 'ProxiWork helped us find an incredible dev team in under 48 hours. The escrow system gave us total peace of mind.', color: '#6366f1' },
  { name: 'Priya Sharma', role: 'Freelance Designer', avatar: 'PS', rating: 5, text: "As a provider, I've doubled my monthly income. The proposal system is seamless and clients are high quality.", color: '#ec4899' },
  { name: 'Rohit Verma', role: 'Product Manager', avatar: 'RV', rating: 5, text: 'The real-time chat and file sharing is a game changer. Feels like a premium enterprise tool.', color: '#10b981' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className={styles.wrapper}>

      {/* ====== HERO ====== */}
      <section className={styles.hero}>
        <div className={styles.gridOverlay} />
        <div className={styles.heroGlow} />

        <div className={styles.heroContent}>
          <div className={styles.badge} data-aos="fade-down" data-aos-delay="0">
            <span className={styles.badgeDot} />
            🚀 The #1 Hyperlocal Freelance Marketplace
          </div>

          <h1 className={styles.heroTitle} data-aos="fade-up" data-aos-delay="100">
            Find Elite Talent.
            <br />
            <span className={styles.gradientText}>Ship Your Vision.</span>
          </h1>

          <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="200">
            Connect with top-tier professionals in your city. Post jobs, receive proposals,
            collaborate in real-time — pay only when you're satisfied.
          </p>

          <div className={styles.ctaGroup} data-aos="fade-up" data-aos-delay="300">
            {!user ? (
              <>
                <Link to="/register" className={styles.primaryBtn}>
                  <span>Start for Free</span>
                  <span className={styles.btnArrow}>→</span>
                </Link>
                <Link to="/jobs" className={styles.secondaryBtn}>Browse Jobs</Link>
              </>
            ) : (
              <Link to="/jobs" className={styles.primaryBtn}>
                <span>Find Work Now</span>
                <span className={styles.btnArrow}>→</span>
              </Link>
            )}
          </div>

          <div className={styles.trustChips} data-aos="fade-up" data-aos-delay="400">
            <span className={styles.chip}>✅ No hidden fees</span>
            <span className={styles.chip}>🔒 Escrow protected</span>
            <span className={styles.chip}>⚡ Instant proposals</span>
          </div>
        </div>

        {/* Floating card mockup */}
        <div className={styles.heroCard} data-aos="fade-left" data-aos-delay="300">
          <div className={styles.heroCardInner}>
            <div className={styles.heroCardHeader}>
              <div className={styles.heroCardAvatar}>JD</div>
              <div>
                <div className={styles.heroCardName}>React Developer Needed</div>
                <div className={styles.heroCardMeta}>₹45,000 budget · 2 days ago</div>
              </div>
              <div className={styles.heroCardBadge}>Open</div>
            </div>
            <div className={styles.heroCardStats}>
              <span>💼 12 proposals</span>
              <span>⭐ 4.9 avg rating</span>
            </div>
            <div className={styles.heroCardBar}>
              <div className={styles.heroCardBarFill} style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className={styles.statsSection}>
        {[
          { value: '5k+', label: 'Active Jobs', icon: '💼' },
          { value: '₹2Cr+', label: 'Paid to Providers', icon: '💰' },
          { value: '12k+', label: 'Registered Users', icon: '👥' },
          { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
        ].map((stat, i) => (
          <div key={i} className={styles.statCard} data-aos="zoom-in" data-aos-delay={i * 80}>
            <span className={styles.statIcon}>{stat.icon}</span>
            <h3 className={styles.statValue}>{stat.value}</h3>
            <p className={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ====== CATEGORIES ====== */}
      <section className={styles.categoriesSection}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} data-aos="fade-up">Explore Categories</h2>
          <p className={styles.sectionSub} data-aos="fade-up" data-aos-delay="100">Browse talent across every domain</p>
        </div>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat, i) => (
            <Link to={`/jobs?category=${cat.label}`} key={i} className={styles.categoryCard}
              data-aos="fade-up" data-aos-delay={i * 60}>
              <div className={styles.catIcon} style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}35` }}>
                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              </div>
              <span className={styles.catLabel}>{cat.label}</span>
              <span className={styles.catDesc} style={{ color: cat.color }}>{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className={styles.howSection}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} data-aos="fade-up">How ProxiWork Works</h2>
          <p className={styles.sectionSub} data-aos="fade-up" data-aos-delay="100">Four simple steps from idea to delivered</p>
        </div>
        <div className={styles.howGrid}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className={styles.howCard}
              data-aos="fade-up" data-aos-delay={i * 100}>
              <div className={styles.stepNum} style={{ color: item.color, borderColor: `${item.color}35`, background: `${item.color}12` }}>
                {item.step}
              </div>
              <div className={styles.howIcon}>{item.icon}</div>
              <h3 className={styles.howTitle} style={{ color: item.color }}>{item.title}</h3>
              <p className={styles.howDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className={styles.testimonialSection}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} data-aos="fade-up">Loved by Thousands</h2>
          <p className={styles.sectionSub} data-aos="fade-up" data-aos-delay="100">Real results from real people</p>
        </div>
        <div className={styles.testimonialGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={styles.testimonialCard}
              data-aos="fade-up" data-aos-delay={i * 120}>
              <div className={styles.stars}>{'★'.repeat(t.rating)}</div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                  {t.avatar}
                </div>
                <div>
                  <div className={styles.testimonialName}>{t.name}</div>
                  <div className={styles.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className={styles.finalCta}>
        <div className={styles.ctaBox} data-aos="zoom-in-up">
          <div className={styles.ctaGlow} />
          <div className={styles.ctaContent}>
            <span className={styles.ctaBadge}>Join 12,000+ professionals</span>
            <h2 className={styles.ctaTitle}>Ready to Build Something Great?</h2>
            <p className={styles.ctaSubtitle}>
              Whether you're hiring or looking for work — ProxiWork gets you there faster.
            </p>
            <div className={styles.ctaBtns}>
              {!user ? (
                <Link to="/register" className={styles.ctaPrimaryBtn}>Get Started Free →</Link>
              ) : (
                <Link to="/jobs" className={styles.ctaPrimaryBtn}>Find Work Now →</Link>
              )}
              <Link to="/jobs" className={styles.ctaSecondaryBtn}>Browse 5k+ Jobs</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
