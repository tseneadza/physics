# Physics API Reference

Base URL: `http://127.0.0.1:4000`

## GET /api/disciplines
Returns the list of disciplines and available topics.

### Example
```bash
curl -s "http://127.0.0.1:4000/api/disciplines"
```

### Response (200)
```json
{
  "disciplines": [
    {
      "name": "Mechanics",
      "topics": ["Kinematics", "Newton's Laws"]
    }
  ]
}
```

## GET /api/lesson
Returns lesson text for a given discipline/topic and level.

### Query Parameters
- `discipline` (required): discipline name
- `topic` (required): topic name
- `level` (optional): `basics` or `intermediate` (defaults to `basics`)

### Example
```bash
curl -s "http://127.0.0.1:4000/api/lesson?discipline=Mechanics&topic=Kinematics&level=basics"
```

### Response (200)
```json
{
  "discipline": "Mechanics",
  "topic": "Kinematics",
  "level": "basics",
  "lesson": "Kinematics describes motion using position, velocity, and acceleration.",
  "available_levels": ["basics", "intermediate"]
}
```

### Error Responses
- `400` when required parameters are missing:
```json
{ "error": "discipline and topic are required" }
```
- `404` when topic/discipline combination is unknown:
```json
{ "error": "topic not found for discipline" }
```

## GET /api/diagram
Returns a PNG concept diagram for the provided discipline/topic.

### Query Parameters
- `discipline` (required)
- `topic` (required)

### Example
```bash
curl -s -o diagram.png "http://127.0.0.1:4000/api/diagram?discipline=Mechanics&topic=Kinematics"
file diagram.png
```

### Response
- `200` with `Content-Type: image/png`

### Error Responses
- `400` for missing query params
- `404` for unknown topic/discipline
- `500` for diagram rendering failures

## GET /api/formulas
Returns a formula aid list for the provided discipline/topic.

### Query Parameters
- `discipline` (required)
- `topic` (required)

### Example
```bash
curl -s "http://127.0.0.1:4000/api/formulas?discipline=Mechanics&topic=Kinematics"
```

### Response (200)
```json
{
  "discipline": "Mechanics",
  "topic": "Kinematics",
  "formulas": [
    {
      "name": "Constant Acceleration Position",
      "equation": "x = x0 + v0*t + 0.5*a*t^2",
      "variables": "x: position, x0: initial position, v0: initial velocity, a: acceleration, t: time",
      "units": "x (m), v0 (m/s), a (m/s^2), t (s)",
      "rearrangements": [
        "x - x0 = v0*t + 0.5*a*t^2",
        "a = 2*(x - x0 - v0*t)/t^2"
      ],
      "when_to_use": "Use for 1D motion problems with constant acceleration."
    }
  ]
}
```

### Error Responses
- `400` when required parameters are missing
- `404` when topic/discipline combination is unknown

## Notes
- API data is in-memory and resets when the server restarts.
- Parameter values are case-sensitive and should match available discipline/topic names from `/api/disciplines`.
