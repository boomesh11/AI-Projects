'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigation items — labeled by user intent, not feature name.
 * Each label answers a question the user already has in their head.
 */
const NAV_ITEMS = [
  {
    href: "/today",
    label: "Today",
    description: "What needs my attention?",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
        <path d="M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
        <path d="M2 6.5H14" stroke="currentColor" strokeWidth="1.25"/>
        <circle cx="5.5" cy="9.5" r="1" fill="currentColor"/>
        <circle cx="8" cy="9.5" r="1" fill="currentColor"/>
        <circle cx="10.5" cy="9.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/work",
    label: "Work",
    description: "What am I building?",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 4.5C2 3.67 2.67 3 3.5 3H12.5C13.33 3 14 3.67 14 4.5V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M5 7H11M5 9.5H8.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/docs",
    label: "Docs",
    description: "What have we written?",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 2H10L13 5V14H4V2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
        <path d="M10 2V5H13" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
        <path d="M6 8H10M6 10.5H9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/people",
    label: "People",
    description: "Who is doing what?",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M1.5 13.5C1.5 11.01 3.51 9 6 9C8.49 9 10.5 11.01 10.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
        <circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M13 9.5C13.97 9.81 14.5 10.9 14.5 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/pulse",
    label: "Pulse",
    description: "How are things moving?",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1.5 8H4L5.5 4L8 12L10.5 5.5L12 8H14.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
] as const;

/**
 * IntentRail — the primary workspace navigation.
 *
 * Navigation is intent-driven: each item answers a question the user has,
 * rather than naming a feature. The active item is indicated by a 2px
 * amber left border and elevated text weight — no background fills.
 *
 * Client Component: requires usePathname() for active state detection.
 */
export default function IntentRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspace navigation"
      style={{
        width: "var(--rail-width)",
        minWidth: "var(--rail-width)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border-default)",
        backgroundColor: "var(--surface-base)",
        flexShrink: 0,
      }}
    >
      {/* ── Workspace identity ──────────────────────────────────── */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Logo mark + workspace name */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Catalyst Studio logomark — abstract "C" in amber */}
          <div
            aria-hidden="true"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M11 4C10.1 2.8 8.65 2 7 2C4.24 2 2 4.24 2 7C2 9.76 4.24 12 7 12C8.65 12 10.1 11.2 11 10"
                stroke="white"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              Meridian Co.
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                lineHeight: 1.2,
                marginTop: "2px",
              }}
            >
              Workspace
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation items ────────────────────────────────────── */}
      <ul
        role="list"
        style={{
          flex: 1,
          padding: "8px 0",
          overflowY: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={item.description}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 16px",
                  /* Active indicator: 2px amber left border inset */
                  borderLeft: isActive
                    ? "2px solid var(--border-accent)"
                    : "2px solid transparent",
                  /* Compensate padding so content stays aligned */
                  paddingLeft: isActive ? "14px" : "14px",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? 500 : 400,
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "color var(--transition-base), border-color var(--transition-base)",
                  cursor: "pointer",
                }}
                /* Hover handled via CSS — JS hover would cause unnecessary re-renders */
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ── Bottom cluster: user identity ───────────────────────── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* User avatar with initials fallback */}
        <div
          aria-hidden="true"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--surface-inset)",
            border: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            flexShrink: 0,
          }}
        >
          AC
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Alex Chen
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              lineHeight: 1.2,
              marginTop: "2px",
            }}
          >
            Product Lead
          </p>
        </div>
      </div>
    </nav>
  );
}
