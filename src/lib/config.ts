export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  apiVersion: "v1",
};

export const getBackendApiUrl = (path: string) => {
  return `${config.backendUrl}/api/${config.apiVersion}/${path}`;
};
