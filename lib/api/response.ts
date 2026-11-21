import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string[]>
) {
  return NextResponse.json(
    {
      data: null,
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    { status }
  );
}
