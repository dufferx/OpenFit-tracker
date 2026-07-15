const OAUTH_DESTINATION_KEY = 'openfit.auth.destination'

export function safeAuthDestination(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export function rememberOAuthDestination(destination: string) {
  sessionStorage.setItem(OAUTH_DESTINATION_KEY, safeAuthDestination(destination))
}

export function consumeOAuthDestination() {
  const destination = safeAuthDestination(sessionStorage.getItem(OAUTH_DESTINATION_KEY))
  sessionStorage.removeItem(OAUTH_DESTINATION_KEY)
  return destination
}

export function clearOAuthDestination() {
  sessionStorage.removeItem(OAUTH_DESTINATION_KEY)
}
