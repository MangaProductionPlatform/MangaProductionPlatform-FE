import { AppProviders } from "./app/providers";
import { AppRouter } from "./app/router";
import "./shared/styles/workflowEffects.css";


export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
