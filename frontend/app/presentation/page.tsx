import { AstrenMark } from '@/components/layout/AstrenMark';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { Metadata } from 'next';
import Link from 'next/link';

const origin = 'https://coach.florent-huitric.fr';
const description = 'Un espace pour préparer vos séances de volley, visualiser le placement sur un terrain interactif et organiser le travail de votre équipe.';
export const metadata: Metadata = {
  title: 'VolleyCoaching — terrain tactique et préparation des entraînements',
  description,
  alternates: { canonical: '/presentation' },
  robots: { index: true, follow: true },
  openGraph: { title: 'VolleyCoaching — préparer le jeu ensemble', description, url: origin + '/presentation', type: 'website', locale: 'fr_FR' },
};

export default function Presentation() {
  const features = [
    ['01', 'Voir le jeu.', 'Un terrain interactif pour travailler les positions, les rotations et les situations tactiques.'],
    ['02', 'Préparer la séance.', 'Retrouver les exercices et organiser les entraînements dans un même espace de travail.'],
    ['03', 'Accompagner l’équipe.', 'Un espace dédié à l’effectif, à l’équipe et aux évaluations pour suivre le travail au fil des séances.'],
  ];
  const structuredData = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'VolleyCoaching', url: origin + '/presentation', applicationCategory: 'SportsApplication', operatingSystem: 'Web browser', inLanguage: 'fr', description };
  return (
    <main lang="fr" className="min-h-screen astren-workspace astren-presentation">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, String.fromCharCode(92) + 'u003c') }} />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Link href="/presentation" className="astren-brand"><AstrenMark/>Volley<span className="text-primary">Coaching</span></Link>
        <div className="flex items-center gap-3"><ThemeToggle/><Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-primary dark:border-slate-700">Connexion ↗</Link></div>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-primary">Le volley se prépare aussi hors du terrain</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Une idée de jeu.<br /><span className="text-primary">Un plan pour l’équipe.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90">Accéder à mon espace ↗</Link>
            <a href="#outils" className="rounded-full border border-slate-300 px-6 py-3 font-semibold transition hover:border-primary dark:border-slate-700">Découvrir les outils ↓</a>
          </div>
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">L’espace de travail est accessible après connexion.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-10">
          <div className="mb-6 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"><span>Du placement à l’intention</span><span className="text-primary">06 positions</span></div>
          <svg viewBox="0 0 320 350" role="img" aria-label="Illustration d’un terrain de volley avec six positions" className="mx-auto w-full max-w-sm">
            <rect x="25" y="20" width="270" height="305" rx="12" fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="2" />
            <path d="M25 173H295M25 115H295M25 230H295" stroke="hsl(var(--primary))" strokeWidth="2" />
            <path d="M10 173H310" stroke="var(--astren-sky)" strokeWidth="5" />
            {[[74,261],[160,261],[246,261],[74,205],[160,205],[246,205]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="17" fill="hsl(var(--primary))" /><text x={x} y={y+5} textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="14" fontWeight="bold">{[5,6,1,4,3,2][i]}</text></g>)}
            <path d="M160 242 Q130 200 116 142" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="115" cy="132" r="8" fill="var(--astren-sky)" />
          </svg>
          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">Visualiser. Préparer. Ajuster.</p>
        </div>
      </section>
      <section id="outils" className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
        <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">Un espace pour construire vos entraînements.</h2>
        <div className="grid gap-5 md:grid-cols-3">{features.map(([number,title,text])=><article key={number} className="rounded-2xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900"><p className="mb-6 text-sm font-bold text-primary">{number}</p><h3 className="mb-3 text-xl font-bold">{title}</h3><p className="leading-relaxed text-slate-600 dark:text-slate-300">{text}</p></article>)}</div>
      </section>
      <footer className="border-t border-slate-200 px-6 py-8 dark:border-slate-800"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400"><p>VolleyCoaching · Préparer le jeu ensemble.</p><a href="https://florent-huitric.fr" className="underline underline-offset-4">Un projet de Florent Huitric ↗</a></div></footer>
    </main>
  );
}
