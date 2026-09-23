import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useBooking } from '../context/BookingContext';

export default function AIRecommendationBanner() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useBooking();

  useEffect(() => {
    async function fetchRec() {
      try {
        const data = await api.getRecommendations('Mumbai');
        setRecommendation(data);
      } catch (err) {
        console.warn('AI recommendation error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRec();
  }, []);

  if (loading || !recommendation) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-gutter-desktop w-full my-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high p-5 border border-outline-variant/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold uppercase tracking-wider">
                {recommendation.tag}
              </span>
              <span className="text-xs text-tertiary font-medium">
                {recommendation.weather_summary}
              </span>
            </div>
            <h4 className="font-bold text-base text-on-surface mt-1">
              {recommendation.headline}
            </h4>
            <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed mt-0.5">
              {recommendation.message}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <Link
            to={`/theme/${recommendation.suggested_theme_id}`}
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs hover:brightness-105 transition-all"
          >
            <span>View Suggested Theme</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
