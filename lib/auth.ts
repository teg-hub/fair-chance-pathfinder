export type AppRole = 'platform_super_admin' | 'admin' | 'coordinator' | 'read_only';
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}
