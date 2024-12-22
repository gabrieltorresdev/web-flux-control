export const config = {
  backendUrl: "http://localhost:8000" || "http://localhost:8000",
  apiVersion: "v1",
};

export const getBackendApiUrl = (path: string) => {
  return `${config.backendUrl}/api/${config.apiVersion}/${path}`;
};
