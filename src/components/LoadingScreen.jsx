export default function LoadingScreen({ fullscreen = true, label }) {
  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-[300] bg-background' : 'flex-1'} flex flex-col items-center justify-center gap-5`}>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-[32px] font-semibold text-primary tracking-tight">Vetted</h1>
        <p className="text-[13px] text-muted-foreground">Connecting talent with opportunity</p>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-primary/70 animate-pulse"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
          />
        ))}
      </div>
      {label && <p className="text-[12px] text-muted-foreground">{label}</p>}
    </div>
  );
}