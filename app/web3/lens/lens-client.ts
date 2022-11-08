import { GraphQLClient } from "graphql-request";

const lensClient = new GraphQLClient("https://api.lens.dev/playground");

const changeHeaders = (token: string) => {
  lensClient.setHeaders({
    "x-access-token": token ? `Bearer ${token}` : "",
  });
};

export { lensClient, changeHeaders };
