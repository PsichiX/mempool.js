var scriptPaths     = {
	    debug:   'debug/mempool.js',
	    release: 'release/mempool.min.js'
    },
    argv            = process.argv,
    mode            = argv.length > 2 ? argv[2] : 'debug',
    scriptPath      = scriptPaths.hasOwnProperty(mode) ? scriptPaths[mode] : 'debug',
    mempool         = require('../bin/module/' + scriptPath),
    MemoryPool      = mempool.MemoryPool,
    TypedMemoryPool = mempool.TypedMemoryPool;

////
/// Helpers.
//

function test(expression, expected, messageFailure, messageSuccess){
	if (expression == expected){
		messageSuccess && console.log('SUCCESS: ' + messageSuccess);
	} else {
		messageFailure && console.error('FAILURE: ' + messageFailure);
		throw new Error('FAILURE: ' + messageFailure);
	}
}

////
/// MemoryPool.
//

function PooledObject(value){
	this.value = value;
}
PooledObject.prototype.value = null;

test(typeof MemoryPool, 'function', 'MemoryPool is not a type of function!');

var pool = new MemoryPool(PooledObject.prototype, 2);

test(pool instanceof MemoryPool, true, 'pool is not a type of MemoryPool!');
test(pool.acquired, 0, 'pool.acquired is not equal 0!');
test(pool.capacity, 2, 'pool.capacity is not equal 2!');
test(pool.released, 2, 'pool.released is not equal 2!');

var instance = pool.factory(1);

test(instance instanceof PooledObject, true, 'instance is not a type of PooledObject!');
test(pool.isAcquired(instance), true, 'instance is not acquired by pool!');
test(pool.acquired, 1, 'pool.acquired is not equal 1!');
test(pool.released, 1, 'pool.released is not equal 1!');

var instance2 = pool.factory(2);

test(instance2 instanceof PooledObject, true, 'instance2 is not a type of PooledObject!');
test(pool.isAcquired(instance2), true, 'instance2 is not acquired by pool!');
test(pool.acquired, 2, 'pool.acquired is not equal 2!');
test(pool.released, 0, 'pool.released is not equal 0!');

var instance3 = pool.factoryArgs([3]);

test(instance3 instanceof PooledObject, true, 'instance3 is not a type of PooledObject!');
test(pool.isAcquired(instance3), false, 'instance3 is acquired by pool!');
test(pool.acquired, 2, 'pool.acquired is not equal 2!');
test(pool.released, 0, 'pool.released is not equal 0!');

pool.release(instance);

test(pool.isAcquired(instance), false, 'instance is acquired by pool!');
test(pool.acquired, 1, 'pool.acquired is not equal 0!');
test(pool.released, 1, 'pool.released is not equal 1!');

pool.destroy();

test(pool.acquired, 0, 'pool.acquired is not equal 0!');
test(pool.capacity, 0, 'pool.capacity is not equal 0!');
test(pool.released, 0, 'pool.released is not equal 0!');

console.log('MemoryPool test passed successfully!\n');

////
/// TypedMemoryPool.
//

test(typeof TypedMemoryPool, 'function', 'TypedMemoryPool is not a type of function!');

pool = new TypedMemoryPool(Int32Array, 1, 3);

test(pool instanceof TypedMemoryPool, true, 'pool is not a type of TypedMemoryPool!');
test(pool.acquired, 0, 'pool.acquired is not equal 0!');
test(pool.capacity, 1, 'pool.capacity is not equal 1!');
test(pool.released, 1, 'pool.released is not equal 1!');

instance = pool.acquire();

test(instance instanceof Int32Array, true, 'instance is not a type of Int32Array!');
test(pool.isAcquired(instance), true, 'instance is not acquired by pool!');
test(pool.acquired, 1, 'pool.acquired is not equal 1!');
test(pool.released, 0, 'pool.released is not equal 0!');

instance2 = pool.acquire();

test(instance2 instanceof Int32Array, true, 'instance2 is not a type of Int32Array!');
test(pool.isAcquired(instance2), false, 'instance is acquired by pool!');
test(pool.acquired, 1, 'pool.acquired is not equal 1!');
test(pool.released, 0, 'pool.released is not equal 0!');

pool.release(instance);

test(pool.isAcquired(instance), false, 'instance is acquired by pool!');
test(pool.acquired, 0, 'pool.acquired is not equal 0!');
test(pool.released, 1, 'pool.released is not equal 1!');

pool.destroy();

test(pool.acquired, 0, 'pool.acquired is not equal 0!');
test(pool.capacity, 0, 'pool.capacity is not equal 0!');
test(pool.released, 0, 'pool.released is not equal 0!');

console.log('TypedMemoryPool test passed successfully!\n');
