# Fever Code Challenge

The project is composed of two applications:

* **events-gathering**: Responsible for finding and saving all new events from external sources.

* **events-supplier**: Responsible for finding any previously known events and filtering them by time.

Additionally, there is an **events-core** library that handles shared behavior.

## Running Requirements - Important!
### The Docker engine must be running! (it uses docker compose)

### Run

```
$: make run
```
This command will handle everything, including starting the database, setting up the index, and declaring user access.

# Benchmark

See `/docs/BENCHMARK.md` 

`make bm-vegeta`: will run a test using the same url

`make bm-vegeta`: will run a test with generated urls

`make bm-vegeta-plot`: same as before but it will create a graph with the results

`make bm-vegeta-plot-small`: same as before but will use a small sample of request


## Documentation

More information about the behavior of the app can be found in the `/docs/` folder.


# Next Steps

* Add unit tests
* Generate more fake events to populate the database
* Add high-throughput logging libraries
* Enable Redis cache recreation by streaming MongoDB events
* Add Kubernetes configuration to start multiple instances of events-supplier, see:
  * Commented code in `/infra/docker-compose.yml`
  * Nginx configuration in `/infra/supplier-service-load-balancer.conf`








