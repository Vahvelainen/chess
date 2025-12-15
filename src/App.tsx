import React from "react";
import { ChessBoardView } from "./views/ChessBoardView";
import { Footer } from "./views/Footer";

export function App(): React.JSX.Element {
  return (
    <>
      <ChessBoardView />
      <Footer />
    </>
  );
}
