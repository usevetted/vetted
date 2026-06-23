export default function LoadingScreen({ fullscreen = true, label }) {
  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-[300]' : 'flex-1 flex'} flex flex-col items-center justify-center bg-white gap-3`}>
      <div className="w-7 h-7 border-2 border-secondary border-t-primary rounded-full animate-spin" />
      {label && <p className="text-[12px] text-muted-foreground">{label}</p>}
    </div>
  );
}