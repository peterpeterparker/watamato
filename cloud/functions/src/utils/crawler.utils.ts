export const PLZ = [
  8000,
  8001,
  8002,
  8003,
  8004,
  8005,
  8006,
  8008,
  8037,
  8032,
  8045,
  8047,
  8055
];

export function plzUrl() {
  return encodeURI(PLZ.join(","));
}
