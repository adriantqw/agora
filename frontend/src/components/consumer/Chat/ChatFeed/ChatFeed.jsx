import { useRef, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import UserMessage from '../UserMessage/UserMessage';
import AIMessage from '../AIMessage/AIMessage';
import QuestionRenderer from '../../../dynamic-forms/QuestionRenderer';

export default function ChatFeed({ messages, loading, onAnswer, batchAnswers, onBatchSubmit }) {
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
          const hasQuestions = message.questions && message.questions.length > 0;

          // Check if all required questions are answered
          const allRequiredAnswered = hasQuestions
            ? message.questions
                .filter(q => q.required)
                .every(q => batchAnswers?.[q.id])
            : false;

          return (
            <AIMessage
              key={message.id}
              title={message.title}
              description={message.description}
              onSubmit={hasQuestions && allRequiredAnswered ? onBatchSubmit : null}
              submitLabel="Update Preferences"
            >
              {/* Render all questions in batch */}
              {hasQuestions && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                  marginTop: '20px'
                }}>
                  {message.questions.map((question, index) => (
                    <div key={question.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {/* Question number header */}
                      <h3 style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#666',
                        margin: 0
                      }}>
                        {String(index + 1).padStart(2, '0')}. {question.question}
                      </h3>

                      {/* Question component */}
                      <QuestionRenderer
                        question={question}
                        onAnswer={onAnswer}
                        currentAnswer={batchAnswers?.[question.id]}
                        disabled={false}
                        showQuestionText={false}  // Already shown in header
                      />
                    </div>
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
