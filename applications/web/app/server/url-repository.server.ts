import { createContext, type MiddlewareFunction } from "react-router";
import type { UrlRepository } from "@url-shortener/engine";
import { PrismaUrlRepository } from "@url-shortener/infrastructure";

export const urlRepositoryContext = createContext<UrlRepository>();

const urlRepository: UrlRepository = new PrismaUrlRepository();

export const urlRepositoryMiddleware: MiddlewareFunction = async ({ context }) => {
  context.set(urlRepositoryContext, urlRepository);
};
