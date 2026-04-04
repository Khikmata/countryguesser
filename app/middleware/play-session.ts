export default defineNuxtRouteMiddleware(() => {
  const active = useState<boolean>('gf-play-session-active', () => false)
  if (!active.value) return navigateTo('/')
})
