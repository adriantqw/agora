import { useRef, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import UserMessage from '../UserMessage/UserMessage';
import AIMessage from '../AIMessage/AIMessage';
import QuestionRenderer from '../../../dynamic-forms/QuestionRenderer';

export default function ChatFeed({ messages, loading, onAnswer, batchAnswers, onBatchSubmit }) {
  const colors = useThemeColors();
  const messagesEndRef = useRef(null);
  const messageRefs = useRef(new Map()); // Map of message ID -> DOM ref
  const prevMessagesLength = useRef(0);
  const lastMessageId = useRef(null);

  // Helper to set ref for a message
  const setMessageRef = useCallback((messageId, element) => {
    if (element) {
      messageRefs.current.set(messageId, element);
    } else {
      messageRefs.current.delete(messageId);
    }
  }, []);

  // Smart auto-scroll based on message type
  useEffect(() => {
    // Only scroll if messages array actually grew (new message added)
    if (messages.length <= prevMessagesLength.current) {
      prevMessagesLength.current = messages.length;
      return;
    }

    prevMessagesLength.current = messages.length;

    // Get the newest message
    const newestMessage = messages[messages.length - 1];

    // If it's the same as last processed message, skip
    if (newestMessage?.id === lastMessageId.current) {
      return;
    }

    lastMessageId.current = newestMessage?.id;

    // Determine scroll strategy based on message type and content
    const hasMultipleQuestions = newestMessage?.questions && newestMessage.questions.length > 1;

    if (hasMultipleQuestions) {
      // For batched questions: scroll to show the TOP of the AI message
      // This ensures question 01. is visible
      // Small delay to ensure nested components have rendered
      setTimeout(() => {
        const messageElement = messageRefs.current.get(newestMessage.id);
        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start' // Align to top of viewport
          });
        }
      }, 100); // 100ms delay - enough for render, short enough to feel instant
    } else {
      // For all other messages: scroll to bottom as normal
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
            <div
              key={message.id}
              ref={(el) => setMessageRef(message.id, el)}
            >
              <AIMessage
                title={message.title}
                description={message.description}
                onSubmit={hasQuestions && allRequiredAnswered ? onBatchSubmit : null}
                submitLabel="Continue Journey"
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
                          color: colors.text.secondary,
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
            </div>
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
              background: colors.card.background,
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
