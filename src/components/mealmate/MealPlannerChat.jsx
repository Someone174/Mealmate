import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ChefHat, X, Sparkles, CheckCircle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { stripCommandBlocks } from '@/components/mealmate/CommandExecutor';
import { normalizeWeeklyPlan } from '@/components/mealmate/MealData';
import { checkAILimit, incrementAIUsage } from '@/lib/ai-rate-limit';
import { sendChatMessage, isAIConfigured } from '@/lib/aiProvider';
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
  try {
    return normalizeWeeklyPlan(JSON.parse(match[1].trim()));
  } catch {
    return null;
  }
}

function stripMealPlanBlock(content) {
  return content?.replace(/```MEALPLAN_JSON[\s\S]*?```/g, '').trim() || '';
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

  // Initialise with a greeting when the panel opens
  useEffect(() => {
    if (isOpen && !ready) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm MealMate AI.\n\nI can create personalized weekly meal plans tailored to your preferences, dietary needs, and budget. What would you like today?",
      }]);
      setReady(true);
    }
  }, [isOpen, ready]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSending(false);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;

    if (!aiConfigured) {
      toast.error('AI Planner is not configured. See PLEASE_NOTE.md or set up your AI provider keys.');
      return;
    }

    const userId = user?.id || user?.username;
    const limit = checkAILimit(userId, user?.plan);
    if (!limit.allowed) {
      toast.error(
        `Daily AI limit reached (${limit.used}/${limit.limit} on the ${user?.plan || 'free'} plan). Upgrade or come back tomorrow.`
      );
      return;
    }

    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setAppliedMsg('');
    setSending(true);

    // Add empty assistant placeholder while waiting
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const fullText = await sendChatMessage(history, userMsg.content);

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: fullText };
        return updated;
      });

      incrementAIUsage(userId);

      if (extractMealPlan(fullText)) {
        setAppliedMsg('Plan ready! Click the button below to apply it.');
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // User cancelled — remove the empty placeholder
        setMessages(prev => prev.slice(0, -1));
      } else {
        console.error('[MealPlannerChat] sendMessage failed:', err);
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
  }, [input, sending, aiConfigured, user, messages]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const applyPlan = useCallback((plan) => {
    if (onPlanUpdate) {
      onPlanUpdate(plan);
      setAppliedMsg('Plan applied!');
      setTimeout(() => setAppliedMsg(''), 3000);
    }
  }, [onPlanUpdate]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col border border-gray-100"
        role="dialog"
        aria-label="MealMate AI chat"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-gray-900">MealMate AI</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close AI chat"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      onClick={() => applyPlan(plan)}
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

        {/* Starter prompts — shown only before the first user message */}
        {ready && messages.filter(m => m.role === 'user').length === 0 && (
          <div className="px-4 pb-2 space-y-1.5">
            <p className="text-xs text-gray-400 font-medium">Try a starter:</p>
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

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your meal plan..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
              aria-label="Type a message"
              disabled={sending}
            />
            {sending ? (
              <Button
                onClick={cancelRequest}
                size="icon"
                aria-label="Stop generating"
                className="bg-red-500 hover:bg-red-600 rounded-xl flex-shrink-0"
              >
                <Square className="w-4 h-4" fill="currentColor" />
              </Button>
            ) : (
              <Button
                onClick={sendMessage}
                disabled={!input.trim()}
                size="icon"
                aria-label="Send message"
                className="bg-emerald-500 hover:bg-emerald-600 rounded-xl flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
