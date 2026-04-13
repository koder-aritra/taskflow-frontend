import axios, { type InternalAxiosRequestConfig } from "axios";
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
  Project,
  ProjectDetail,
  Task,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  ListTasksParams,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

const STORAGE_KEY = "taskflow_auth_token";

export function getStoredTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("taskflow_user");
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("taskflow_user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function storeUser(user: User) {
  localStorage.setItem("taskflow_user", JSON.stringify(user));
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getStoredTokens();
  if (tokens?.token && config.headers) {
    config.headers.Authorization = `Bearer ${tokens.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    if (status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) {
      clearTokens();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
};

export const projectsApi = {
  list: () => api.get<{ projects: Project[] }>("/projects").then((r) => r.data),

  get: (id: string) =>
    api.get<ProjectDetail>(`/projects/${id}`).then((r) => r.data),

  create: (data: CreateProjectRequest) =>
    api.post<Project>("/projects", data).then((r) => r.data),

  update: (id: string, data: UpdateProjectRequest) =>
    api.patch<Project>(`/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const tasksApi = {
  list: (projectId: string, params?: ListTasksParams) =>
    api
      .get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`, { params })
      .then((r) => r.data),

  create: (projectId: string, data: CreateTaskRequest) =>
    api
      .post<Task>(`/projects/${projectId}/tasks`, data)
      .then((r) => r.data),

  update: (taskId: string, data: UpdateTaskRequest) =>
    api.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data),

  delete: (taskId: string) => api.delete(`/tasks/${taskId}`),
};

export default api;
