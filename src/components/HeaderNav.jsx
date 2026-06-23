import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

const ROOT_PATHS = ['/discover', '/matches', '/messages', '/profile'];

export default function HeaderNav({ title, children, showLogo = true }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isRootScreen = ROOT_PATHS.includes(location.pathname);
  const showBackButton = !isRootScreen;

  return (
    <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border/50 bg-background relative z-10">
      {showBackButton ? (
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-primary" />
        </button>
      ) : (
        <div className="w-8" />
      )}
      
      {isRootScreen && showLogo ? (
        <Logo size="sm" />
      ) : title ? (
        <h1 className="text-[14px] font-semibold text-foreground">{title}</h1>
      ) : (
        <div />
      )}
      
      <div className="w-8 flex justify-end">
        {children}
      </div>
    </div>
  );
}