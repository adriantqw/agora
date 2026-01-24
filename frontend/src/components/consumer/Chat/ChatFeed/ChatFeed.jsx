import { useRef, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import UserMessage from '../UserMessage/UserMessage';
import AIMessage from '../AIMessage/AIMessage';
import StyleCard from '../StyleCard/StyleCard';

export default function ChatFeed({ messages, loading, onStyleSelect, selectedStyle, onNextStep }) {
  const colors = useThemeColors();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <main
      style={{
        padding: '40px 8%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      {messages.map((message) => {
        if (message.type === 'user') {
          return (
            <UserMessage
              key={message.id}
              text={message.text}
              timestamp={message.timestamp}
            />
          );
        } else if (message.type === 'ai') {
          return (
            <AIMessage
              key={message.id}
              title={message.title}
              description={message.description}
              onNext={
                message.questionType === 'aesthetic' && selectedStyle
                  ? onNextStep
                  : null
              }
            >
              {/* Render interactive content based on question type */}
              {message.questionType === 'aesthetic' && message.options && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '16px',
                    marginTop: '20px',
                  }}
                >
                  {message.options.map((option) => (
                    <StyleCard
                      key={option.id}
                      id={option.id}
                      label={option.label}
                      icon={option.icon}
                      iconColor={option.iconColor}
                      bgColor={option.bgColor}
                      isSelected={selectedStyle === option.id}
                      onSelect={onStyleSelect}
                    />
                  ))}
                </div>
              )}
            </AIMessage>
          );
        }
        return null;
      })}

      {/* Loading indicator when AI is typing */}
      {loading && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            maxWidth: '850px',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: colors.primary.eggPink,
              color: 'white',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255, 183, 197, 0.3)',
            }}
          >
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '0 20px 20px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              border: `1px solid ${colors.border.subtle}`,
              color: colors.text.secondary,
              fontSize: '15px',
            }}
          >
            Thinking...
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </main>
  );
}
