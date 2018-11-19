import Maybe from './maybe';

const testObject = { sameRef: true };
const testArray = ['same-ref'];
const testFunction = () => {
  return;
};

describe('getRawValue', () => {
  test.each([
    [0, 0],
    [false, false],
    ['', ''],
    [testObject, testObject],
    [testArray, testArray],
    [testFunction, testFunction],
    [null, undefined],
    [undefined, undefined],
  ])('value: %p; expected: %p', (value, expectedValue) => {
    const result = Maybe(value).getRawValue();
    expect(result).toBe(expectedValue);
  });
});

describe('getValue', () => {
  test.each([
    [0, 1, 0],
    [false, 1, false],
    ['', 1, ''],
    [testObject, 1, testObject],
    [testArray, 1, testArray],
    [testFunction, 1, testFunction],
    [null, 1, 1],
    [undefined, 1, 1],
  ])(
    'value: %p; default: %p; expected: %p',
    (value, defaultValue, expectedValue) => {
      const result = Maybe(value).getValue(defaultValue);
      expect(result).toBe(expectedValue);
    }
  );
});

describe('do', () => {
  const testAction = jest.fn();

  beforeEach(() => {
    testAction.mockClear();
  });

  test.each([
    [0, 1],
    [false, 1],
    ['', 1],
    [{}, 1],
    [[], 1],
    [testFunction, 1],
    [null, 0],
    [undefined, 0],
  ])('value: %p; times called: %p', (value, expectedCalls: number) => {
    Maybe(value).do(testAction);
    expect(testAction).toHaveBeenCalledTimes(expectedCalls);
  });

  test.each([
    [0, 0],
    [false, false],
    ['', ''],
    [testObject, testObject],
    [testArray, testArray],
    [testFunction, testFunction],
  ])('value: %p; called with: %p', (value, expectedValue: number) => {
    Maybe(value).do(testAction);
    expect(testAction).toHaveBeenCalledWith(expectedValue);
  });
});

describe('map', () => {
  const testMapping = jest.fn();

  beforeEach(() => {
    testMapping.mockClear();
  });

  test.each([
    [0, 1],
    [false, 1],
    ['', 1],
    [{}, 1],
    [[], 1],
    [testFunction, 1],
    [null, 0],
    [undefined, 0],
  ])('value: %p; times called: %p', (value, expectedCalls: number) => {
    Maybe(value).map(testMapping);
    expect(testMapping).toHaveBeenCalledTimes(expectedCalls);
  });

  test.each([
    [1, 0, 0],
    [1, '', ''],
    [1, false, false],
    [1, null, undefined],
    [1, undefined, undefined],
    [null, 1, undefined],
    [undefined, 1, undefined],
  ])('value: %p; map to: %p; expected: %p', (value, mapTo, expectedValue) => {
    const result = Maybe(value)
      // tslint:disable-next-line no-unsafe-any
      .map(() => mapTo)
      .getRawValue();
    expect(result).toBe(expectedValue);
  });

  test.each([
    [0, 0],
    [false, false],
    ['', ''],
    [testObject, testObject],
    [testArray, testArray],
    [testFunction, testFunction],
  ])('value: %p; called with: %p', (value, expectedValue: number) => {
    Maybe(value).map(testMapping);
    expect(testMapping).toHaveBeenCalledWith(expectedValue);
  });
});

describe('flatMap', () => {
  const testMapping = jest.fn();

  beforeEach(() => {
    testMapping.mockClear();
  });

  test.each([
    [0, 1],
    [false, 1],
    ['', 1],
    [{}, 1],
    [[], 1],
    [testFunction, 1],
    [null, 0],
    [undefined, 0],
  ])('value: %p; times called: %p', (value, expectedCalls: number) => {
    Maybe(value).flatMap(testMapping);
    expect(testMapping).toHaveBeenCalledTimes(expectedCalls);
  });

  test.each([
    [1, 0, 0],
    [1, '', ''],
    [1, false, false],
    [1, null, undefined],
    [1, undefined, undefined],
    [null, 1, undefined],
    [undefined, 1, undefined],
  ])(
    'value: %p; map to: Maybe(%p); expected: %p',
    (value, mapTo, expectedValue) => {
      const result = Maybe(value)
        .flatMap(() => Maybe(mapTo))
        .getRawValue();
      expect(result).toBe(expectedValue);
    }
  );

  test.each([
    [0, 0],
    [false, false],
    ['', ''],
    [testObject, testObject],
    [testArray, testArray],
    [testFunction, testFunction],
  ])('value: %p; called with: %p', (value, expectedValue: number) => {
    Maybe(value).flatMap(testMapping);
    expect(testMapping).toHaveBeenCalledWith(expectedValue);
  });
});

describe('filter', () => {
  const testPredicate = jest.fn((x) => true);

  beforeEach(() => {
    testPredicate.mockClear();
  });

  test.each([
    [0, 1],
    [false, 1],
    ['', 1],
    [{}, 1],
    [[], 1],
    [testFunction, 1],
    [null, 0],
    [undefined, 0],
  ])('value: %p; times called: %p', (value, expectedCalls: number) => {
    Maybe(value).filter(testPredicate);
    expect(testPredicate).toHaveBeenCalledTimes(expectedCalls);
  });

  test.each([
    [0, 0],
    [false, false],
    ['', ''],
    [testObject, testObject],
    [testArray, testArray],
    [testFunction, testFunction],
  ])('value: %p; called with: %p', (value, expectedValue: number) => {
    Maybe(value).filter(testPredicate);
    expect(testPredicate).toHaveBeenCalledWith(expectedValue);
  });

  test('type guarding', () => {
    interface X1 {
      type: '1';
      x1: string;
    }
    interface X2 {
      type: '2';
      x2: string;
    }
    type X = X1 | X2;
    const x: X = getX('1');

    const result = Maybe(x)
      .filter((v): v is X1 => v.type === '1')
      .map((v) => v.x1)
      .getRawValue();

    expect(result).toBe('foo');

    function getX(type: '1' | '2'): X {
      return type === '1' ? { type: '1', x1: 'foo' } : { type: '2', x2: 'foo' };
    }
  });
});

describe('defaultAction', () => {
  const testAction = jest.fn();

  beforeEach(() => {
    testAction.mockClear();
  });

  test.each([
    [0, 0],
    [false, 0],
    ['', 0],
    [{}, 0],
    [[], 0],
    [testFunction, 0],
    [null, 1],
    [undefined, 1],
  ])('value: %p; times called: %p', (value, expectedCalls: number) => {
    Maybe(value).defaultAction(testAction);
    expect(testAction).toHaveBeenCalledTimes(expectedCalls);
  });
});

describe('defaultValue', () => {
  test.each([
    [0, 1, 0],
    [false, 1, false],
    ['', 1, ''],
    [testObject, 1, testObject],
    [testArray, 1, testArray],
    [testFunction, 1, testFunction],
    [null, 0, 0],
    [null, '', ''],
    [null, false, false],
    [null, null, undefined],
    [null, undefined, undefined],
    [undefined, 0, 0],
    [undefined, '', ''],
    [undefined, false, false],
    [undefined, null, undefined],
    [undefined, undefined, undefined],
  ])(
    'value: %p; default: %p; expected: %p',
    (value, defaultValue, expectedValue) => {
      const result = Maybe(value)
        .defaultValue(defaultValue)
        .getRawValue();
      expect(result).toBe(expectedValue);
    }
  );
});
