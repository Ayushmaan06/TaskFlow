import { NextRequest } from "next/server";
import {
  handleGetTaskById,
  handleUpdateTask,
  handleDeleteTask,
} from "@/modules/task/controller";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetTaskById(req, id);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdateTask(req, id);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleDeleteTask(req, id);
}
