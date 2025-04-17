import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/jost";
import "@fontsource/jost/700.css";
import "@fontsource/jost/800.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
