export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // No auth checks here - let the callback route handle all authentication routing
  // This prevents redirect loops during OAuth flow
  return <>{children}</>;
}
