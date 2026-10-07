import type { ReactNode } from 'react'

type IconName = 'weird' | 'learn' | 'explore' | 'chaos' | 'arrow' | 'sound' | 'mute' | 'star' | 'close'

export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    weird: <><path d="M7 7c-4 4-4 7 0 10s7 3 10-1 3-7-1-10-6-2-9 1Z" /><path d="m8 10 1 .5M15 10l1-.5M10 15c1.5 1 3 1 4 0" /><path d="m5 5-2-2m16 2 2-2" /></>,
    learn: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    explore: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
    chaos: <><rect x="4" y="4" width="16" height="16" rx="4" transform="rotate(-12 12 12)" /><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" strokeWidth="3" strokeLinecap="round" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    sound: <><path d="m11 4-5 4H3v8h3l5 4V4Zm4 4c2 2 2 6 0 8m3-11c4 4 4 10 0 14" /></>,
    mute: <><path d="m11 4-5 4H3v8h3l5 4V4Zm5 5 6 6m0-6-6 6" /></>,
    star: <><path d="M12 1v22M1 12h22M4 4l16 16M4 20 20 4" /><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  }
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{paths[name]}</svg>
}
