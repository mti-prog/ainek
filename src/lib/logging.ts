type LogLevel = "info" | "warn" | "error"

interface LogPayload {
  event: string
  level?: LogLevel
  [key: string]: unknown
}

export function logEvent({ event, level = "info", ...data }: LogPayload) {
  const payload = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...data,
  }

  const line = `[ainek] ${JSON.stringify(payload)}`

  if (level === "error") {
    console.error(line)
    return
  }

  if (level === "warn") {
    console.warn(line)
    return
  }

  console.info(line)
}
