import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme before render to prevent flash
const savedTheme = localStorage.getItem('color-theme') || 'gold';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById("root")!).render(<App />);
