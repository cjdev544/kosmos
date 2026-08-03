import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../features/auth/auth-context";
import { ThemeProvider } from "../features/theme/theme-context";
import { LoginPage } from "../features/auth/login-page";
import { RegisterPage } from "../features/auth/register-page";
import { SpacesPage } from "../features/spaces/spaces-page";
import { SpaceDetailPage } from "../features/spaces/space-detail-page";
import { AllTasksPage } from "../features/tasks/all-tasks-page";
import { AlmanaquePage } from "../features/tasks/almanaque-page";
import { TableroPage } from "../features/tasks/tablero-page";
import { AppLayout } from "./app-layout";
import { ProtectedRoute } from "./protected-route";

export function App(): JSX.Element {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<AlmanaquePage />} />
            <Route path="/tablero" element={<TableroPage />} />
            <Route path="/spaces" element={<SpacesPage />} />
            <Route path="/spaces/:spaceId" element={<SpaceDetailPage />} />
            <Route path="/tasks" element={<AllTasksPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  );
}
