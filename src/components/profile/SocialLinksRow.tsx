import { Globe } from "lucide-react";
import { filledSocialLinks, type SocialNetworkKey } from "@/lib/profileSocial";

const iconClass = "w-4 h-4";

function NetworkIcon({ network }: { network: SocialNetworkKey }) {
  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  if (network === "twitter") {
    return (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
        <path
          fill="currentColor"
          d="M14.7 10.3 22 2h-2.2l-6.3 7.1L8.5 2H2l7.8 11.1L2 22h2.2l6.9-7.8L15.5 22H22l-7.3-11.7Zm-2.4 2.7-.8-1.1L5.1 3.5h2.7l5.1 7.2.8 1.1 6.6 9.3h-2.7l-5.3-7.1Z"
        />
      </svg>
    );
  }
  if (network === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
        <path
          fill="currentColor"
          d="M23 12.2s0-3.3-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C19.2 5.3 12 5.3 12 5.3s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.9 1 12.2 1 12.2s0 3.3.4 4.7c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.7.4-4.7ZM9.8 15.6V8.8l6.2 3.4-6.2 3.4Z"
        />
      </svg>
    );
  }
  if (network === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
        <path
          fill="currentColor"
          d="M6.7 9.3H3.8V20h2.9V9.3ZM5.3 4C4.3 4 3.5 4.8 3.5 5.8S4.3 7.6 5.3 7.6 7 6.8 7 5.8 6.2 4 5.3 4ZM20.2 20h-2.9v-5.6c0-1.6-.6-2.5-1.9-2.5-1 0-1.5.7-1.8 1.3-.1.2-.1.5-.1.8V20h-2.9s.1-8.8 0-10.7h2.9v1.7c.5-.8 1.5-1.9 3.6-1.9 2.6 0 4.6 1.7 4.6 5.4V20Z"
        />
      </svg>
    );
  }
  if (network === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
        <path
          fill="currentColor"
          d="M19.6 7.8a6.7 6.7 0 0 1-3.9-1.2v7.3a6.1 6.1 0 1 1-6.1-6.1c.2 0 .4 0 .6.1v3a3.2 3.2 0 1 0 2.2 3V2h3a6.7 6.7 0 0 0 4.2 3.9v1.9Z"
        />
      </svg>
    );
  }
  return <Globe className={iconClass} aria-hidden />;
}

export default function SocialLinksRow({
  socialLinks,
  className,
}: {
  socialLinks: unknown;
  className?: string;
}) {
  const links = filledSocialLinks(socialLinks);
  if (links.length === 0) return null;

  return (
    <div className={className ?? "flex flex-wrap items-center gap-2"}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          aria-label={link.label}
          className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full bg-gray-100 dark:bg-[#2A3B42] text-gray-800 dark:text-gray-100 hover:bg-primary/15 hover:text-primary transition-colors"
        >
          <NetworkIcon network={link.key} />
        </a>
      ))}
    </div>
  );
}
