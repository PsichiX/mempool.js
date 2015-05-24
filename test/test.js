var mempool    = require('../bin/module/debug/mempool.module.js'),
    MemoryPool = mempool.MemoryPool;

function PooledObject(value){
	this.value = value;
}
PooledObject.prototype.value = null;

var pool     = new MemoryPool(PooledObject.prototype, 1),
    instance = pool.factory(1);
pool.acquire();
pool.release(instance);
pool.destroy();
