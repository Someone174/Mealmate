import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ChefHat, X, Sparkles, CheckCircle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { stripCommandBlocks } from '@/components/mealmate/CommandExecutor';
import { normalizeWeeklyPlan } from '@/components/mealmate/MealData';
import { checkAILimit, incrementAIUsage } from '@/lib/ai-rate-limit';
import { invokeAI, isAIConfigured, MEAL_PLANNER_SYSTEM_PROMPT } from '@/lib/ai-service';
import { toast } from 'sonner';

const STARTER_PROMPTS = [
  'Create a 7-day vegetarian meal plan, 1800 cal/day, Mediterranean cuisine, budget 400 QAR',
  'Make me a high-protein meal plan for 2 people, max 30 min cooking time',
  'I need a gluten-free weekly plan, I strongly dislike mushrooms, budget 500 QAR',
  'Design a balanced meal plan with 2000 calories/day, I dislike spicy food',
];

function extractMealPlan(content) {
  if (!content) return null;
  const match = content.match(/```MEALPLAN_JSON\s*([\s\S]*?)```/);
  if (!match) return null;
  try { return normalizeWeeklyPlan(JSON.parse(match[1].trim())); } catch { return null; }
}

function stripMealPlanBlock(content) {
  return content?.replace(/```MEALPLAN_JSON[\s\S]*?```/g, '').trim() || '';
}

// Build the full message array including the hidden system message so the
// provider always gets the meal-planning context regardless of what the user
// has typed so far.
function buildAPIMessages(history) {
  return [
    { role: 'user', content: MEAL_PLANNER_SYSTEM_PROMPT },
    { role: 'assistant', content: 'Understood. I am MealMate AI, ready to create your perfect meal plan.' },
    ...history,
  ];
}

export default function MealPlannerChat({ user, isOpen, onClose, onPlanUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const [appliedMsg, setAppliedMsg] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const aiConfigured = isAIConfigured();

  useEffect(() => {
    if (isOpen && !ready) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm MealMate AI.\n\nI can create personalised weekly meal plans tailored to your preferences, dietary needs, and budget. What would you like today?",
      }]);
      setReady(true);
    }
    if (!isOpen) {
      // Reset state when closed so the next open feels fresh
      setReady(false);
      setMessages([]);
      setInput('');
      setAppliedMsg('');
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const cancelRequest = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSending(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    if (!aiConfigured) {
      toast.error('AI Planner is not configured. See PLEASE_NOTE.md for setup instructions.');
      return;
    }

    const limit = checkAILimit(user?.id || user?.username, user?.plan);
    if (!limit.allowed) {
      toast.error(
        `Daily AI limit reached (${limit.used}/${limit.limit} on the ${user?.plan || 'free'} plan). ` +
        'Upgrade or come back tomorrow.'
      );
      return;
    }

    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setAppliedMsg('');
    setSending(true);

    // Optimistic empty assistant bubble so the UI shows a spinner immediately
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const fullText = await invokeAI({
        messages: buildAPIMessages(history),
        userMessage: userMsg.content,
        signal: controller.signal,
      });

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: fullText };
        return updated;
      });

      incrementAIUsage(user?.id || user?.username);

      if (extractMealPlan(fullText)) {
        setAppliedMsg('Plan ready! Click the button below to apply it.');
      }
    } catch (err) {
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        // User cancelled — remove the empty assistant bubble
        setMessages(prev => prev.slice(0, -1));
      } else if (err?.message === 'AI_NOT_CONFIGURED') {
        setMessages(prev => prev.slice(0, -1));
        toast.error('AI Planner is not configured. See PLEASE_NOTE.md for setup instructions.');
      } else {
        console.error('MealPlannerChat invokeAI failed', err);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Sorry, something went wrong while creating the meal plan. Please try again in a moment.',
          };
          return updated;
        });
      }
    } finally {
      abortRef.current = null;
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    // AnimatePresence lives here (not in Dashboard) so exit animations fire
    // correctly even when the parent re-renders.
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="meal-planner-chat"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-gray-900">MealMate AI</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <button
              onClick={onClose}
              aria-label="Close AI chat"
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!ready && (
              <div className="space-y-2 pt-4">
                <p className="text-sm text-gray-500 text-center mb-3">Try a starter prompt:</p>
                {STARTER_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(p); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="w-full text-left text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-2 hover:bg-emerald-100 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              let display = stripCommandBlocks(msg.content || '');
              const plan = !isUser ? extractMealPlan(display) : null;
              if (plan) display = stripMealPlanBlock(display);
              display = display.trim();

              return (
                <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChefHat className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
                    {display ? (
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-tr-sm'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                      }`}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{display}</p>
                        ) : (
                          <ReactMarkdown
                            className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            components={{
                              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                              ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                              li: ({ children }) => <li className="my-0.5">{children}</li>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold my-1.5 text-emerald-700">{children}</h3>,
                              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{children}</code>,
                            }}
                          >
                            {display}
                          </ReactMarkdown>
                        )}
                      </div>
                    ) : i === messages.length - 1 && sending ? (
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : null}

                    {plan && onPlanUpdate && (
                      <button
                        onClick={() => {
                          onPlanUpdate(plan);
                          setAppliedMsg('Plan applied!');
                          setTimeout(() => setAppliedMsg(''), 3000);
                        }}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm self-start"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Apply this plan to my dashboard
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {appliedMsg && (
              <div className="flex justify-center">
                <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {appliedMsg}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            {!ready && (
              <div className="mb-2 space-y-1">
                {STARTER_PROMPTS.slice(0, 2).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(p); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="w-full text-left text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2 py-1.5 hover:bg-emerald-100 transition-colors truncate"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your meal plan..."
                aria-label="Chat with MealMate AI"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
              />
              {sending ? (
                <Button
                  onClick={cancelRequest}
                  size="icon"
                  aria-label="Stop generating"
                  className="bg-red-500 hover:bg-red-600 rounded-xl"
                >
                  <Square className="w-4 h-4" fill="currentColor" />
                </Button>
              ) : (
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  size="icon"
                  aria-label="Send message"
                  className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
