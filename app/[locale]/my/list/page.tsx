import { MyListAnnoncesUI } from "./ui";
import { FormSearchUI } from "../../../../packages/ui/components/FormSearch/FormSearchUI";
import { handleGetMyAnnonces } from "./page.handlers/handleGetMyAnnonces";
import type { UserAnnoncesSearch } from "./page.handlers/handleGetMyAnnonces.interface";

type Params = { locale: string };

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<UserAnnoncesSearch>;
}) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};

  const spUser: UserAnnoncesSearch = {
    page: sp.page,
    typeAnnonceId: sp.typeAnnonceId,
    categorieId: sp.categorieId,
    subCategorieId: sp.subCategorieId,
    price: sp.price,
  };

  const { annonces, totalPages, currentPage } = await handleGetMyAnnonces(spUser);

  let apiBase = process.env.NEXT_PUBLIC_OPTIONS_API_MODE;
  const lieuxEndpoint = `/${locale}/p/api/mongodb/lieux`;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="md:hidden pt-4 flex justify-center"></div>

      <div className="flex flex-col md:flex-row min-h-screen max-w-screen-2xl mx-auto gap-6 px-2 md:px-4 py-4 md:py-8">
        {/* Sidebar Desktop */}
        <div className="hidden md:block md:basis-1/5 md:w-1/5">
          <FormSearchUI
            lang={locale}
            typeAnnoncesEndpoint={`/fr/p/api/${apiBase}/options`}
            lieuxEndpoint={lieuxEndpoint}
            categoriesEndpoint={`/fr/p/api/${apiBase}/options`}
            subCategoriesEndpoint={`/fr/p/api/${apiBase}/options`}
          />
        </div>

        {/* Main */}
        <section className="flex-1 bg-white rounded-2xl shadow-lg p-4 md:p-8 min-w-0">
          {annonces.length ? (
            <MyListAnnoncesUI
              totalPages={totalPages}
              currentPage={currentPage}
              annonces={annonces}
              lang={locale}
              imageServiceUrl="https://picsum.photos"
            />
          ) : (
            <div className="flex justify-center items-center">
              <div>{locale === "fr" ? "Aucun annonce pour le moment ." : "لا يوجد إعلانات حاليا."}</div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
