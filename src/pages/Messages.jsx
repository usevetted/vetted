import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';

export default function Messages() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      try {
        const m1 = await base44.entities.Match.filter({ profile1_id: profile.id, status: 'active' });
        const m2 = await base44.entities.Match.filter({ profile2_id: profile.id, status: 'active' });
        const allMatches = [...m1, ...m2].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

        // Load last message for each match
        const convos = await Promise.all(
          allMatches.map(async (match) => {
            const isProfile1 = match.profile1_id === profile.id;
            const otherName = isProfile1 ? match.profile2_name : match.profile1_name;
            const otherPicture = isProfile1 ? match.profile2_picture : match.profile1_picture;
            const otherLinkedin = isProfile1 ? match.profile2_linkedin : match.profile1_linkedin;
            const initials = otherName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

            const messages = await base44.entities.Message.filter({ match_id: match.id }, '-created_date', 1);
            const lastMessage = messages[0];

            return {
              match,
              otherName,
              otherPicture,
              otherLinkedin,
              initials,
              lastMessage: lastMessage?.content || 'Start the conversation',
              lastMessageTime: lastMessage?.created_date || match.created_date,
              hasMessages: messages.length > 0,
            };
          })
        );
        setConversations(convos);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3 pb-2 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Messages</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {conversations.length > 0 ? `${conversations.length} ${conversations.length === 1 ? 'conversation' : 'conversations'}` : 'No conversations yet'}
        </p>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <LoadingScreen fullscreen={false} />
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-full bg-brand-green-bg flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-primary/40" />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground mb-1">No messages yet</h3>
          <p className="text-[13px] text-muted-foreground">Match with someone to start chatting</p>
          <button
            onClick={() => navigate('/discover')}
            className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium"
          >
            Find Matches
          </button>
        </div>
      )}

      {!loading && conversations.length > 0 && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-6 min-h-0">
          <div className="space-y-1">
            {conversations.map((convo, i) => (
              <motion.button
                key={convo.match.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                onClick={() => navigate(`/messages/${convo.match.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors text-left"
              >
                {convo.otherPicture ? (
                  <img src={convo.otherPicture} alt={convo.otherName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-green-light flex items-center justify-center text-[14px] font-semibold text-primary flex-shrink-0">
                    {convo.initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[14px] font-medium text-foreground truncate">{convo.otherName}</span>
                    <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 ml-2">{formatTime(convo.lastMessageTime)}</span>
                  </div>
                  <p className={`text-[12px] truncate ${convo.hasMessages ? 'text-muted-foreground' : 'text-muted-foreground/50 italic'}`}>
                    {convo.lastMessage}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}