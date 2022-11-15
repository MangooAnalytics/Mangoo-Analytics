#!/bin/sh

docker build -t registry.digitalocean.com/getmangoo/analytics . &&
  docker push registry.digitalocean.com/getmangoo/analytics &&
  kubectl -n plausible rollout restart deployment plausible
