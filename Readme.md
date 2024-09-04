### Commands 
1. npm i 
2. docker-compose up --build -d 

### Check sentinel cluster setup

Sentinel itself is designed to run in a configuration where there are multiple Sentinel processes cooperating together. The advantage of having multiple Sentinel processes cooperating are the following:

Failure detection is performed when multiple Sentinels agree about the fact a given master is no longer available. This lowers the probability of false positives.

Generally speaking sentinel cluster should have access to our master-redis container and get is' data. Caution command should return right amount of slaves, other-sentinels, ip and port of redis-master container 

Run command: 
bash```
docker exec -it sentinel-1 redis-cli -p 26379 sentinel master mymaster
```

Result: 
```
1) "name"
 2) "mymaster"
 3) "ip"
 4) "172.21.0.3"
 5) "port"
 6) "6379"
 ...
 ...
 ...
 ...
31) "num-slaves"
32) "2"
33) "num-other-sentinels"
34) "2"
35) "quorum"
36) "2"
37) "failover-timeout"
38) "180000"
39) "parallel-syncs"
40) "1"
```

As we can see our sentinel cluster configured correctlly because we are getting right amount of slaves, sentinels, ip and port of current (default) redis-master container; 

To Check the failure detection and autopromote of new master, we can simply stop curent redis-master container and in result, after 5 secdons, we should see new ip adress, which means one of our replicas was promoted to master. 

1. ```docker-compose stop redis-master```
2. ```docker exec -it sentinel-1 redis-cli -p 26379 sentinel get-master-addr-by-name mymaster```
Result: 
```
    "172.21.0.5"
    "6379"
```
As we can see new Ip adress which stands for slave2 was promoted to be a master. 
And the additionally in logs of sentinel-1 container we are seeing 
```
+switch-master mymaster 172.21.0.3 6379 172.21.0.5 6379
``` 

### Testing preventing from cache stampeede 

To test preventing of cache stampeede we can easilly send a request from siege to our locally runned node.js application. 
```
siege -c100 -r1 -b 'http://0.0.0.0:8080/randomnewkey' 
```
As a result in console we will see that only the first request will handle the data retrieving while other request will be waiting for cache to be populated. Eventually cache will be populated and all waited request will resolve in response 200 with cached value