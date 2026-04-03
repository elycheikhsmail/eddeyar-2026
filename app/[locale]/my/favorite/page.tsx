// app/[locale]/favorites/page.tsx
import { getI18n } from "../../../../locales/server";
import ListAnnoncesUI from "../../ui/ListAnnoncesUI";
import AnnoceTitle from "../../../../packages/ui/components/AnnoceTitle";
import { handleGetMyFavorites } from "./page.handlers/handleGetMyFavorites";
import type { HandleGetMyFavoritesInput } from "./page.handlers/handleGetMyFavorites.interface";

type Params = { locale: string };

export default async function FavoritesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<HandleGetMyFavoritesInput>;
}) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const t = await getI18n();

  const { annonces, totalPages, currentPage, unauthorized } = await handleGetMyFavorites({ page: sp.page });

  if (unauthorized) {
    return (
      <main className="min-h-screen bg-gray-100">
        <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 mt-6">
          <AnnoceTitle title={t("nav.favorites")} />
          <p className="mt-4 text-gray-600">
            {t("card.loginRequired")}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row items-center md:items-start min-h-screen max-w-screen-2xl mx-auto gap-6 px-2 md:px-4 py-4 md:py-8">
        <section className="w-full max-w-[720px] md:max-w-none md:flex-1 mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-8 min-w-0">
          <div className="mb-6">
            <AnnoceTitle title={t("nav.favorites")} />
          </div>

          {annonces.length ? (
            <ListAnnoncesUI
              totalPages={totalPages}
              currentPage={currentPage}
              lang={locale}
              annonces={annonces}
              imageServiceUrl="https://picsum.photos"
              favoriteIds={annonces.map(a => String(a.id))}
            />
          ) : (
            <div className="py-16 text-center text-gray-500">
              {t("card.empty")}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
