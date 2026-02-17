export function ok(data: any, status = 200) {
  return Response.json({ data }, { status });
}
export function fail(error: { code: string, message: string, context?: any }, status = 400) {
  return Response.json({ error }, { status });
}
