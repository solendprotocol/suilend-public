export const toHexString = (bytes: number[]) =>
  Array.from(bytes, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
