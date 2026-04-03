import { NextResponse } from "next/server";
import { handleSmsValidation } from "./route.handlers/handleSmsValidation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ validationKey: string }> }
) {
  const { validationKey } = await params;
  try {
    const result = await handleSmsValidation({ validationKey, request });
    const httpStatus = result.code === 200 ? 200 : result.code >= 400 ? result.code : 200;
    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    console.error("Erreur Inattendue:", error);
    return NextResponse.json(
      { code: 503, message: "Service temporairement indisponible.", success: false },
      { status: 503 }
    );
  }
}
