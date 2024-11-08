run:
	- docker compose -f ./infra/docker-compose.yml up --build -d

load-testing:
	- hey -n 20000 -c 100 "http://localhost:8002/events"