export const PLZ = [8049, 8037, 8064, 8005, 8006, 8044, 8032, 8008, 8004, 8003, 8001, 8002];

export function plzUrl() {
  return encodeURI(PLZ.join(","));
}

export const priceMin: number = 1300;
export const priceMax: number = 2000;
