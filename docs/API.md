# API boundary

The future NestJS API uses REST/JSON with an OpenAPI contract before a client uses it.
Public endpoints can serve only published, verified, versioned content.
Administrative mutations require authenticated roles, workflow validation, and an
append-only audit record. The API never represents opening the dialer as a connected
emergency call.
