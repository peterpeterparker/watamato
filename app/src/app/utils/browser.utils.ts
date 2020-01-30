export function isWindows(): boolean {
  if (!window || !navigator) {
    return false;
  }

  const a: string = navigator.userAgent || navigator.vendor || (window as any).opera;

  return /windows/i.test(a);
}
