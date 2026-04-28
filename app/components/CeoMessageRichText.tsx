import type { CeoMessagePart } from "@/lib/i18n/dictionaries";

type CeoMessageRichTextProps = {
  paragraphs: CeoMessagePart[][];
  className?: string;
  /** 각 `<p>` */
  paragraphClassName: string;
  strongClassName?: string;
};

/**
 * CEO Message 본문 — Figma: Noto 18px, `strong` 구간 볼드
 */
export function CeoMessageRichText({
  paragraphs,
  className,
  paragraphClassName,
  strongClassName = "font-bold text-zinc-900",
}: CeoMessageRichTextProps) {
  return (
    <div className={className}>
      {paragraphs.map((parts, i) => (
        <p key={i} className={paragraphClassName}>
          {parts.map((part, j) =>
            part.strong ? (
              <strong key={j} className={strongClassName}>
                {part.text}
              </strong>
            ) : (
              <span key={j}>{part.text}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
