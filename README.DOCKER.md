# Docker usage

This repo contains two services with Dockerfiles:

- Backend: `Backend/Dockerfile` (runs Uvicorn on port 8000)
- Frontend: `Frontend/Dockerfile` (builds Next.js and runs on port 3000)

Use docker compose to build and run both:

```bash
docker compose build
docker compose up --build
```

To stop and remove containers:

```bash
docker compose down
```
