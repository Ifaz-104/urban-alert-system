// frontend/src/components/BadgeDisplay.jsx
import './BadgeDisplay.css';

const BADGE_ICONS = {
  'Bronze Reporter': '🥉',
  'Silver Reporter': '🥈',
  'Gold Reporter': '🥇',
  'Guardian': '🛡️',
  'Hero': '⭐',
};

const BADGE_DESCRIPTIONS = {
  'Bronze Reporter': 'Earned 50 points',
  'Silver Reporter': 'Earned 200 points',
  'Gold Reporter': 'Earned 500 points',
  'Guardian': '10 verified reports',
  'Hero': 'Earned 1000 points',
};

export default function BadgeDisplay({ badges = [], size = 'medium', showDescription = false }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="badge-display">
        <p className="no-badges">No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className={`badge-display badge-size-${size}`}>
      {badges.map((badge, index) => (
        <div key={index} className="badge-item" title={showDescription ? BADGE_DESCRIPTIONS[badge] : badge}>
          <span className="badge-icon">{BADGE_ICONS[badge] || '🏅'}</span>
          {showDescription && <span className="badge-name">{badge}</span>}
        </div>
      ))}
    </div>
  );
}

export { BADGE_ICONS, BADGE_DESCRIPTIONS };

