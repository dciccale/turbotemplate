import {
  type MessageFormatElement,
  parse,
  TYPE,
} from "@formatjs/icu-messageformat-parser";
export function flattenMessages(
  value: unknown,
  prefix = "",
): Map<string, string> {
  const result = new Map<string, string>();
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`Invalid catalog: ${prefix}`);
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof entry === "string") {
      if (!entry.trim()) throw new Error(`Empty translation: ${path}`);
      result.set(path, entry);
    } else
      for (const [child, text] of flattenMessages(entry, path))
        result.set(child, text);
  }
  return result;
}
function contract(elements: MessageFormatElement[]): string[] {
  const result = new Set<string>();
  function visit(nodes: MessageFormatElement[]) {
    for (const node of nodes) {
      if (
        node.type === TYPE.argument ||
        node.type === TYPE.number ||
        node.type === TYPE.date ||
        node.type === TYPE.time
      )
        result.add(`${node.type}:${node.value}`);
      else if (node.type === TYPE.tag) {
        result.add(`tag:${node.value}`);
        visit(node.children);
      } else if (node.type === TYPE.plural || node.type === TYPE.select) {
        result.add(`${node.type}:${node.value}`);
        if (node.type === TYPE.select)
          result.add(
            `select:${node.value}:${Object.keys(node.options).sort().join(",")}`,
          );
        for (const option of Object.values(node.options)) visit(option.value);
      }
    }
  }
  visit(elements);
  return [...result].sort();
}
export function checkCatalog(source: unknown, translation: unknown): void {
  const expected = flattenMessages(source),
    actual = flattenMessages(translation);
  for (const [key, message] of expected) {
    const target = actual.get(key);
    if (target === undefined) throw new Error(`Missing translation: ${key}`);
    if (
      JSON.stringify(contract(parse(message))) !==
      JSON.stringify(contract(parse(target)))
    )
      throw new Error(`Message contract differs: ${key}`);
  }
  for (const key of actual.keys())
    if (!expected.has(key)) throw new Error(`Extra translation: ${key}`);
}
