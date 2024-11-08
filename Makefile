run:
	- docker compose -f ./infra/docker-compose.yml up --build -d

bm-hey:
	- hey -n 20000 -c 500 "http://localhost:8002/events"

bm-vegeta:
	- (cd ./test/ && node ./generate-supplier-urls.js) && vegeta attack -targets=./test/supplier.urls -rate=10 -duration=10s | vegeta report > vegeta.output

