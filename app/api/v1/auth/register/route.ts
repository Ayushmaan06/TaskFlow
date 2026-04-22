import { NextRequest } from "next/server";
import { register } from "@/modules/auth/controller";

export async function POST(req: NextRequest) {
  return register(req);
}
