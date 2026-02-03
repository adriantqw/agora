import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useThemeColors } from '../../../hooks/useThemeColors';
import './typewriter.css';

/**
 * JourneyHero Component
 *
 * Hero section for the journey-based homepage featuring:
 * - "Personal AI Shopping Assistant" heading with subtext
 * - Journey search bar with typewriter placeholder effect
 * - Pink arrow submit button
 *
 * @param {Function} onSearch - Callback when search is submitted
 */
const JourneyHero = ({ onSearch }) => {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Use refs to persist typewriter state across renders
  const currentIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const phraseIndexRef = useRef(0);
  const currentSpeedRef = useRef(100); // Start slow

  // Placeholder phrases for typewriter effect
  const placeholders = [
    "Valentine's Day date night...",
    "tech job interview wardrobe...",
    "summer wedding in Italy board...",
    "airport chic outfit journey...",
    "high-stakes board meeting edit...",
    "Girls' Night Out ideation...",
  ];

  // Typewriter effect
  useEffect(() => {
    if (isFocused || searchQuery) {
      // Don't show typewriter effect when input is focused or has text
      setPlaceholderText('');
      return;
    }

    let timeoutId;
    let pauseTimeout;

    const type = () => {
      const fullText = placeholders[phraseIndexRef.current];

      if (!isDeletingRef.current) {
        // Typing forward
        if (currentIndexRef.current < fullText.length) {
          currentIndexRef.current++;
          setPlaceholderText(fullText.substring(0, currentIndexRef.current));

          // Accelerate: gradually decrease the speed
          currentSpeedRef.current = Math.max(10, currentSpeedRef.current * 0.95);

          // Schedule next character
          timeoutId = setTimeout(type, currentSpeedRef.current);
        } else {
          // Finished typing, pause then start deleting
          pauseTimeout = setTimeout(() => {
            isDeletingRef.current = true;
            currentSpeedRef.current = 3; // Fast deletion
            timeoutId = setTimeout(type, currentSpeedRef.current);
          }, 2000);
        }
      } else {
        // Deleting backward
        if (currentIndexRef.current > 0) {
          currentIndexRef.current--;
          setPlaceholderText(fullText.substring(0, currentIndexRef.current));
          timeoutId = setTimeout(type, 3); // Constant fast deletion
        } else {
          // Finished deleting, move to next phrase
          isDeletingRef.current = false;
          phraseIndexRef.current = (phraseIndexRef.current + 1) % placeholders.length;
          currentSpeedRef.current = 100; // RESET speed for new phrase

          // Small pause before starting next phrase
          pauseTimeout = setTimeout(() => {
            timeoutId = setTimeout(type, currentSpeedRef.current);
          }, 500);
        }
      }
    };

    // Start typing with initial delay
    const startTimeout = setTimeout(() => {
      currentSpeedRef.current = 100; // Initialize speed
      timeoutId = setTimeout(type, currentSpeedRef.current);
    }, 500);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
      clearTimeout(pauseTimeout);
    };
  }, [isFocused, searchQuery, placeholders]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div
      style={{
        background: colors.page.background,
        padding: '80px 6% 60px',
        textAlign: 'center',
        borderBottom: `2px solid ${colors.border.divider}`,
      }}
    >
      {/* Heading */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: '12px',
            lineHeight: '1.2',
          }}
        >
          Your Personal AI Shopping Assistant
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: colors.text.secondary,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          Curate outfits for every occasion. Start a journey, build your closet, and let AI help you look your best.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: '680px',
          margin: '0 auto 24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: colors.card.background,
            borderRadius: '50px',
            border: `2px solid ${isFocused ? colors.gradient.start : colors.border.subtle}`,
            boxShadow: isFocused ? `0 8px 24px ${colors.gradient.start}22` : '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
        >
          {/* Sparkles Icon */}
          <div
            style={{
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Sparkles
              size={22}
              style={{ color: colors.gradient.start }}
            />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '16px',
              padding: '18px 0',
              color: colors.text.primary,
              fontFamily: 'Inter, sans-serif',
            }}
            aria-label="Search for journey ideas"
          />

          {/* Typewriter Placeholder */}
          {!searchQuery && !isFocused && (
            <div
              style={{
                position: 'absolute',
                left: '62px',
                pointerEvents: 'none',
                color: colors.text.muted,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
              className="typewriter-placeholder"
            >
              <span>{placeholderText}</span>
              <span className="typewriter-cursor" />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            style={{
              background: searchQuery.trim()
                ? colors.gradient.start
                : colors.border.subtle,
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
              margin: '6px',
              transition: 'all 0.2s ease',
              boxShadow: searchQuery.trim() ? `0 4px 12px ${colors.gradient.start}33` : 'none',
            }}
            onMouseEnter={(e) => {
              if (searchQuery.trim()) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${colors.gradient.start}44`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = searchQuery.trim()
                ? `0 4px 12px ${colors.gradient.start}33`
                : 'none';
            }}
          >
            <ArrowRight
              size={22}
              strokeWidth={2.5}
              style={{
                color: searchQuery.trim() ? '#ffffff' : colors.text.muted,
              }}
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default JourneyHero;
