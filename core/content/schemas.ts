/** Ajv set-up for the content schemas in /schema (JSON Schema 2020-12, ADR 0003). */
import { Ajv2020, type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import common from '../../schema/common.schema.json' with { type: 'json' };
import parameter from '../../schema/parameter.schema.json' with { type: 'json' };
import source from '../../schema/source.schema.json' with { type: 'json' };
import topic from '../../schema/topic.schema.json' with { type: 'json' };

/** Content kinds and their schema ids. */
export const SCHEMA_IDS = {
  topic: topic.$id,
  source: source.$id,
  parameter: parameter.$id,
} as const;

export type ContentKind = keyof typeof SCHEMA_IDS;

/** Shared definitions that can be validated on their own (tests, future CMS forms). */
export const DEFINITIONS = ['citation', 'populationQualifiers', 'value', 'block'] as const;
export type DefinitionName = (typeof DEFINITIONS)[number];

// ajv-formats ships CommonJS; normalise the default export across loaders.
const addFormats = ((addFormatsModule as unknown as { default?: typeof addFormatsModule }).default ??
  addFormatsModule) as unknown as (ajv: Ajv2020) => Ajv2020;

function createAjv(): Ajv2020 {
  const ajv = new Ajv2020({ allErrors: true, strict: true, verbose: true, discriminator: true });
  addFormats(ajv);
  // Human-readable name of a pattern, used in error messages ("must be lowercase kebab-case").
  ajv.addKeyword({ keyword: 'x-format-name', schemaType: 'string' });
  ajv.addSchema([common, topic, source, parameter]);
  return ajv;
}

let ajvInstance: Ajv2020 | undefined;

export function getValidator(kind: ContentKind): ValidateFunction {
  return schemaById(SCHEMA_IDS[kind]);
}

export function getDefinitionValidator(name: DefinitionName): ValidateFunction {
  return schemaById(`${common.$id}#/$defs/${name}`);
}

function schemaById(id: string): ValidateFunction {
  ajvInstance ??= createAjv();
  const validate = ajvInstance.getSchema(id);
  /* v8 ignore next */
  if (validate === undefined) throw new Error(`Schema not registered: ${id}`);
  return validate;
}

export type { ErrorObject };
