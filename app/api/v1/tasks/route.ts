import { NextRequest } from "next/server";
import { handleCreateTask, handleGetTasks } from "@/modules/task/controller";

export async function POST(req: NextRequest) {
  return handleCreateTask(req);
}

export async function GET(req: NextRequest) {
  return handleGetTasks(req);
}
