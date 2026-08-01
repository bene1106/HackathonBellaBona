import { ReactNode } from "react";

export default function NotificationCard({
  avatar,
  title,
  body,
  meta,
  onClick,
  className = "",
}: {
  avatar: ReactNode;
  title: string;
  body: ReactNode;
  meta?: string;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-[20px] border border-paper/10 bg-paper/[0.07] p-4 text-left shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl ${
        onClick ? "transition active:scale-[0.98]" : ""
      } ${className}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper/10 font-display text-base font-bold text-paper">
        {avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[15px] font-semibold leading-snug text-paper">
            {title}
          </p>
          {meta && (
            <span className="shrink-0 font-mono text-[11px] text-paper/40">
              {meta}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[13px] leading-snug text-paper/55">{body}</div>
      </div>
    </Tag>
  );
}
