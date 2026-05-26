export default function Placeholder({
  titulo,
  fase,
}: {
  titulo: string
  fase: string
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-600">
      <h2 className="mb-2 text-xl font-semibold">{titulo}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Esta sección se construirá en la {fase}.
      </p>
    </div>
  )
}
