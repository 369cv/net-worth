export default function Logo({ size = 22 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"><rect x="2.5" y="2.5" width="27" height="27" rx="9.5" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M9.5 20.5l5-5.5 3.5 3.5 5.5-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
