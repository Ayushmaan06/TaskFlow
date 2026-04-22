import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  errors?: unknown;
}

export function successResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function createdResponse<T>(
  data: T,
  message: string = "Resource created successfully"
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function errorResponse(
  message: string,
  status: number = 400,
  errors?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    { status }
  );
}
