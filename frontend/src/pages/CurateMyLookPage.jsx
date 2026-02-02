import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import JourneyQuestionCard from '../components/consumer/JourneyBuilder/JourneyQuestionCard';
import JourneyBuilderSidebar from '../components/consumer/JourneyBuilder/JourneyBuilderSidebar';
import { CURATE_MY_LOOK_PAYLOAD } from '../components/consumer/JourneyBuilder/journeyBuilderMock';

function isQuestionAnswered(question, answer) {
  if (!answer) return false;
  switch (question.type) {
    case 'multi-select':
      return Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0;
    case 'hybrid-select':
      return (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0) ||
        (typeof answer.value === 'string' && answer.value.trim() !== '');
    case 'scale-rating':
      return answer.value !== undefined && answer.value !== null;
    case 'free-text':
      return typeof answer.value === 'string' && answer.value.length > 0;
    case 'single-choice':
      return !!answer.value;
    default:
      return !!answer.value;
  }
}

// ── Extract a single source value from the current answers ──
// Returns: string | string[] | null depending on strategy
function resolveSource(source, answers, batches) {
  const { questionId, extract } = source;
  const answer = answers[questionId];

  // Find the question definition across all batches
  let question = null;
  for (const batch of batches) {
    const found = batch.questions.find(q => q.id === questionId);
    if (found) { question = found; break; }
  }

  switch (extract) {
    case 'selectedLabels': {
      if (!answer?.selectedOptions?.length || !question?.options) return [];
      return answer.selectedOptions
        .map(id => question.options.find(o => o.id === id)?.label)
        .filter(Boolean);
    }
    case 'firstLabel': {
      // First selected chip label, falling back to freeText
      if (answer?.selectedOptions?.length && question?.options) {
        const label = question.options.find(o => o.id === answer.selectedOptions[0])?.label;
        if (label) return label;
      }
      const free = typeof answer?.value === 'string' ? answer.value.trim() : '';
      return free || null;
    }
    case 'freeText': {
      const val = typeof answer?.value === 'string' ? answer.value.trim() : '';
      return val || null;
    }
    case 'value': {
      if (answer?.value === undefined || answer?.value === null) return null;
      return String(answer.value);
    }
    default:
      return null;
  }
}

// ── Compute the full summary from the payload config + live answers ──
function computeSummary(summaryConfig, answers, batches) {
  // --- title ---
  const titleRaw = resolveSource(summaryConfig.title.source, answers, batches);
  const titleValue = Array.isArray(titleRaw) ? titleRaw[0] || null : titleRaw;
  const title = titleValue
    ? summaryConfig.title.template.replace('{value}', titleValue)
    : summaryConfig.title.fallback;

  // --- rows ---
  const rows = summaryConfig.rows.map(row => {
    const values = [];
    for (const src of row.sources) {
      const result = resolveSource(src, answers, batches);
      if (Array.isArray(result)) {
        values.push(...result);
      } else if (result != null) {
        values.push(result);
      }
    }
    return { label: row.label, values };
  });

  // --- narrative ---
  const bodySegments = [];
  const detailSegments = [];

  for (const seg of summaryConfig.narrative) {
    const raw = resolveSource(seg.source, answers, batches);
    const val = Array.isArray(raw) ? raw[0] || null : raw;
    if (val == null || val === '') continue;
    const text = seg.template.replace('{value}', val);
    if (seg.group === 'body') bodySegments.push(text);
    else detailSegments.push(text);
  }

  let narrativeText = '';
  if (bodySegments.length > 0) {
    const bodyJoined = bodySegments.join(', ');
    narrativeText = bodyJoined.charAt(0).toUpperCase() + bodyJoined.slice(1) + '.';
  }
  if (detailSegments.length > 0) {
    narrativeText += (narrativeText ? ' ' : '') + detailSegments.join(' ');
  }
  if (!narrativeText) {
    narrativeText = summaryConfig.narrativeFallback;
  }

  return { title, rows, narrativeText };
}

// ── Resolve a single answer to a human-readable string ──
function resolveAnswerLabel(question, answer) {
  if (!answer) return null;
  switch (question.type) {
    case 'multi-select': {
      if (!answer.selectedOptions?.length || !question.options) return null;
      const labels = answer.selectedOptions
        .map(id => question.options.find(o => o.id === id)?.label)
        .filter(Boolean);
      return labels.length ? labels.join(', ') : null;
    }
    case 'single-choice': {
      if (!answer.value || !question.options) return null;
      const opt = question.options.find(o => o.id === answer.value);
      return opt?.label || null;
    }
    case 'hybrid-select': {
      if (answer.selectedOptions?.length && question.options) {
        const opt = question.options.find(o => o.id === answer.selectedOptions[0]);
        if (opt) return opt.label;
      }
      const free = typeof answer.value === 'string' ? answer.value.trim() : '';
      return free || null;
    }
    case 'scale-rating': {
      if (answer.value === undefined || answer.value === null) return null;
      if (question.chips) {
        const chip = question.chips.find(c => c.value === Number(answer.value));
        return chip?.label || String(answer.value);
      }
      return '$'.repeat(Number(answer.value));
    }
    case 'free-text': {
      const val = typeof answer.value === 'string' ? answer.value.trim() : '';
      return val || null;
    }
    default:
      return answer.value != null ? String(answer.value) : null;
  }
}

