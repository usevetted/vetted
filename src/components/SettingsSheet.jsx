import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Trash2, Moon, Sun, User, Lock } from 'lucide-react';
import { ThemeContext } from '@/components/ThemeProvider';
import DeleteAccountSheet from '@/components/DeleteAccountSheet';

export default function SettingsSheet({ onLogout, onDeleteClick }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleDelete = () => {
    setSheetOpen(false);
    onDeleteClick();
  };

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
            {/* Profile Settings Section */}
            <div className="px-2 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</div>
              <button
                onClick={() => {
                  navigate('/profile');
                  setSheetOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <User size={18} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[14px] font-medium text-foreground">Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  navigate('/profile');
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

            {/* Device Preferences Section */}
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

            {/* Danger Zone */}
            <div className="px-2 py-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <LogOut size={18} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[14px] font-medium text-foreground">Sign Out</span>
              </button>

              <button
                onClick={() => setDeleteOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/5 transition-colors text-left"
              >
                <Trash2 size={18} className="text-destructive/60 flex-shrink-0" />
                <span className="text-[14px] font-medium text-destructive/70">Delete Account</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteAccountSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}