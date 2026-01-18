import React from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";

import "./index.css";
import App from "./App";
import { client } from "./apollo/client";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root container missing in index.html");
}

createRoot(rootElement).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
