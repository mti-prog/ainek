import { NextResponse } from "next/server"

export function apiError(
  message: string,
  status: number,
  code: string,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

export function apiOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
