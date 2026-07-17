export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-gold-dim border-t-gold-bright" />
        <p className="text-[13px] text-mist-dim">{label}</p>
      </div>
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="max-w-sm text-center">
        <p className="text-[14px] text-rust">{message}</p>
      </div>
    </div>
  );
}
