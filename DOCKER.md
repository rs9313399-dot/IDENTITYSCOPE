# Docker

Run the app with Docker Compose:

```sh
docker compose up --build
```

Then open:

```txt
http://localhost:3000
```

The SQLite database is stored in the local `db` folder and mounted into the
container at `/app/db`, so scan history persists across container restarts.

To stop the app:

```sh
docker compose down
```
