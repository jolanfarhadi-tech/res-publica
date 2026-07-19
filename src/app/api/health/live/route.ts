export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "live" },
    { headers: { "cache-control": "no-store" } }
  );
}