function buildConfirmSummary(batch, answers) {
  const lines = [];
  for (const q of batch.questions) {
    const value = resolveAnswerLabel(q, answers[q.id]);
    if (value == null || value === '') continue;
    lines.push({ label: q.rowLabel || q.question, value });
  }
  return lines;
}

function ConfirmBubble({ lines }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        background: 'var(--gradient-user-answer)',
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: '24px 24px 4px 24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        maxWidth: '80%',
        animation: 'fadeInBatch 0.4s ease-out',
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: lines.length ? '8px' : 0 }}>
          Confirmed ✓
        </div>
        {lines.map((line, i) => (
          <div key={i} style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <span style={{ fontWeight: 600, opacity: 0.6 }}>{line.label}: </span>
            <span>{line.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CurateMyLookPage() {
  const location = useLocation();
  const initialQuery = location.state?.searchQuery || '';
  const initialImages = location.state?.images || [];

  const batches = CURATE_MY_LOOK_PAYLOAD.batches;
  const [answers, setAnswers] = useState({});
  const [currentBatch, setCurrentBatch] = useState(0);
  const [confirmedBatches, setConfirmedBatches] = useState(new Set());
  const batch2Ref = useRef(null);

  const { title: journeyTitle, rows: foundations, narrativeText } = useMemo(
    () => computeSummary(CURATE_MY_LOOK_PAYLOAD.summary, answers, batches),
    [answers, batches]
  );

  const isReady = useMemo(() => {
    return batches.every(batch =>
      batch.questions
        .filter(q => q.required)
        .every(q => isQuestionAnswered(q, answers[q.id]))
    );
  }, [answers, batches]);

  // --- Handlers ---
  const handleAnswer = (answer) => {
    setAnswers(prev => ({ ...prev, [answer.questionId]: answer }));
  };

  const handleConfirm = (batchIndex) => {
    setConfirmedBatches(prev => new Set([...prev, batchIndex]));
    if (batchIndex === 0) {
      setCurrentBatch(1);
      setTimeout(() => {
        batch2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleQuickMatch = () => {
    console.log('Quick Match clicked', { foundations, narrativeText });
  };

  const handleLetsGo = () => {
    console.log('Let\'s Goooo! clicked', { foundations, narrativeText, answers });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff9f5',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #ffecd9 0%, rgba(255, 236, 217, 0) 65%),
        radial-gradient(circle at 0% 50%, #ffb6e6 0%, transparent 60%),
        radial-gradient(circle at 100% 0%, #9dcaff 0%, transparent 60%)
      `,
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Header variant="full" />

      <div className="curate-grid" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        height: 'calc(100vh - 65px)',
      }}>
        {/* Left column — scrollable questions */}
        <div style={{
          overflowY: 'auto',
          padding: '32px',
        }}>
          {(initialQuery || initialImages.length > 0) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <div style={{
                background: 'var(--gradient-user-answer)',
                color: '#ffffff',
                padding: '16px 24px',
                borderRadius: '24px 24px 4px 24px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                maxWidth: '80%',
                animation: 'fadeInBatch 0.4s ease-out',
              }}>
                {initialImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: initialQuery ? '8px' : 0 }}>
                    {initialImages.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        style={{
                          width: '56px',
                          height: '56px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                    ))}
                  </div>
                )}
                {initialQuery && <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{initialQuery}</div>}
              </div>
            </div>
          )}

          <div style={{
            fontSize: '17px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: '1.5',
            marginBottom: '16px',
            animation: 'fadeInBatch 0.4s ease-out',
          }}>
            {batches[0].blurb}
          </div>

          <JourneyQuestionCard
            batch={batches[0]}
            answers={answers}
            onAnswer={handleAnswer}
            onContinue={() => handleConfirm(0)}
            readOnly={confirmedBatches.has(0)}
          />
          {confirmedBatches.has(0) && (
            <div style={{ marginTop: '16px' }}>
              <ConfirmBubble lines={buildConfirmSummary(batches[0], answers)} />
            </div>
          )}

          {currentBatch >= 1 && (
            <div ref={batch2Ref} style={{ marginTop: '32px' }}>
              <div style={{
                fontSize: '17px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                lineHeight: '1.5',
                marginBottom: '16px',
                animation: 'fadeInBatch 0.4s ease-out',
              }}>
                {batches[1].blurb}
              </div>

              <JourneyQuestionCard
                batch={batches[1]}
                answers={answers}
                onAnswer={handleAnswer}
                onContinue={() => handleConfirm(1)}
                readOnly={confirmedBatches.has(1)}
              />
              {confirmedBatches.has(1) && (
                <div style={{ marginTop: '16px' }}>
                  <ConfirmBubble lines={buildConfirmSummary(batches[1], answers)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — full-height sidebar */}
        <div style={{ height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <JourneyBuilderSidebar
            foundations={foundations}
            narrativeText={narrativeText}
            currentBatch={currentBatch}
            journeyTitle={journeyTitle}
          />
        </div>
      </div>

      {/* Mascot */}
      <Mascot
        variant="default"
        position="bottom-right"
        isSearching={!isReady}
        message={confirmedBatches.size > 0 ? (isReady ? "Let's Goooo!" : "Quick Match →") : ''}
        onClick={isReady ? handleLetsGo : handleQuickMatch}
      />

      <style>{`
        @keyframes fadeInBatch {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .curate-grid > div:first-child {
            padding: 16px !important;
          }
          .mascot-container {
            z-index: 50 !important;
          }
        }
      `}</style>
    </div>
  );
}
