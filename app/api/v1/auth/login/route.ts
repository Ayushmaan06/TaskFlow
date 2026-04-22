import { NextRequest } from "next/server";
import { login } from "@/modules/auth/controller";

export async function POST(req: NextRequest) {
  return login(req);
}
