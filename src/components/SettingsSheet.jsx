import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Trash2, Moon, Sun, User, Lock } from 'lucide-react';
import { ThemeContext } from '@/components/ThemeProvider';
import DeleteAccountSheet from '@/components/DeleteAccountSheet';

export default function SettingsSheet({ onLogout, onDeleteClick, profilePicture, initials }) {
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

  const handleProfileSettings = () => {
    setSheetOpen(false);
    navigate('/profile');
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button className="w-11 h-11 rounded-full bg-white border border-border/50 flex items-center justify-center shadow-sm hover:bg-muted transition-colors cursor-pointer">
            <Menu size={18} className="text-primary" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl">
          <div className="flex items-center justify-center w-8 h-1 bg-muted rounded-full mx-auto mb-6" />
          
          <div className="space-y-1 pb-4">
            {/* Profile Settings */}
            <button
              onClick={handleProfileSettings}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <User size={18} className="text-muted-foreground flex-shrink-0" />
              <span className="text-[14px] font-medium text-foreground">Profile Settings</span>
            </button>

            {/* Account Security */}
            <button
              onClick={handleProfileSettings}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <Lock size={18} className="text-muted-foreground flex-shrink-0" />
              <span className="text-[14px] font-medium text-foreground">Account Security</span>
            </button>

            {/* Divider */}
            <div className="h-px bg-border my-2" />

            {/* Theme toggle */}
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

            {/* Divider */}
            <div className="h-px bg-border my-2" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <LogOut size={18} className="text-muted-foreground flex-shrink-0" />
              <span className="text-[14px] font-medium text-foreground">Sign Out</span>
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setDeleteOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/5 transition-colors text-left"
            >
              <Trash2 size={18} className="text-destructive/60 flex-shrink-0" />
              <span className="text-[14px] font-medium text-destructive/70">Delete Account</span>
            </button>
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