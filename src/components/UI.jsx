// Shared reusable UI components

export function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`bg-card border border-border rounded-2xl shadow-lg relative z-10 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function ModalCard({ children, className = '', style = {} }) {
  return (
    <div
      className={`bg-bg-2 border border-border rounded-2xl shadow-2xl relative z-10 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function Label({ children }) {
  return (
    <div className="text-xs font-semibold tracking-widest uppercase text-muted mb-1.5">
      {children}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-[rgba(14,26,43,0.8)] border border-border text-txt placeholder-muted-2/60 rounded-xl px-3 py-2 text-sm outline-none transition-all focus:border-cyan/60 focus:bg-[rgba(14,26,43,1)] focus:ring-2 focus:ring-cyan/10 ${className}`}
      {...props}
    />
  )
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full bg-[rgba(14,26,43,0.8)] border border-border text-txt rounded-xl px-3 py-2 text-sm outline-none transition-all focus:border-cyan/60 focus:ring-2 focus:ring-cyan/10 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function BtnPrimary({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-gradient-to-br from-cyan to-indigo border border-cyan/30 text-bg text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:from-cyan-h hover:to-[#5abbff] hover:shadow-lg hover:shadow-cyan/20 hover:-translate-y-0.5 disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function BtnGhost({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-[rgba(24,44,71,0.6)] border border-border text-muted text-sm font-medium px-3.5 py-1.5 rounded-xl cursor-pointer transition-all hover:bg-[rgba(24,44,71,0.9)] hover:border-cyan/40 hover:text-cyan ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function BtnDanger({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-[rgba(255,0,60,0.08)] border border-[rgba(255,0,60,0.25)] text-red-400 text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer transition-all hover:bg-[rgba(255,0,60,0.16)] hover:border-red-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function BtnGold({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-1.5 bg-[rgba(24,44,71,0.7)] border border-gold/30 text-gold text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all hover:bg-[rgba(24,44,71,1)] hover:border-gold/70 hover:text-gold-h hover:shadow-md hover:shadow-gold/20 hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function BtnReset({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-1.5 bg-[rgba(24,44,71,0.7)] border border-red-500/25 text-red-400 text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all hover:bg-[rgba(239,68,68,0.12)] hover:border-red-500/50 hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Pill({ children, color = 'cyan' }) {
  const colors = {
    cyan:    'bg-cyan/10 text-cyan border-cyan/30',
    indigo:  'bg-cyan/10 text-indigo border-indigo/30',
    emerald: 'bg-emerald/10 text-emerald border-emerald/30',
    yellow:  'bg-yellow/10 text-yellow border-yellow/30',
    red:     'bg-red-500/10 text-red-400 border-red-500/30',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide ${colors[color] || colors.cyan}`}>
      {children}
    </span>
  )
}

export function RankBadge({ index, pts, threshold = 40 }) {
  let cls = ''
  if (index === 0) cls = 'r1'
  else if (index === 1) cls = 'r2'
  else if (index === 2) cls = 'r3'
  else if (index === 3) cls = 'r4'
  else if (pts >= threshold) cls = 'r5'
  else cls = 'rn'
  return (
    <div className={`rank-badge ${cls}`}>{index + 1}</div>
  )
}

export function SectionIcon({ children, color = 'cyan' }) {
  const colors = {
    cyan:    'bg-cyan/10 border-cyan/25',
    indigo:  'bg-cyan/10 border-cyan/25',
    emerald: 'bg-emerald/10 border-emerald/25',
    yellow:  'bg-yellow/10 border-yellow/25',
    red:     'bg-red-500/10 border-red-500/25',
    gold:    'bg-gold/10 border-gold/25',
  }
  return (
    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${colors[color] || colors.cyan}`}>
      {children}
    </div>
  )
}

export function Modal({ show, onClose, children }) {
  if (!show) return null
  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 fade-up"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  )
}

export function TimeTag({ children }) {
  return (
    <span className="inline-block bg-cyan/10 border border-cyan/30 text-cyan rounded px-1.5 py-px text-[0.68rem] mx-0.5">
      {children}
    </span>
  )
}
