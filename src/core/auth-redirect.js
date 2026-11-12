const DEFAULT_AUTH_REDIRECT_URL = "https://jakelethard-star.github.io/KairoSphere122-0605e52e/";

export function resolveAuthRedirectUrl(configuredUrl) {
  const destination = configuredUrl?.trim() || DEFAULT_AUTH_REDIRECT_URL;
  return new URL(destination).href;
}
