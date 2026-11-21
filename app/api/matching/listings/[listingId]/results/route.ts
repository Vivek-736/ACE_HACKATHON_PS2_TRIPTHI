import { NextRequest } from "next/server";
import { POST } from "../run/route";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  // Delegate directly to the matching engine calculation
  return POST(req, context);
}
