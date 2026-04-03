// app/[locale]/p/annonces/details/[id]/page.tsx
import BackButton from "../../../../../../packages/ui/components/Navigation";
import { Metadata } from "next";
import AnnonceDetailUI from "../[id]/ui";
import { handleGetAnnonceDetails } from "./page.handlers/handleGetAnnonceDetails";

type PageParams = { id: string; locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const { annonce } = await handleGetAnnonceDetails({ id });

  if (!annonce) {
    return {
      title: "Annonce non trouvée | Rim EBay",
      description: "L'annonce demandée n'existe pas. Découvrez d'autres annonces sur notre plateforme.",
      keywords: ["annonce", "non trouvée", "erreur"],
      openGraph: {
        title: "Annonce non trouvée",
        description: "L'annonce demandée n'existe pas.",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Annonce non trouvée",
        description: "L'annonce demandée n'existe pas.",
      },
    };
  }

  const title = annonce.title || "Détails de l'annonce";
  const description = annonce.description
    ? annonce.description.substring(0, 160)
    : "Consultez les détails de cette annonce.";
  const keywords = [annonce.categorieName, annonce.lieuStr, "annonce", "vente", "achat"].filter(Boolean);

  return {
    title: `${title} | Eddeyar`,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "article",
      images: annonce.firstImagePath ? [{ url: annonce.firstImagePath, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: annonce.firstImagePath ? [annonce.firstImagePath] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AnnonceDetail({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id, locale } = await params;
  const { annonce } = await handleGetAnnonceDetails({ id });

  if (!annonce) {
    return <h1 className="text-2xl font-bold text-center mt-8">Annonce non trouvée</h1>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-9 overflow-hidden">
      <div className="md:ml-32 lg:ml-44">
        <BackButton />
      </div>
      <AnnonceDetailUI
        lang={locale || "fr"}
        annonceId={String(annonce.id)}
        annonce={annonce}
      />
    </div>
  );
}
