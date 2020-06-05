/**
 * Data Model Interfaces
 */

import k8s = require('@kubernetes/client-node');
import { Container } from "./container.interface";
import { Containers } from "./containers.interface";
import { V1ContainerPort, V1LabelSelector, Watch } from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromCluster();
// kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sApiCore = kc.makeApiClient(k8s.CoreV1Api);

const namespace = process.env.NAMESPACE || "default";
const debugLevel = process.env.DEBUG_LEVEL || "info";

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 
/**
 * Service Methods
 */

export const findAll = async (): Promise<Containers> => {
  if (debugLevel == "debug") { console.log("Called: findAll")};
  const containers: Containers = {};
  try {
    const deployments = await k8sApi.listNamespacedDeployment(namespace, undefined, undefined, undefined, undefined, "app=redzilla");
    for (let item of deployments.body.items) {
      if (item && item.metadata && item.metadata.name) {
        const name = item.metadata.name || ""
        if (name !== "" && containers !== undefined) {
          let newContainer: Container = { Name: item.metadata.name}; 
          containers[item.metadata.name] = {
            ...newContainer
          };
        };
      }  
    }
  } catch (e) {
    throw new Error("Error getting deployments: " + e);
  }
return containers;
};

export const find = async (name: string): Promise<Container> => {
  if (debugLevel == "debug") { console.log("Called: find: "+name)}
  try {
      const pod = await k8sApiCore.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, "id="+name);
      if (debugLevel == "debug") { console.log(pod); }
      if(pod.body && pod.body.items.length > 0) {
        let container: Container = { Name: name, ID: "", Created: pod.body.items[0].status?.startTime, Status: (pod.body.items[0].status?.phase == "Running")?20:10, IP: pod.body.items[0].status?.podIP, Port: 1880 }
        return container;
      }  else {
        throw new Error("Deployment not found");
      }
    }catch (e) {
      if (debugLevel == "debug") { console.error(e); console.error(e.stack); }
      throw new Error("Deployment not found: " + e);
    }
};

export const create = async (name: string): Promise<Container> => {
  if (debugLevel == "debug") { console.log("Called: create: "+name)};
  const deploymentSpec = {
    kind: "Deployment",
    metadata: {
      name: name,
      labels: { 
        "app": "redzilla",
        "id": name, 
      },
      namespace: namespace
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {"app": "redzilla",},
      },
      template: {
        metadata: {
          labels: { 
            "app": "redzilla",
            "id": name,
          },
        },
        spec: {
          containers: [{
            name: name,
            image: process.env.REDZILLA_IMAGENAME || 'docker.io/nodered/node-red-docker:latest',
            ports: [ { containerPort: 1880 }]
          }]
        }
      }
    }
  }
  try {
    const deployment = await k8sApi.createNamespacedDeployment(namespace, deploymentSpec);
  } catch (e) {
    if (debugLevel == "debug") { console.error(e.stack); }
    throw new Error("Unable to create deployment: "+e);
  }
  try {
    let deploymentTest = await k8sApi.listNamespacedDeployment(namespace,undefined,undefined,undefined,undefined,"id="+name);
    console.error(deploymentTest.body.items[0]);
    const timeout = 10000;
    const startTime = Date.now();
    while ((deploymentTest.body.items[0].status?.availableReplicas == undefined  || deploymentTest.body.items[0].status?.availableReplicas < 1) && ((Date.now() - startTime) < timeout)) {
      if (debugLevel == "debug") { console.log(deploymentTest.body.items[0].status); }
      await sleep(1000);
      deploymentTest = await k8sApi.listNamespacedDeployment(namespace,undefined,undefined,undefined,undefined,"id="+name);
    }
    let pod = await k8sApiCore.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, "id="+name,undefined,undefined,undefined,false);
    let container: Container = { Name: name, ID: "", Created: pod.body.items[0].status?.startTime, Status: (pod.body.items[0].status?.phase === "Running")?20:10, IP: pod.body.items[0].status?.podIP, Port: 1880 }
    return container
  } catch (e) {
    if (debugLevel == "debug") { console.error(e.stack); }
    throw new Error("Unable to find new deployment: "+e);
  }
};

export const restart = async (name: string): Promise<void> => {
  if (debugLevel == "debug") { console.log("Called: restart: "+name)};
  try {
    await find(name);
  } catch (e) {
    if (debugLevel == "debug") { console.error(e.stack); }
    throw new Error("No container found to restart: "+e);
  }
  try {
    await remove(name);
    await create(name);
  } catch (e) {
    if (debugLevel == "debug") { console.error(e.stack); }
    throw new Error("Error restarting container: "+e);
  }
  return;
};

export const remove = async (name: string): Promise<void> => {
  if (debugLevel == "debug") { console.log("Called: remove: "+name)};
  try {
    await find(name);
    await k8sApi.deleteNamespacedDeployment(name, namespace);
  } catch (e) {
    if (debugLevel == "debug") { console.error(e.stack); }
    throw new Error("No container found to remove");
  }
  return;
};
