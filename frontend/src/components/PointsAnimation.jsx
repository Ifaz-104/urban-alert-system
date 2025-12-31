// frontend/src/components/PointsAnimation.jsx
import { useState, useEffect } from 'react';
import './PointsAnimation.css';

export default function PointsAnimation({ points, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (points && points > 0) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          if (onComplete) onComplete();
        }, 500);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [points, onComplete]);

  if (!isVisible || !points) return null;

  return (
    <div className={`points-animation ${isAnimating ? 'animate' : 'fade-out'}`}>
      <div className="points-content">
        <span className="points-plus">+</span>
        <span className="points-value">{points}</span>
        <span className="points-label">points</span>
      </div>
    </div>
  );
}

