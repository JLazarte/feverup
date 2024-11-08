# Fever code challenge

Hello!


# Load testing

## Version 1: 100 concurrent request

It will create a new connection to the database for each request

` 99% percentile in 5.3764 secs `


```
hey -n 20000 -c 100 "http://localhost:8002/events"

Summary:
  Total:        167.5426 secs
  Slowest:      10.8605 secs
  Fastest:      0.0169 secs
  Average:      0.8313 secs
  Requests/sec: 119.3726
  
  Total data:   8380000 bytes
  Size/request: 419 bytes

Response time histogram:
  0.017 [1]     |
  1.101 [17394] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  2.186 [1844]  |■■■■
  3.270 [396]   |■
  4.354 [64]    |
  5.439 [117]   |
  6.523 [51]    |
  7.607 [42]    |
  8.692 [33]    |
  9.776 [43]    |
  10.861 [15]   |


Latency distribution:
  10% in 0.4009 secs
  25% in 0.4731 secs
  50% in 0.6002 secs
  75% in 0.8555 secs
  90% in 1.3191 secs
  95% in 1.8723 secs
  99% in 5.3764 secs

Details (average, fastest, slowest):
  DNS+dialup:   0.0001 secs, 0.0169 secs, 10.8605 secs
  DNS-lookup:   0.0001 secs, 0.0000 secs, 0.0196 secs
  req write:    0.0000 secs, 0.0000 secs, 0.0077 secs
  resp wait:    0.8310 secs, 0.0168 secs, 10.8402 secs
  resp read:    0.0001 secs, 0.0000 secs, 0.0267 secs

Status code distribution:
  [200] 20000 responses
```

---

## Version 2: 100 concurrent request

Reusing the same database connection until none operation requires it

` 99% percentile in 0.3634 secs `

```
make load-testing
hey -n 20000 -c 100 "http://localhost:8002/events"

Summary:
  Total:        19.3918 secs
  Slowest:      2.1326 secs
  Fastest:      0.0054 secs
  Average:      0.0937 secs
  Requests/sec: 1031.3636
  
  Total data:   8380000 bytes
  Size/request: 419 bytes

Response time histogram:
  0.005 [1]     |
  0.218 [19381] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.431 [506]   |■
  0.644 [41]    |
  0.856 [14]    |
  1.069 [13]    |
  1.282 [6]     |
  1.494 [9]     |
  1.707 [10]    |
  1.920 [8]     |
  2.133 [11]    |


Latency distribution:
  10% in 0.0493 secs
  25% in 0.0604 secs
  50% in 0.0768 secs
  75% in 0.1034 secs
  90% in 0.1310 secs
  95% in 0.1660 secs
  99% in 0.3634 secs

Details (average, fastest, slowest):
  DNS+dialup:   0.0001 secs, 0.0054 secs, 2.1326 secs
  DNS-lookup:   0.0001 secs, 0.0000 secs, 0.0147 secs
  req write:    0.0000 secs, 0.0000 secs, 0.0061 secs
  resp wait:    0.0935 secs, 0.0053 secs, 2.1174 secs
  resp read:    0.0000 secs, 0.0000 secs, 0.0082 secs

Status code distribution:
  [200] 20000 responses
```

## Version 2: 500 concurrent request

Increase concurrets request

` 99% percentile in 6.9128 secs`

` 19672 of 20000 requests succeeded `

```
 hey -n 20000 -c 500 "http://localhost:8002/events"

Summary:
  Total:        14.1075 secs
  Slowest:      10.2925 secs
  Fastest:      0.0102 secs
  Average:      0.2471 secs
  Requests/sec: 1417.6829
  
  Total data:   8242568 bytes
  Size/request: 419 bytes

Response time histogram:
  0.010 [1]     |
  1.038 [19275] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  2.067 [47]    |
  3.095 [38]    |
  4.123 [28]    |
  5.151 [28]    |
  6.180 [24]    |
  7.208 [107]   |
  8.236 [62]    |
  9.264 [34]    |
  10.293 [28]   |


Latency distribution:
  10% in 0.0825 secs
  25% in 0.1048 secs
  50% in 0.1287 secs
  75% in 0.1566 secs
  90% in 0.1940 secs
  95% in 0.2184 secs
  99% in 6.9128 secs

Details (average, fastest, slowest):
  DNS+dialup:   0.0008 secs, 0.0102 secs, 10.2925 secs
  DNS-lookup:   0.0005 secs, 0.0000 secs, 0.0402 secs
  req write:    0.0000 secs, 0.0000 secs, 0.0246 secs
  resp wait:    0.2462 secs, 0.0101 secs, 10.2133 secs
  resp read:    0.0001 secs, 0.0000 secs, 0.0188 secs

Status code distribution:
  [200] 19672 responses
```