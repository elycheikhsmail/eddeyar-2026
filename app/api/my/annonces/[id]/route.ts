import { NextResponse } from "next/server";
import {
  handleGetMyAnnonce,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "./route.handlers/handleGetMyAnnonce";
import { handlePutMyAnnonce } from "./route.handlers/handlePutMyAnnonce";
import { handleDeleteMyAnnonce } from "./route.handlers/handleDeleteMyAnnonce";
import type { PutBody } from "./route.handlers/handleMyAnnonce.interface";

export async function GET(_req: Request, ctx: any) {
  const { id } = await ctx.params;
  try {
    const result = await handleGetMyAnnonce({ id });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    if (e instanceof UnauthorizedError)
      return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof NotFoundError)
      return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("GET annonce error:", e);
    return NextResponse.json({ error: "Error getting annonce" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: any) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as PutBody;
    const result = await handlePutMyAnnonce({ id, body });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    if (e instanceof UnauthorizedError)
      return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof NotFoundError)
      return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("PUT annonce error:", e);
    return NextResponse.json({ error: "Error updating annonce" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: any) {
  const { id } = await ctx.params;
  try {
    const result = await handleDeleteMyAnnonce({ id });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    if (e instanceof UnauthorizedError)
      return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof NotFoundError)
      return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("DELETE annonce error:", e);
    return NextResponse.json({ error: "Error deleting annonce" }, { status: 500 });
  }
}
