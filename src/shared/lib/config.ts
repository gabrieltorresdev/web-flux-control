const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  apiVersion: "v1",
};

export const getBackendApiUrl = (path: string) => {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${config.backendUrl}/api/${config.apiVersion}/${cleanPath}`;
};
