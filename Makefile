run:
	- docker compose -f ./infra/docker-compose.yml up --build -d

bm-hey:
	- hey -n 20000 -c 500 "http://localhost:8002/events"

bm-vegeta:
	- (cd ./test/ && node ./generate-supplier-urls.js) && vegeta attack -keepalive -targets=./test/supplier.urls -rate=2500 -duration=10s | vegeta report > vegeta.last && cat vegeta.last | grep -ai "Latencies\|Success" >> vegeta.output

bm-vegeta-plot:
	- (cd ./test/ && node ./generate-supplier-urls.js) && vegeta attack -keepalive -targets=./test/supplier.urls -rate=2500 -duration=10s | vegeta plot > vegeta-plot.html

bm-vegeta-plot-small:
	- (cd ./test/ && node ./generate-supplier-urls.js) && vegeta attack -targets=./test/supplier.urls -rate=100 -duration=5s | vegeta plot > vegeta-plot.html

