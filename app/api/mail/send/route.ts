import { handleMailSend } from "./route.handlers/handleMailSend";

export async function GET(_request: Request) {
  const result = await handleMailSend({});
  return new Response(result.message, { status: result.status, headers: { "Content-Type": "text/plain" } });
}
