import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../../docs/openapi.json', import.meta.url));
const target = fileURLToPath(new URL('../src/shared/api/schema.ts', import.meta.url));

const spec = JSON.parse(readFileSync(source, 'utf8'));
const schemas = spec.components?.schemas ?? {};

function type(schema) {
  if (!schema || schema === true) return 'unknown';
  if (schema.$ref) return schema.$ref.split('/').pop();
  if (schema.anyOf) return [...new Set(schema.anyOf.map(type))].join(' | ');
  if (schema.enum) return schema.enum.map((v) => JSON.stringify(v)).join(' | ');
  if ('const' in schema) return JSON.stringify(schema.const);
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    case 'array':
      return `Array<${type(schema.items)}>`;
    case 'object':
      return schema.properties
        ? objectType(schema)
        : `Record<string, ${schema.additionalProperties ? type(schema.additionalProperties) : 'unknown'}>`;
    default:
      return 'unknown';
  }
}

function objectType(schema, indent = '') {
  const required = new Set(schema.required ?? []);
  const lines = Object.entries(schema.properties ?? {}).map(
    ([key, value]) => `${indent}  ${key}${required.has(key) ? '' : '?'}: ${type(value)};`,
  );
  return `{\n${lines.join('\n')}\n${indent}}`;
}

const out = [];
for (const [name, schema] of Object.entries(schemas)) {
  if (schema.enum) out.push(`export type ${name} = ${type(schema)};`, '');
  else if (schema.type === 'object' || schema.properties)
    out.push(`export interface ${name} ${objectType(schema)}`, '');
  else out.push(`export type ${name} = ${type(schema)};`, '');
}

writeFileSync(target, out.join('\n'));
console.log(`schema.ts: ${Object.keys(schemas).length} типов`);
