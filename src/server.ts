import express, { Application, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./resolvers/products.resolver";
import { validateApiKeyFromHeader } from "./middlewares/api-key.middleware";
import cookieParser from "cookie-parser";
import { ApiKeyService } from "./services/api-key.service";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

dotenv.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  const app: Application = express();
  app.use(cors());
  app.use(cookieParser());
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  // PUBLIC: get API key by client id
  app.get("/api/key/:clientId", express.json(), async (req, res) => {
    const clientId = req.params.clientId;
    if (!clientId) return res.status(400).json({ message: "Missing clientId" });
    const apiKey = await ApiKeyService.findByClientId(clientId);
    if (!apiKey) return res.status(404).json({ message: "API key not found" });
    return res.json({ key: apiKey.key, expiration: apiKey.expiration });
  });

  // GraphQL server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: { req: Request }) => {
      // Validate api key from headers
      const apiKey = await validateApiKeyFromHeader(req);
      return { apiKey };
    },
  });

  await server.start();
  server.applyMiddleware({ app: app as any, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(
      `GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`,
    );
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
