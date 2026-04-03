export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  handlePostMyAnnonce,
  UnauthorizedError,
  BadRequestError,
} from "./route.handlers/handlePostMyAnnonce";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const result = await handlePostMyAnnonce({ request });
    return NextResponse.json(result.data, { status: result.status });
  } catch (e) {
    if (e instanceof UnauthorizedError)
      return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("POST my/annonces error:", e);
    return NextResponse.json({ error: "Error creating annonce" }, { status: 500 });
  }
}
