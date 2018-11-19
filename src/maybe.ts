type Unset = void | null | undefined;

type Mapping<T, R> = (v: T) => R;

type TypeGuard<T, R extends T> = ((v: T) => v is R) | ((v: T) => boolean);

interface Maybe<T> {
  defaultAction(action: () => void): Maybe<T>;
  defaultValue(value: T): Something<T>;
  do(action: (v: T) => void): Maybe<T>;
  filter<R extends T>(predicate: TypeGuard<T, R>): Maybe<R>;
  flatMap<R>(mapping: Mapping<T, Maybe<R>>): Maybe<R>;
  getRawValue(): T | undefined;
  getValue(defaultValue: T): T;
  map<R>(mapping: Mapping<T, R | Unset>): Maybe<R>;
}

interface Something<T> extends Maybe<T> {
  do(action: (v: T) => void): Something<T>;
}

interface Nothing extends Maybe<any> {
  do(): Nothing;
  flatMap(): Nothing;
  getRawValue(): undefined;
  getValue<T>(defaultValue: T): T;
  map(): Nothing;
}

function Maybe<T>(value: T | Unset): Maybe<T> {
  return isUnset(value) ? Nothing() : Something(value);
}

function isUnset(value: any): value is Unset {
  return value === undefined || value === null;
}

function Something<T>(value: T): Something<T> {
  return {
    getValue() {
      return value;
    },
    getRawValue() {
      return value;
    },
    map(mapping) {
      const mappedValue = mapping(value);
      return Maybe(mappedValue);
    },
    flatMap(mapping) {
      const mappedValue = mapping(value);
      return mappedValue;
    },
    filter<R extends T>(predicate: TypeGuard<T, R>) {
      const isMatch = predicate(value);
      return isMatch ? (this as Maybe<R>) : Nothing();
    },
    do(action) {
      action(value);
      return this;
    },
    defaultAction() {
      return this;
    },
    defaultValue() {
      return this;
    },
  };
}

const nothing: Nothing = {
  getValue(defaultValue) {
    return defaultValue;
  },
  getRawValue() {
    return undefined;
  },
  map() {
    return Nothing();
  },
  flatMap() {
    return Nothing();
  },
  filter() {
    return Nothing();
  },
  do() {
    return Nothing();
  },
  defaultAction(action) {
    action();
    return this;
  },
  defaultValue<T>(value: T) {
    return Maybe(value);
  },
};

function Nothing() {
  return nothing;
}

export default Maybe;
