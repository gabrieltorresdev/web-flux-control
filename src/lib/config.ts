export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://9ffa-2804-14d-5c30-6806-cff6-ea30-2f2e-1a31.ngrok-free.app',
  apiVersion: 'v1',
};

export const getApiUrl = (path: string) => {
  return `${config.backendUrl}/api/${config.apiVersion}/${path}`;
};