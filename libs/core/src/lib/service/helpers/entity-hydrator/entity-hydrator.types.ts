import { MosaicEntity } from '../../../data';

// Based on https://stackoverflow.com/a/47058976/772859
export type Join<T extends Array<string | any>, D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

export type TripleDotPath = `${string}.${string}.${string}`;

export type EntityRelationKeys<T extends MosaicEntity> = {
  [K in Extract<keyof T, string>]: Required<T>[K] extends MosaicEntity | null
    ? K
    : Required<T>[K] extends MosaicEntity[]
    ? K
    : never;
}[Extract<keyof T, string>];

export type PathsToStringProps1<T extends MosaicEntity> = T extends string
  ? []
  : {
      [K in EntityRelationKeys<T>]: K;
    }[Extract<EntityRelationKeys<T>, string>];

export type PathsToStringProps2<T extends MosaicEntity> = T extends string
  ? never
  : {
      [K in EntityRelationKeys<T>]: T[K] extends MosaicEntity[]
        ? [K, PathsToStringProps1<T[K][number]>]
        : T[K] extends MosaicEntity | undefined
        ? [K, PathsToStringProps1<NonNullable<T[K]>>]
        : never;
    }[Extract<EntityRelationKeys<T>, string>];

export type EntityRelationPaths<T extends MosaicEntity> =
  | `customFields.${string}`
  | PathsToStringProps1<T>
  | Join<PathsToStringProps2<T>, '.'>
  | TripleDotPath;

/**
 * @description
 * Options used to control which relations of the entity get hydrated
 * when using the {@link EntityHydrator} helper.
 *
 */
export interface HydrateOptions<Entity extends MosaicEntity> {
  /**
   * @description
   * Defines the relations to hydrate, using strings with dot notation to indicate
   * nested joins. If the entity already has a particular relation available, that relation
   * will be skipped (no extra DB join will be added).
   */
  relations: EntityRelationPaths<Entity>[];
  /**
   * @description
   * If set to `true`, any ProductVariants will also have their `price` and `priceWithTax` fields
   * applied based on the current context. If prices are not required, this can be left `false` which
   * will be slightly more efficient.
   *
   * @default false
   */
  applyProductVariantPrices?: boolean;
}
