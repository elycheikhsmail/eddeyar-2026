import { NextResponse } from "next/server";

// Type pour le corps de la requête attendu
interface ValidationRequest {
  phone?: string;
  lang?: string;
  code?: string | number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ validationKey: string }> }
) {
  // Extract route parameters. Note that in NextJS 15 `params` is a Promise and must be awaited first.
  const { validationKey } = await params;

  try {
    // 1. Vérifie le Token via les Headers
    const token = request.headers.get("Validation-token");
    if (!token || token !== process.env.CHINGUISOFT_VALIDATION_TOKEN) {
      return NextResponse.json(
        {
          code: 401,
          message: "Non autorisé. Jeton de validation manquant, invalide ou expiré.",
          success: false,
        },
        { status: 401 }
      );
    }

    // 2. Parse le body de la requête
    let body: ValidationRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        {
          code: 422,
          message: "Format JSON invalide",
          success: false,
        },
        { status: 422 }
      );
    }

    const { phone, lang, code } = body;

    // 3. Validation des règles (Phone et Lang)
    const errors: Record<string, string> = {};

    if (!phone) {
      errors.phone = "Le numéro de téléphone est obligatoire.";
    } else if (!/^[234]\d{7}$/.test(String(phone))) {
      errors.phone =
        "Le numéro de téléphone est invalide. Il doit faire 8 chiffres et commencer par 2, 3 ou 4.";
    }

    if (!lang) {
      errors.lang = "La langue est obligatoire.";
    } else if (lang !== "ar" && lang !== "fr") {
      errors.lang = "La langue doit être 'ar' ou 'fr'.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          code: 422,
          message: "Les données fournies sont invalides.",
          errors,
          success: false,
        },
        { status: 422 }
      );
    }

    // 4. Génération du Code OTP
    let finalCode = String(code || "");
    if (!finalCode || finalCode.trim() === "") {
      // Générer un code entre 3 et 6 chiffres (ex: 4 chiffres : 1000 à 9999)
      const length = Math.floor(Math.random() * 4) + 3; // 3, 4, 5 ou 6
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
      finalCode = String(Math.floor(min + Math.random() * (max - min + 1)));
      console.log({ finalCode })
    } else {
      if (!/^\d{3,6}$/.test(finalCode)) {
        return NextResponse.json(
          {
            code: 422,
            message: "Le code est invalide.",
            errors: { code: "Le code doit contenir entre 3 et 6 chiffres." },
            success: false,
          },
          { status: 422 }
        );
      }
    }

    // 5. Création du SMS complet 
    const sender = "Chinguisoft OTP";
    const text =
      lang === "fr"
        ? `Votre code de vérification est ${finalCode}. Ne le partagez avec personne.`
        : `رمز التحقق الخاص بك هو ${finalCode}. لا تشاركه مع أي شخص.`;


    // 7. Succès 200
    return NextResponse.json(
      {
        code: 200,
        message: "SMS envoyé avec succès.",
        data: {
          key: validationKey,
          phone: phone,
          status: "DELIVERED",
        },
        success: true,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur Inattendue:", error);
    return NextResponse.json(
      {
        code: 503,
        message: "Service temporairement indisponible.",
        success: false,
      },
      { status: 503 }
    );
  }
}
