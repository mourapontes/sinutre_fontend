// Cliente HTTP mínimo do front para o sinutre-back.
// A base do servidor vem de VITE_API_URL (embutida no bundle durante o build).
import axios from 'axios';

// Backend publicado no Railway — usado quando VITE_API_URL não foi definida no
// ambiente de build (ex.: deploy na Vercel sem a variável configurada).
const PRODUCTION_API_URL = 'https://sinutrebackend-production.up.railway.app';
const DEVELOPMENT_API_URL = 'http://localhost:3333';

function resolveApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (configured) {
    // Barra no final geraria "//" nos paths (".../meals").
    return configured.replace(/\/+$/, '');
  }

  // Sem fallback o app faria requisições para "undefined/..." silenciosamente.
  console.warn(
    '[SiNutre] VITE_API_URL não está definida; usando ' +
      `${import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL}.`,
  );

  return import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;
}

export const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
});

const TOKEN_KEY = 'sinutre.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Lê ?token=... do callback do backend (rota /auth/github/callback),
// salva no localStorage e limpa a query string da URL.
export function consumeTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    return null;
  }

  setToken(token);
  window.history.replaceState({}, '', window.location.pathname);

  return token;
}

export type ApiFieldErrors = Record<string, string>;

interface ApiErrorBody {
  error?: string;
  fields?: ApiFieldErrors;
}

function readErrorBody(data: unknown): ApiErrorBody | null {
  if (data && typeof data === 'object') {
    const body = data as ApiErrorBody;

    if (typeof body.error === 'string' || body.fields) {
      return body;
    }
  }

  return null;
}

/** Mensagem amigável para qualquer falha de API. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação.',
): string {
  if (axios.isAxiosError(error)) {
    const body = readErrorBody(error.response?.data);

    if (body?.error) {
      return body.error;
    }

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }

    return error.response.statusText || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/** Erros de validação por campo devolvidos pelo backend. */
export function getApiFieldErrors(error: unknown): ApiFieldErrors {
  if (axios.isAxiosError(error)) {
    const body = readErrorBody(error.response?.data);

    if (body?.fields) {
      return body.fields;
    }
  }

  return {};
}

// Envia uma requisição JSON ao backend já com Bearer token (se houver).
// Joga em caso de status != 2xx.
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

let redirectingToLogin = false;

// Token expirado/inválido: limpa a sessão e volta para o login.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    const hasUrlToken = new URLSearchParams(window.location.search).has('token');

    if (status === 401 && !redirectingToLogin && !hasUrlToken) {
      clearToken();

      if (window.location.pathname !== '/login') {
        redirectingToLogin = true;
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);
