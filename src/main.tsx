import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ArtistNotificationProvider } from '@/contexts/ArtistNotificationContext';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ArtistNotificationProvider>
        <App />
      </ArtistNotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);
