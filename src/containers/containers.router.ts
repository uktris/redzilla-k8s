/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as ContainerService from "./containers.service";
import { Container } from "./container.interface";
import { Containers } from "./containers.interface";

/**
 * Router Definition
 */

export const containersRouter = express.Router();

export const PREFIX: string = process.env.REDZILLA_NODEPREFIX || "";

/**
 * Controller Definitions
 */

// GET containers/

containersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const containers: Containers = await ContainerService.findAll();

    res.status(200).send(containers);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

// GET containers/:name
containersRouter.get("/:name", async (req: Request, res: Response) => {
  const name: string = PREFIX+req.params.name;
  try {
    const container: Container = await ContainerService.find(name);
    res.status(200).send(container);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

// POST containers/
containersRouter.post("/:name", async (req: Request, res: Response) => {
  const name: string = PREFIX+req.params.name;
  try {
    const container = await ContainerService.create(name);
    res.status(201).send(container);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

// PUT 

containersRouter.put("/:name", async (req: Request, res: Response) => {
  try {
    const name: string = PREFIX+req.params.name;
    await ContainerService.restart(name);

    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// DELETE

containersRouter.delete("/:name", async (req: Request, res: Response) => {
  try {
    const name: string = PREFIX+req.params.name;
    await ContainerService.remove(name);

    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});