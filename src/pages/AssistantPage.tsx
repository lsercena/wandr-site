import { useState, useRef, useEffect, useCallback } from 'react';
import SeoHead from '@/components/ui/SeoHead';
import { continueConversation, generateMessageId } from '@/services/aiService';
import type { ChatMessage } from '@/types';
import './AssistantPage.css';

const SUGGESTED_QUESTIONS = [
  {
    category: 'Visas',
    questions: [
      'Can an American stay 6 months in Portugal?',
      'What countries are visa-free for UK passport holders?',
      'How do I get a Thailand LTR visa?',
    ],
  },
  {
    category: 'Cost of Living',
    questions: [
      'Which countries fit a $2,500/month budget?',
      'How much does it cost to live in Lisbon vs Bangkok?',
      'What is the cheapest country in Europe for nomads?',
    ],
  },
  {
    category: 'Taxes',
    questions: [
      'How does the 183-day tax residency rule work?',
      'Which countries have zero income tax for foreigners?',
      'What is Portugal\'s NHR tax regime?',
    ],
  },
  {
    category: 'Remote Work',
    questions: [
      'Which countries have the fastest internet for nomads?',
      'Can I bring my dog when relocating abroad?',
      'What is the best nomad visa for a freelancer?',
    ],
  },
];

function TypingIndicator() {
  return (
    <div className="chat-bubble chat-bubble--ai" aria-live="polite" aria-label="Wandr AI is typing">
      <div className="chat-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chat-message chat-message--${isUser ? 'user' : 'ai'}`}>
      {!isUser && <div className="chat-avatar" aria-hidden="true">✦</div>}
      <div className={`chat-bubble chat-bubble--${isUser ? 'user' : 'ai'}`}>
        <div className="chat-bubble__content">
          {message.content.split('\n').map((line, i) => (
            <p key={i} style={{ margin: line === '' ? '0.4em 0' : 0 }}>{line}</p>
          ))}
        </div>
        <time className="chat-bubble__time" dateTime={message.timestamp.toISOString()}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </div>
  );
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I'm Wandr AI — your travel intelligence assistant.\n\nI can help you with:\n• Visa requirements and eligibility\n• Digital nomad visa programs\n• Cost of living and budgeting\n• Tax residency rules\n• Remote work infrastructure\n• Safety and healthcare\n\nWhat would you like to know?`,
  timestamp: new Date(),
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Pass history excluding the welcome message so the AI doesn't get confused
      const history = messages.filter((m) => m.id !== 'welcome');
      const reply = await continueConversation(history, trimmed);
      const aiMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleSuggestion = (question: string) => {
    send(question);
  };

  const clearConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <>
      <SeoHead
        title="AI Travel Assistant"
        description="Ask Wandr AI anything about visas, cost of living, digital nomad programs, taxes, and remote work. Get instant expert travel intelligence."
        path="/assistant"
      />

      <div className="assistant-layout">
        {/* Sidebar */}
        <aside className="assistant-sidebar">
          <div className="assistant-sidebar__header">
            <p className="section-label">Suggested</p>
            <h2 className="assistant-sidebar__title">Ask Wandr AI</h2>
          </div>

          <div className="assistant-suggestions">
            {SUGGESTED_QUESTIONS.map((group) => (
              <div key={group.category} className="suggestion-group">
                <p className="suggestion-group__label">{group.category}</p>
                {group.questions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="suggestion-btn"
                    onClick={() => handleSuggestion(q)}
                    disabled={loading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="assistant-sidebar__footer">
            <button type="button" className="btn btn-ghost" onClick={clearConversation}>
              Clear conversation
            </button>
            <p className="assistant-disclaimer">
              AI responses may not reflect the latest visa regulations. Always verify with official government sources before traveling.
            </p>
          </div>
        </aside>

        {/* Chat area */}
        <main className="assistant-chat" role="main" aria-label="AI conversation">
          <div className="chat-header">
            <div className="chat-header__brand">
              <span className="chat-header__icon" aria-hidden="true">✦</span>
              <div>
                <strong>Wandr AI</strong>
                <span className="chat-header__status">Travel Intelligence</span>
              </div>
            </div>
            <span className="badge badge-green">Online</span>
          </div>

          <div className="chat-messages" role="log" aria-live="polite" aria-label="Conversation history">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            {error && (
              <div className="chat-error" role="alert">
                <span>⚠ {error}</span>
                <button type="button" className="btn btn-ghost" onClick={() => setError(null)}>Dismiss</button>
              </div>
            )}
            <div ref={bottomRef} aria-hidden="true" />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit} role="search">
            <label htmlFor="chat-input" className="sr-only">Ask a travel question</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              className="chat-input"
              placeholder="Ask anything about visas, costs, taxes, remote work…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
              aria-label="Type your question"
            />
            <button
              type="submit"
              className="btn btn-primary chat-send-btn"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? '…' : '↑'}
            </button>
          </form>
          <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
        </main>
      </div>
    </>
  );
}
