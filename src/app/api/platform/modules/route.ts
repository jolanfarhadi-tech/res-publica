export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { error: "not_found" },
    {
      status: 404,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}
