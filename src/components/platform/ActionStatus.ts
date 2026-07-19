export type ActionState = "idle" | "submitting" | "success" | "waitlisted" | "forbidden" | "duplicate" | "unavailable" | "error";

export async function actionStateFromResponse(response: Response): Promise<ActionState> {
  if (response.ok) {
    const body = await response.json().catch(() => ({})) as { registration?: { status?: string } };
    return body.registration?.status === "waitlisted" ? "waitlisted" : "success";
  }
  if (response.status === 403) return "forbidden";
  if (response.status === 409) return "duplicate";
  if (response.status === 503) return "unavailable";
  return "error";
}
