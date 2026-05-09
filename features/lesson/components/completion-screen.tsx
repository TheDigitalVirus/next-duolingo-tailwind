interface CompletionScreenProps {
  xpEarned: number;
  gemsEarned: number;
  onBackToLearn: () => void;
}

export const CompletionScreen = ({ xpEarned, gemsEarned, onBackToLearn }: CompletionScreenProps) => (
  <section aria-labelledby="completion-title" className="rounded-xl border border-emerald-300 bg-emerald-50 p-6">
    <h2 id="completion-title" className="text-2xl font-bold text-emerald-700">Lição concluída! 🎉</h2>
    <p className="mt-3 text-zinc-700">Você ganhou +{xpEarned} XP e +{gemsEarned} gems.</p>
    <button
      type="button"
      onClick={onBackToLearn}
      className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      Voltar para aprender
    </button>
  </section>
);
