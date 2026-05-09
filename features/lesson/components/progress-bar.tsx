interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div aria-label="Progresso da lição" className="w-full" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <div className="h-3 w-full rounded-full bg-zinc-200">
        <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-sm text-zinc-600">{percent}% concluído</p>
    </div>
  );
};
