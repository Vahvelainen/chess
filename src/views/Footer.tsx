import React from "react";

export function Footer(): React.JSX.Element {
  return (
    <footer className="site-footer">
      <a
        href="https://github.com/Vahvelainen/chess"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>{" | "}
      Chess piece icons by{" "}
      <a href="https://fontawesome.com" target="_blank" rel="noopener noreferrer">
        Font Awesome
      </a>{" "}
      (CC BY 4.0)
    </footer>
  );
}
