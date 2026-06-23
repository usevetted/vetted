import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in both title and description',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const postData = { title: title.trim(), content: description.trim() };
    console.log('Post created:', postData);
    
    toast({
      title: 'Success',
      description: 'Your post has been created',
    });

    setTimeout(() => {
      setSubmitting(false);
      navigate(-1);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-secondary/30 min-h-0 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-4 border-b border-border/50 bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-primary" />
        </button>
        <h1 className="text-[18px] font-semibold text-foreground">Create Post</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-[500px] bg-white rounded-2xl border border-border/50 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title Input */}
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="w-full h-[44px] border border-input rounded-xl px-4 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-2">
                Description / Content
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your post content..."
                rows={6}
                className="w-full border border-input rounded-xl px-4 py-3 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[48px] bg-primary text-white rounded-xl text-[15px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}