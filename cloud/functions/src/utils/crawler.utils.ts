export const PLZ = [8004, 8005, 8006, 8037];

export function plzUrl() {
  return encodeURI(PLZ.join(","));
}
