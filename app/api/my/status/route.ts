import { NextResponse } from "next/server";
import { handleGetMyStatus } from "./route.handlers/handleGetMyStatus";

export async function GET(_request: Request) {
  try {
    const data = await handleGetMyStatus({});
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json({ error: "Failed to fetch user status" }, { status: 500 });
  }
}
