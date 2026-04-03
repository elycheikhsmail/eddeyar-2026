import MyAnnonceDetailsUI from "./ui";
import BackButton from "../../../../../packages/ui/components/Navigation";
import { getI18n } from "../../../../../locales/server";
import { handleGetMyStatus } from "./page.handlers/handleGetMyStatus";

type PageParams = { locale: string; id: string };

export default async function AnnonceDetail({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, id } = await params;
  const t = await getI18n();

  const { isSamsar } = await handleGetMyStatus();

  const baseApiOptions = "/fr/p/api/mongodb";
  const typeAnnoncesEndpoint = `${baseApiOptions}/options`;
  const categoriesEndpoint = `${baseApiOptions}/options`;
  const subCategoriesEndpoint = `${baseApiOptions}/options`;

  const getAnnonceUrl = `/api/my/annonces/${id}`;
  const updateAnnonceEndpoint = `/api/my/annonces/${id}`;

  return (
    <div className="p-4 sm:p-6 md:p-9 overflow-hidden">
      <div><BackButton /></div>

      <MyAnnonceDetailsUI
        lang={locale}
        userFromDB={isSamsar}
        i18nAnnonce={t("filter.Annonces")}
        i18nContact={t("footer.contact")}
        i18nPrix={t("filter.price")}
        i18nNotificationsCreating={t("notifications.creating")}
        i18nNotificationsErrorDelete={t("notifications.errordelete")}
        i18nNotificationsSuccessDelete={t("notifications.successdelete")}
        annonceId={id}
        retiveUrldetailsAnnonce={getAnnonceUrl}
        typeAnnoncesEndpoint={typeAnnoncesEndpoint}
        categoriesEndpoint={categoriesEndpoint}
        subCategoriesEndpoint={subCategoriesEndpoint}
        updateAnnonceEndpoint={updateAnnonceEndpoint}
      />
    </div>
  );
}
