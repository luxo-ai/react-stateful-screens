export type KeyLike = string | number | symbol;
export type NonEmptyArray<T> = [T, ...T[]];
export type NonEmpty<Arr> = Arr extends (infer T)[] ? NonEmptyArray<T> : never;
export type SafeIntersection<A, B = undefined> = B extends undefined ? A : A & B;
