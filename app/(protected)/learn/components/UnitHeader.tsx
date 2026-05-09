interface UnitHeaderProps {
  unitNumber: number;
  title: string;
  description: string;
}

export const UnitHeader = ({ unitNumber, title, description }: UnitHeaderProps) => (
  <header className="mb-4">
    <p className="text-sm font-semibold text-emerald-700">Unidade {unitNumber}</p>
    <h2 className="text-xl font-bold">{title}</h2>
    <p className="text-sm text-zinc-600">{description}</p>
  </header>
);
