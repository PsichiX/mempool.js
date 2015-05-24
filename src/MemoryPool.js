(function(exports){

	function MemoryPool(proto, capacity){

		this._proto = proto;
		this.resize(capacity);

	}

	MemoryPool._pools = {};

	MemoryPool.register = function(id, pool){

		if (typeof id !== 'string'){
			throw 'MemoryPool.register() | `id` parameter is not type of String!';
		}
		if (!MemoryPool.prototype.isPrototypeOf(pool)){
			throw 'MemoryPool.register() | `pool` parameter is not type of MemoryPool!';
		}

		MemoryPool._pools[id] = pool;

	};

	MemoryPool.unregister = function(id, destroy){

		if (typeof id !== 'string'){
			throw 'MemoryPool.unregister() | `id` parameter is not type of String!';
		}
		if (MemoryPool._pools.hasOwnProperty(id)){
			if (destroy){
				MemoryPool._pools[id].destroy();
			}
			delete MemoryPool._pools[id];
		}

	};

	MemoryPool.get = function(id){

		if (typeof id !== 'string'){
			throw 'MemoryPool.get() | `id` parameter is not type of String!';
		}
		if (MemoryPool._pools.hasOwnProperty(id)){
			return MemoryPool._pools[id];
		} else {
			return null;
		}

	};

	MemoryPool.prototype._proto          = null;
	MemoryPool.prototype._pool           = null;
	MemoryPool.prototype._CATable        = null;
	MemoryPool.prototype._CATablePointer = 0;
	MemoryPool.prototype._capacity       = 0;
	MemoryPool.prototype._acquired       = 0;

	Object.defineProperty(MemoryPool.prototype, 'capacity', {

		get: function(){
			return this._capacity;
		}

	});

	Object.defineProperty(MemoryPool.prototype, 'acquired', {

		get: function(){
			return this._acquired;
		}

	});

	Object.defineProperty(MemoryPool.prototype, 'released', {

		get: function(){
			return this._capacity - this._acquired;
		}

	});

	MemoryPool.prototype.resize = function(count){

		count       = count > 1 ? count : 1;
		var proto   = this._proto,
		    c       = count,
		    pool;
		if (!proto){
			throw 'MemoryPool::resize() | Objects prototype is not specified!';
		}
		this.destroy();
		this._proto = proto;
		pool        = this._pool = [];
		while (--c > 0){
			pool.push(Object.create(proto));
		}
		this._CATable  = new Uint8Array(count);
		this._capacity = count;
		MemoryPool.register(this._proto.toString(), this);

	};

	MemoryPool.prototype.destroy = function(){

		MemoryPool.unregister(this._proto.toString());
		this._proto          = null;
		this._pool           = null;
		this._CATable        = null;
		this._CATablePointer = 0;
		this._capacity       = 0;
		this._acquired       = 0;

	};

	MemoryPool.prototype.acquire = function(){

		var proto    = this._proto,
		    pool     = this._pool,
		    table    = this._CATable,
		    pointer  = this._CATablePointer,
		    current  = pointer,
		    capacity = this._capacity;
		if (!proto){
			throw 'MemoryPool::acquire() | Objects prototype is not specified!';
		}
		if (!pool){
			throw 'MemoryPool::acquire() | Objects pool does not exists!';
		}
		if (this._acquired < this._capacity){
			do {
				if (table[current]){
					if (++current >= capacity){
						current = 0;
					}
				} else {
					table[current]       = 1;
					this._CATablePointer = current;
					this._acquired++;
					return pool[current];
				}
			} while (current !== pointer);
		}
		// #ifdef DEBUG
		console.error('MemoryPool::acquire() | Object created outside of pool:', proto);
		// #endif
		return Object.create(proto);

	};

	MemoryPool.prototype.factory = function(){

		var proto = this._proto;
		if (!proto){
			throw 'MemoryPool::factory() | Objects prototype is not specified!';
		}

		var instance = this.acquire();
		proto.constructor.apply(instance, arguments);
		return instance;

	};

	MemoryPool.prototype.release = function(instance){

		var proto = this._proto,
		    pool  = this._pool,
		    table = this._CATable,
		    pointer;
		if (!proto){
			throw 'MemoryPool::release() | Objects prototype is not specified!';
		}
		if (!pool){
			throw 'MemoryPool::release() | Objects pool does not exists!';
		}
		if (Object.getPrototypeOf(instance) !== proto){
			throw 'MemoryPool::release() | `instance` parameter is not type of pool objects prototype!';
		}
		pointer = pool.indexOf(instance);
		if (pointer >= 0){
			table[pointer]       = 0;
			this._CATablePointer = pointer;
			this._acquired--;
		}

	};

	MemoryPool.prototype.isAcquired = function(instance){

		var proto = this._proto,
		    pool  = this._pool,
		    table = this._CATable,
		    pointer;
		if (!proto){
			throw 'MemoryPool::isAcquired() | Objects prototype is not specified!';
		}
		if (!pool){
			throw 'MemoryPool::isAcquired() | Objects pool does not exists!';
		}
		if (Object.getPrototypeOf(instance) !== proto){
			throw 'MemoryPool::isAcquired() | `instance` parameter is not type of pool objects prototype!';
		}
		pointer = pool.indexOf(instance);
		return pointer >= 0 && table[pointer];

	};

	exports.MemoryPool = MemoryPool;

})(module.exports);
