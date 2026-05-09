interface ExitLessonModalProps {
  open: boolean;
  onContinue: () => void;
  onExit: () => void;
}

export const ExitLessonModal = ({ open, onContinue, onExit }: ExitLessonModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="exit-lesson-title">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h2 id="exit-lesson-title" className="text-xl font-semibold">Sair da lição?</h2>
        <p className="mt-2 text-sm text-zinc-600">Seu progresso desta lição não concluída será perdido.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onContinue} className="rounded-lg border border-zinc-300 px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Continuar</button>
          <button type="button" onClick={onExit} className="rounded-lg bg-red-600 px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Sair</button>
        </div>
      </div>
    </div>
  );
};
