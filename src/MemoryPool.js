(function(exports){

	/**
	 * Objects memory pool manager.
	 *
	 * @param {Object} proto prototype object.
	 * @param {Number} capacity maximum number of objects that can be acquired from pool.
	 * @constructor
	 */
	function MemoryPool(proto, capacity){

		this._proto = proto;
		this.resize(capacity);

	}

	MemoryPool._pools = {};

	/**
	 * Register memory pool to global container.
	 *
	 * @param {String} id pool ID.
	 * @param {MemoryPool} pool instance.
	 */
	MemoryPool.register = function(id, pool){

		//  #ifdef DEBUG
		if (typeof id !== 'string'){
			throw new Error('MemoryPool.register() | `id` parameter is not type of String!');
		}
		if (!MemoryPool.prototype.isPrototypeOf(pool)){
			throw new Error('MemoryPool.register() | `pool` parameter is not type of MemoryPool!');
		}
		//  #endif
		MemoryPool._pools[id] = pool;

	};

	/**
	 * Unregister memory pool from global container.
	 *
	 * @param {String} id pool ID.
	 * @param {Boolean} destroy determines if pool have to be destroyed.
	 */
	MemoryPool.unregister = function(id, destroy){

		//  #ifdef DEBUG
		if (typeof id !== 'string'){
			throw new Error('MemoryPool.unregister() | `id` parameter is not type of String!');
		}
		//  #endif
		if (MemoryPool._pools.hasOwnProperty(id)){
			if (destroy){
				MemoryPool._pools[id].destroy();
			}
			delete MemoryPool._pools[id];
		}

	};

	/**
	 * Get memory pool from global container.
	 *
	 * @param {String} id pool ID.
	 * @returns {MemoryPool|null}
	 */
	MemoryPool.get = function(id){

		//  #ifdef DEBUG
		if (typeof id !== 'string'){
			throw new Error('MemoryPool.get() | `id` parameter is not type of String!');
		}
		//  #endif
		if (MemoryPool._pools.hasOwnProperty(id)){
			return MemoryPool._pools[id];
		} else {
			return null;
		}

	};

	/**
	 * Get prototype name.
	 *
	 * @param {Object} proto prototype object.
	 * @returns {String}
	 */
	MemoryPool.getProtoName = function(proto){

		var funcNameRegex = /function (.{1,})\(/;
		var results = (funcNameRegex).exec(proto.constructor.toString());
		return (results && results.length > 1) ? results[1] : '';

	};

	MemoryPool.prototype._proto = null;
	MemoryPool.prototype._pool = null;
	MemoryPool.prototype._CATable = null;
	MemoryPool.prototype._CATablePointer = 0;
	MemoryPool.prototype._capacity = 0;
	MemoryPool.prototype._acquired = 0;

	/**
	 * Pool objects prototype.
	 *
	 * @class MemoryPool
	 * @name proto
	 */
	Object.defineProperty(MemoryPool.prototype, 'proto', {

		get: function(){
			return this._proto;
		}

	});

	/**
	 * Pool objects capacity.
	 *
	 * @class MemoryPool
	 * @name capacity
	 */
	Object.defineProperty(MemoryPool.prototype, 'capacity', {

		get: function(){
			return this._capacity;
		}

	});

	/**
	 * Number of acquired pool objects.
	 *
	 * @class MemoryPool
	 * @name acquired
	 */
	Object.defineProperty(MemoryPool.prototype, 'acquired', {

		get: function(){
			return this._acquired;
		}

	});

	/**
	 * Number of released pool objects.
	 *
	 * @class MemoryPool
	 * @name released
	 */
	Object.defineProperty(MemoryPool.prototype, 'released', {

		get: function(){
			return this._capacity - this._acquired;
		}

	});

	/**
	 * Resize pool content.
	 *
	 * @param {Number} count new pool capacity.
	 */
	MemoryPool.prototype.resize = function(count){

		count = count > 1 ? (count | 0) : 1;
		var proto = this._proto,
		    c     = count,
		    pool;
		//  #ifdef DEBUG
		if (!proto){
			throw new Error('MemoryPool::resize() | Objects prototype is not specified!');
		}
		//  #endif
		this.destroy();
		this._proto = proto;
		pool = this._pool = [];
		while (c-- > 0){
			pool.push(Object.create(proto));
		}
		this._CATable = new Uint8Array(Math.ceil(count / 8));
		this._capacity = count;
		MemoryPool.register(MemoryPool.getProtoName(this._proto), this);

	};

	/**
	 * Destroy pool content.
	 */
	MemoryPool.prototype.destroy = function(){

		MemoryPool.unregister(MemoryPool.getProtoName(this._proto));
		this._proto = null;
		this._pool = null;
		this._CATable = null;
		this._CATablePointer = 0;
		this._capacity = 0;
		this._acquired = 0;

	};

	/**
	 * Acquire object instance from pool if there are instances left, or create by new() otherwise.
	 *
	 * @returns {Object}
	 */
	MemoryPool.prototype.acquire = function(){

		var proto    = this._proto,
		    pool     = this._pool,
		    table    = this._CATable,
		    pointer  = this._CATablePointer,
		    current  = pointer,
		    capacity = this._capacity,
		    mask     = 0,
		    status   = 0,
		    stackTrace,
		    stack;
		//  #ifdef DEBUG
		if (!proto){
			throw new Error('MemoryPool::acquire() | Objects prototype is not specified!');
		}
		if (!pool){
			throw new Error('MemoryPool::acquire() | Objects pool does not exists!');
		}
		//  #endif
		if (this._acquired < this._capacity){
			do {
				mask = 1 << (current % 8);
				status = table[(current / 8) | 0] & mask;
				if (status){
					if (++current >= capacity){
						current = 0;
					}
				} else {
					table[(current / 8) | 0] |= mask;
					this._CATablePointer = current;
					this._acquired++;
					var instance = pool[current];
					// #ifdef DEBUG
					stackTrace = '';
					try {
						throw new Error();
					} catch (err) {
						stack = err.stack;
						instance._creationStackTrace = stack.substring(stack.indexOf('at'));
					}
					// #endif
					return instance;
				}
			} while (current !== pointer);
		}
		// #ifdef DEBUG
		stackTrace = '';
		try {
			throw new Error();
		} catch (err) {
			stack = err.stack;
			stackTrace = stack.substring(stack.indexOf('at'));
		}
		console.error('MemoryPool::acquire() | Object created outside of pool: ' + MemoryPool.getProtoName(proto) + '\nStackTrace: ' + stackTrace);
		// #endif
		return Object.create(proto);

	};

	/**
	 * Acquire object instance from pool if there are instances left, or create by new() otherwise.
	 * Constructor of new object will be automatically called with provided arguments.
	 *
	 * @returns {Object}
	 */
	MemoryPool.prototype.factory = function(){

		var proto = this._proto;
		//  #ifdef DEBUG
		if (!proto){
			throw new Error('MemoryPool::factory() | Objects prototype is not specified!');
		}
		//  #endif
		var instance = this.acquire();
		proto.constructor.apply(instance, arguments);
		return instance;

	};

	/**
	 * Acquire object instance from pool if there are instances left, or create by new() otherwise.
	 * Constructor of new object will be automatically called with arguments provided in `args` parameter.
	 *
	 * @param {Array} args array of arguments to use as new instance constructor parameters.
	 * @returns {Object}
	 */
	MemoryPool.prototype.factoryArgs = function(args){

		var proto = this._proto;
		//  #ifdef DEBUG
		if (!proto){
			throw new Error('MemoryPool::factoryArgs() | Objects prototype is not specified!');
		}
		//  #endif
		var instance = this.acquire();
		proto.constructor.apply(instance, args);
		return instance;

	};

	/**
	 * Release instance to pool.
	 *
	 * @param {Object} instance instance acquired from pool.
	 */
	MemoryPool.prototype.release = function(instance){

		var proto = this._proto,
		    pool  = this._pool,
		    table = this._CATable,
		    pointer,
		    mask  = 0;
		//  #ifdef DEBUG
		if (!proto){
			throw new Error('MemoryPool::release() | Objects prototype is not specified!');
		}
		if (!pool){
			throw new Error('MemoryPool::release() | Objects pool does not exists!');
		}
		if (!proto.isPrototypeOf(instance)){
			throw new Error('MemoryPool::release() | `instance` parameter is not type of pool objects prototype!');
		}
		//  #endif
		pointer = pool.indexOf(instance);
		if (pointer >= 0){
			mask = 1 << (pointer % 8);
			table[(pointer / 8) | 0] &= ~mask;
			this._CATablePointer = pointer;
			this._acquired--;
			//  #ifdef DEBUG
			delete instance._creationStackTrace;
			//  #endif
		}

	};

	/**
	 * Checks if instance is acquired from pool.
	 *
	 * @param {Object} instance instance to test.
	 * @returns {Boolean}
	 */
	MemoryPool.prototype.isAcquired = function(instance){

		var proto = this._proto,
		    pool  = this._pool,
		    table = this._CATable,
		    pointer,
		    mask  = 0;
		//  #ifdef DEBUG
		if (!proto){
			throw new Error('MemoryPool::isAcquired() | Objects prototype is not specified!');
		}
		if (!pool){
			throw new Error('MemoryPool::isAcquired() | Objects pool does not exists!');
		}
		if (!proto.isPrototypeOf(instance)){
			throw new Error('MemoryPool::isAcquired() | `instance` parameter is not type of pool objects prototype!');
		}
		//  #endif
		pointer = pool.indexOf(instance);
		if (pointer >= 0){
			mask = 1 << (pointer % 8);
			return !!(table[(pointer / 8) | 0] & mask);
		}
		return false;

	};

	exports.MemoryPool = MemoryPool;

})(module.exports);
