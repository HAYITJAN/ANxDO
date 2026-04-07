import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { getToken } from "./lib/api";
import Ads from "./pages/Ads";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Genres from "./pages/Genres";
import Login from "./pages/Login";
import MovieNew from "./pages/MovieNew";
import Movies from "./pages/Movies";
import SeriesEpisodes from "./pages/SeriesEpisodes";
import Users from "./pages/Users";

function ProtectedRoute() {
  const loc = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/new" element={<MovieNew />} />
          <Route path="/movies/:movieId/edit" element={<MovieNew />} />
          <Route path="/movies/:movieId/episodes" element={<SeriesEpisodes />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ads" element={<Ads />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
