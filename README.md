# Fever code challenge

Hello!


## Load testing

Version 1:

```
mypc | 17:04 | ~/DEV/CHALLENGES/feverup/JoseLazarte: hey -n 20000 -c 100 "http://localhost:8002/events"

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