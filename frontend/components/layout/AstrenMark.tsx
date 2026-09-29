export function AstrenMark({className = ''}: {className?: string}) {
 return <svg className={`astren-mark ${className}`} viewBox="0 0 100 70" fill="none" aria-hidden="true">
  <path d="M9 21Q49 4 91 20" stroke="var(--astren-sky)" strokeWidth="1.4"/>
  <path d="M7 38Q49 2 92 38Q49 70 7 38Z" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M54 23a17 17 0 1 0 8 29 16 16 0 0 1-8-29Z" fill="currentColor"/>
  <circle cx="67" cy="25" r="2" fill="var(--astren-sky)"/>
  <path d="M50 59v7m-3-3.5h6" stroke="currentColor"/>
 </svg>;
}
