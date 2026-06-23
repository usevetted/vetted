import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Moon, Sun, User, Lock } from 'lucide-react';
import { ThemeContext } from '@/components/ThemeProvider';

export default function SettingsSheet({ onLogout }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = () => {
    setSheetOpen(false);
    onLogout();
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button className="p-2 -mr-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
            <Menu size={20} className="text-primary" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl">
          <div className="flex items-center justify-center w-8 h-1 bg-muted rounded-full mx-auto mb-6" />
          
          <div className="space-y-1 pb-4">
            {/* Account Section */}
            <div className="px-2 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</div>
              <button
                onClick={() => {
                  navigate('/profile-settings');
                  setSheetOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <User size={18} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[14px] font-medium text-foreground">Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  navigate('/account-security');
                  setSheetOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <Lock size={18} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[14px] font-medium text-foreground">Account Security</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-2" />

            {/* Device Section */}
            <div className="px-2 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Device</div>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={18} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-[14px] font-medium text-foreground">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={18} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-[14px] font-medium text-foreground">Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-2" />

            {/* Account Actions Section */}
            <div className="px-2 py-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <LogOut size={18} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[14px] font-medium text-foreground">Sign Out</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}