# Connection Health Check Edge Function

This function updates connection heartbeat/error status without exposing secrets in the frontend.

## Security Pattern

- Do not pass credentials from client UIs.
- Call this function from trusted backend jobs/workers only.
- Protect with `x-health-check-token` header.
- Store `CONNECTION_HEALTH_CHECK_TOKEN` as a Supabase function secret.

## Required Function Secrets

- `CONNECTION_HEALTH_CHECK_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Example Request

```bash
curl -X POST "https://<project-ref>.functions.supabase.co/connection-health-check" \
  -H "Content-Type: application/json" \
  -H "x-health-check-token: $CONNECTION_HEALTH_CHECK_TOKEN" \
  -d '{
    "connection_id": "00000000-0000-0000-0000-000000000000",
    "success": true
  }'
```

For failed checks:

```json
{
  "connection_id": "00000000-0000-0000-0000-000000000000",
  "success": false,
  "error_message": "Timeout contacting endpoint"
}
```
