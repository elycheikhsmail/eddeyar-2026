 
// app/[locale]/my/add/page.tsx
import AddAnnonceWizard from "./AddAnnonceWizard";
import { getUserFromCookies } from "../../../../utiles/getUserFomCookies";
import { getUserStatus } from "../../../../lib/services/annoncesService";

export default async function AddAnnonce(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  // console.log("Locale from params:", params);

  const relavieUrlAnnonce = `/api/my/annonces`;
  let relavieUrlOptionsModel = `/${params.locale}/p/api/mongodb`;
 

  let isSamsar;

  const user = await getUserFromCookies();
  
  if(user){
    const status = await getUserStatus(String(user.id));
    isSamsar = status.isSamsar;
  }



  return (
    <AddAnnonceWizard
      lang={params.locale}
      relavieUrlOptionsModel={relavieUrlOptionsModel}
      relavieUrlAnnonce={relavieUrlAnnonce}
      isSamsar={isSamsar}
    />
  );
}
