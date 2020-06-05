# redzilla-k8s

`redzilla-k8s` manage multiple instances of [node-red](http://nodered.org/) within Kubernetes

Inspired by the work of Luca Capra https://github.com/muka/redzilla I have created an equivalent solution for Kubernetes which is API compatible with redzilla for Docker. The intent is that if using redzilla locally for development testing then porting to Kubernetes the behaviour and output should be as close as possible.

This package makes use of the Javascript client library for Kubernetes here: https://github.com/kubernetes-client/javascript

This is currently very beta and has some rough edges to refine but works for the application required.

## Building

Build the service with `docker build -t redzilla-k8s .`

The image is also available as `inspirex/redzilla-k8s`

## API

List instances

  `curl -X GET http://redzilla.localhost:3000/v2/instances`

Create an instance

  `curl -X POST http://redzilla.localhost:3000/v2/instances/instance-name`

Restart an instance

  `curl -X PUT http://redzilla.localhost:3000/v2/instances/instance-name`

Remove an instance

  `curl -X DELETE http://redzilla.localhost:3000/v2/instances/instance-name`

## Prerequisites

To run `redzilla-k8s` you need a suitable kubernetes cluster and RBAC permissions to create/list/delete nodes (documentation and examples to come).

## License

The MIT license. See `LICENSE` file for details
