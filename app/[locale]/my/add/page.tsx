// app/[locale]/my/add/page.tsx
import AddAnnonceWizard from "./AddAnnonceWizard";
import { handleGetMyStatus } from "./page.handlers/handleGetMyStatus";

export default async function AddAnnonce(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const relavieUrlAnnonce = `/api/my/annonces`;
  const relavieUrlOptionsModel = `/${params.locale}/p/api/mongodb`;

  const { isSamsar } = await handleGetMyStatus();

  return (
    <AddAnnonceWizard
      lang={params.locale}
      relavieUrlOptionsModel={relavieUrlOptionsModel}
      relavieUrlAnnonce={relavieUrlAnnonce}
      isSamsar={isSamsar}
    />
  );
}
