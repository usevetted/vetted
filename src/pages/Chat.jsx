import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Info, Linkedin, ShieldAlert, Flag, X, HeartCrack } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReportUserSheet from '@/components/ReportUserSheet';
import MatchActionsSheet from '@/components/MatchActionsSheet';
import LoadingScreen from '@/components/LoadingScreen';

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [moderationWarning, setModerationWarning] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!matchId || !profile) return;
      try {
        const m = await base44.entities.Match.get(matchId);
        setMatch(m);
        const msgs = await base44.entities.Message.filter({ match_id: matchId }, 'created_date', 100);
        setMessages(msgs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [matchId, profile]);

  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.match_id === matchId) {
        if (event.type === 'create') {
          setMessages(prev => {
            if (prev.some(m => m.id === event.data.id)) return prev;
            return [...prev, event.data];
          });
        }
      }
    });
    return unsubscribe;
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    setModerationWarning(null);
    const content = input.trim();
    setInput('');
    try {
      const response = await base44.functions.invoke('sendMessage', {
        match_id: matchId,
        content,
      });
      const data = response.data || response;
      if (data.error === 'blocked') {
        setModerationWarning(data.reason);
        return;
      }
      if (data.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleUnmatch = async () => {
    try {
      await base44.entities.Match.update(matchId, { status: 'archived' });
      navigate('/messages');
    } catch {
      // ignore
    }
  };

  const handleBlock = async () => {
    try {
      await base44.entities.Match.update(matchId, { status: 'blocked' });
      navigate('/messages');
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <LoadingScreen fullscreen={false} />;
  }

  if (!match) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-[14px] text-muted-foreground mb-4">Conversation not found</p>
        <button onClick={() => navigate('/messages')} className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium">
          Back to Messages
        </button>
      </div>
    );
  }

  const isProfile1 = match.profile1_id === profile.id;
  const otherName = isProfile1 ? match.profile2_name : match.profile1_name;
  const otherPicture = isProfile1 ? match.profile2_picture : match.profile1_picture;
  const otherLinkedin = isProfile1 ? match.profile2_linkedin : match.profile1_linkedin;
  const otherRole = isProfile1 ? match.profile2_role : match.profile1_role;
  const otherProfileId = isProfile1 ? match.profile2_id : match.profile1_id;
  const initials = otherName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3 border-b border-border/50 bg-background relative z-10">
        <button onClick={() => navigate('/messages')} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-primary" />
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
        >
          {otherPicture ? (
            <img src={otherPicture} alt={otherName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-green-light flex items-center justify-center text-[12px] font-semibold text-primary">
              {initials}
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-foreground truncate">{otherName}</div>
          <div className="text-[12px] text-primary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Online
          </div>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
          <Info size={18} className="text-muted-foreground" />
        </button>
        <button
          onClick={() => setReportOpen(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors"
        >
          <Flag size={17} className="text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/50 bg-muted/30"
          >
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[13px] font-medium text-foreground">{otherName}</div>
                {otherRole && <div className="text-[12px] text-muted-foreground">{otherRole}</div>}
                {match.job_title && (
                  <div className="text-[12px] text-muted-foreground mt-1">
                    {match.job_title}{match.company_name ? ` · ${match.company_name}` : ''}
                  </div>
                )}
              </div>
              {otherLinkedin && (
                <a
                  href={otherLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-linkedin/10 hover:bg-linkedin/20 transition-colors"
                >
                  <Linkedin size={14} className="text-linkedin" />
                  <span className="text-[12px] font-medium text-linkedin">View Profile</span>
                </a>
              )}
            </div>
            <div className="px-4 pb-4 space-y-3">
              <button
                onClick={() => { setShowInfo(false); setReportOpen(true); }}
                className="flex items-center gap-2 text-[13px] font-medium text-destructive"
              >
                <Flag size={14} />
                Report {otherName?.split(' ')[0]}
              </button>
              <button
                onClick={() => { setShowInfo(false); setActionsOpen(true); }}
                className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <HeartCrack size={14} />
                Unmatch / Block
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-2.5 min-h-0">
        <div className="text-[12px] text-muted-foreground/40 text-center mb-2">
          {new Date(match.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] text-muted-foreground/60 text-center max-w-[200px]">
              Say hello to {otherName?.split(' ')[0]} — introduce yourself and start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_profile_id === profile.id;
            const showTime = i === 0 || new Date(messages[i-1].created_date).toDateString() !== new Date(msg.created_date).toDateString();
            return (
              <div key={msg.id || i}>
                {showTime && (
                  <div className="text-[12px] text-muted-foreground/40 text-center my-3">
                    {new Date(msg.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      isMe
                        ? 'bg-primary text-white rounded-2xl rounded-br-md'
                        : 'bg-muted text-foreground rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Moderation warning */}
      <AnimatePresence>
        {moderationWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/20 flex items-start gap-2">
              <ShieldAlert size={16} className="text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-destructive">Message Blocked</p>
                <p className="text-[12px] text-destructive/80 mt-0.5">{moderationWarning}</p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Repeated violations may result in account suspension. You can also report this conversation.
                </p>
              </div>
              <button onClick={() => setModerationWarning(null)} className="text-destructive/60 hover:text-destructive flex-shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 pt-2 pb-6 border-t border-border/50 bg-background">
        <div className="flex items-center gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message"
            className="flex-1 h-[40px] border border-input rounded-full px-4 text-[13px] bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-[40px] h-[40px] bg-primary rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-colors active:scale-95"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} className="text-white" />
            )}
          </button>
        </div>
      </div>

      <ReportUserSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedProfileId={otherProfileId}
        reportedProfileName={otherName}
        matchId={matchId}
        reporterProfileId={profile.id}
      />
      <MatchActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onUnmatch={handleUnmatch}
        onBlock={handleBlock}
        otherName={otherName}
      />
    </div>
  );
}