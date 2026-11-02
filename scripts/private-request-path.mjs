// Apply the same decoding before access checks and filesystem resolution.
export function publicRequestPath(value) {
  try {
    const pathname=decodeURIComponent(new URL(value,'http://127.0.0.1').pathname).replaceAll('\\','/');
    return pathname.includes('\0')?null:pathname;
  }catch{return null;}
}

export function isPrivateRequestPath(pathname) {
  return pathname.split('/').some(segment=>segment.startsWith('.')&&segment!=='.well-known') || /\.(?:php|ini)$/i.test(pathname);
}
