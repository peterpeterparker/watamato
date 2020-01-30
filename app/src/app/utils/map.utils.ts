export function openMap(query: string) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURI(query)}`, '_blank');
}
