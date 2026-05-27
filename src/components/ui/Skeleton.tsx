export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-skeleton rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`} />
  )
}

/** Skeleton de tarjeta de nota */
export function SkeletonNota() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

/** Skeleton de tarjeta de alarma */
export function SkeletonAlarma() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-3">
      <Skeleton className="h-6 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

/** Skeleton de fila de temática en panel lateral */
export function SkeletonTema() {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
      <Skeleton className="h-4 flex-1" />
    </div>
  )
}

/** Skeleton de fila de concepto en sidebar */
export function SkeletonConcepto() {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <Skeleton className="h-6 w-6 rounded shrink-0" />
      <Skeleton className="h-4 flex-1" />
    </div>
  )
}
