# mempool.js

## JavaScript true memory pooling solution.

mempool.js is powerful solution to reusable memory managment in your JavaScript application.

[![NPM](https://nodei.co/npm/mempool.js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/mempool.js/)

## Installation

```bash
$ npm install mempool.js
```

## Build and Test Scripts

```bash
$ cd build
$ node build.js all
$ cd ../test
$ node test.js
```

## API Usage Examples

Load module:
```javascript
var mempool = require('mempool.js'),
	MemoryPool = mempool.MemoryPool,
	TypedMemoryPool = mempool.TypedMemoryPool;
```

MemoryPool:
```javascript
// custom class.
function PooledObject(value){
	this.value = value;
}

PooledObject.prototype.value = null;

// create memory pool.
PooledObject.pool = new MemoryPool(
	PooledObject.prototype, // memory pool wil store custom class objects.
	1 // pool capacity.
);

// create instance from pool.
var instance = PooledObject.pool.factory(1); // MemoryPool::factory() gets instance from pool and calls it's constructor.
PooledObject.pool.acquire(); // this will print error because you are trying to get instance from empty pool.

// release instance to pool.
PooledObject.pool.release(instance);

// destroy
PooledObject.pool.destroy();
```

TypedMemoryPool:
```javascript
pool = new TypedMemoryPool(Int32Array, 1, 3);
var instance = pool.acquire();
instance[1] = 2;
pool.release(instance);
pool.destroy();
```

## Support
 * [Issues](https://github.com/PsichiX/mempool.js/issues)