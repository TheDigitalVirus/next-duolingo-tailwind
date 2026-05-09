import type { NextPage } from "next";
import { charactersDataset } from "@/utils/characters";

const CharactersPage: NextPage = () => {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-800">Aprenda Caracteres</h1>
            <p className="text-sm text-zinc-600 sm:text-base">
              Domine vogais e consoantes com exemplos práticos e acompanhe seu progresso em cada símbolo.
            </p>
          </header>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600"
          >
            Começar
          </button>

          {charactersDataset.map((section) => (
            <div key={section.id} className="space-y-3">
              <h2 className="text-xl font-semibold text-zinc-800">{section.title}</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => (
                  <article
                    key={`${section.id}-${item.symbol}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-3xl font-bold text-zinc-900">{item.symbol}</span>
                      <span className="text-sm font-medium text-zinc-500">{item.progress}%</span>
                    </div>

                    <p className="mb-4 text-sm text-zinc-600">Exemplo: {item.example}</p>

                    <div className="h-2 w-full rounded-full bg-zinc-100" aria-hidden>
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Seu resumo</h3>
          <p className="mt-3 text-sm text-zinc-600">
            Este painel funciona como rightbar local para destacar progresso e manter o foco diário.
          </p>
          <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">
            Continue praticando para elevar todas as barras para 100%.
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CharactersPage;
