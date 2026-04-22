import { NextRequest } from "next/server";
import { handleGetAllUsers } from "@/modules/user/controller";

export async function GET(req: NextRequest) {
  return handleGetAllUsers(req);
}
