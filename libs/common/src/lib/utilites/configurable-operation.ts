export function getConfigArgValue(value: string) {
  try {
    const result = value != null ? JSON.parse(value) : undefined;

    if (result && typeof result === 'object' && !Array.isArray(result)) {
      // There is an edge-case where the value is a valid JSON-encoded string and
      // will get parsed as an object, but we actually want it to be a string.
      return JSON.stringify(result);
    } else {
      return result;
    }
  } catch (e) {
    return value;
  }
}

export function encodeConfigArgValue(value: unknown): string {
  return Array.isArray(value)
    ? JSON.stringify(value)
    : (value ?? '').toString();
}
