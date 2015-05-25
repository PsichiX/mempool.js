(function(exports){

	/**
	 * Typed memory pool manager.
	 *
	 * @param {ArrayBufferView} viewConstructor typed array constructor.
	 * @param {Number} capacity maximum number of chunks that can be acquired from pool.
	 * @param {Number} chunkSize number of value fields per chunk.
	 * @constructor
	 */
	function TypedMemoryPool(viewConstructor, capacity, chunkSize){

		this._viewConstructor = viewConstructor;
		this.resize(capacity, chunkSize);

	}

	TypedMemoryPool.prototype._viewConstructor = null;
	TypedMemoryPool.prototype._buffer = null;
	TypedMemoryPool.prototype._pool = null;
	TypedMemoryPool.prototype._CATable = null;
	TypedMemoryPool.prototype._CATablePointer = 0;
	TypedMemoryPool.prototype._capacity = 0;
	TypedMemoryPool.prototype._chunkSize = 0;
	TypedMemoryPool.prototype._acquired = 0;

	/**
	 * Pool chunks constructor.
	 *
	 * @class TypedMemoryPool
	 * @name viewConstructor
	 */
	Object.defineProperty(TypedMemoryPool.prototype, 'viewConstructor', {

		get: function(){
			return this._viewConstructor;
		}

	});

	/**
	 * Pool chunks capacity.
	 *
	 * @class TypedMemoryPool
	 * @name capacity
	 */
	Object.defineProperty(TypedMemoryPool.prototype, 'capacity', {

		get: function(){
			return this._capacity;
		}

	});

	/**
	 * Number of value fields per chunk.
	 *
	 * @class TypedMemoryPool
	 * @name chunkSize
	 */
	Object.defineProperty(TypedMemoryPool.prototype, 'chunkSize', {

		get: function(){
			return this._chunkSize;
		}

	});

	/**
	 * Number of acquired pool chunks.
	 *
	 * @class TypedMemoryPool
	 * @name acquired
	 */
	Object.defineProperty(TypedMemoryPool.prototype, 'acquired', {

		get: function(){
			return this._acquired;
		}

	});

	/**
	 * Number of released pool chunks.
	 *
	 * @class TypedMemoryPool
	 * @name released
	 */
	Object.defineProperty(TypedMemoryPool.prototype, 'released', {

		get: function(){
			return this._capacity - this._acquired;
		}

	});

	/**
	 * Resize pool content.
	 *
	 * @param {Number} count new pool capacity.
	 */
	TypedMemoryPool.prototype.resize = function(count, chunkSize){

		count = count > 1 ? (count | 0) : 1;
		chunkSize = chunkSize > 1 ? (chunkSize | 0) : 1;
		var viewConstructor = this._viewConstructor,
		    c               = count,
		    offset          = 0,
		    stride,
		    buffer,
		    pool,
		    bpe;
		//  #ifdef DEBUG
		if (!viewConstructor){
			throw new Error('TypedMemoryPool::resize() | View constructor is not specified!');
		}
		//  #endif
		bpe = viewConstructor.BYTES_PER_ELEMENT;
		//  #ifdef DEBUG
		if (!bpe){
			throw new Error('TypedMemoryPool::resize() | View constructor is not type of TypedArray!');
		}
		//  #endif
		stride = chunkSize * bpe;
		this.destroy();
		this._viewConstructor = viewConstructor;
		buffer = this._buffer = new ArrayBuffer(count * stride);
		pool = this._pool = [];
		while (c-- > 0){
			pool.push(new viewConstructor(buffer, offset, chunkSize));
			offset += stride;
		}
		this._CATable = new Uint8Array(Math.ceil(count / 8));
		this._capacity = count;
		this._chunkSize = chunkSize;

	};

	/**
	 * Destroy pool content.
	 */
	TypedMemoryPool.prototype.destroy = function(){

		this._viewConstructor = null;
		this._buffer = null;
		this._pool = null;
		this._CATable = null;
		this._CATablePointer = 0;
		this._capacity = 0;
		this._chunkSize = 0;
		this._acquired = 0;

	};

	/**
	 * Acquire chunk instance from pool if there are chunks left, or create by new() otherwise.
	 *
	 * @returns {ArrayBufferView}
	 */
	TypedMemoryPool.prototype.acquire = function(){

		var viewConstructor = this._viewConstructor,
		    pool            = this._pool,
		    table           = this._CATable,
		    pointer         = this._CATablePointer,
		    current         = pointer,
		    capacity        = this._capacity,
		    mask            = 0,
		    status          = 0,
		    stackTrace,
		    stack;
		//  #ifdef DEBUG
		if (!viewConstructor){
			throw new Error('TypedMemoryPool::acquire() | View constructor is not specified!');
		}
		if (!pool){
			throw new Error('TypedMemoryPool::acquire() | Chunks pool does not exists!');
		}
		// #endif
		if (this._acquired < this._capacity){
			do{
				mask = 1 << (current % 8);
				status = table[current] & mask;
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
					} catch (err){
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
		} catch (err){
			stack = err.stack;
			stackTrace = stack.substring(stack.indexOf('at'));
		}
		console.error('TypedMemoryPool::acquire() | Chunk created outside of pool!\nStackTrace: ' + stackTrace);
		// #endif
		return new viewConstructor(this._chunkSize);

	};

	/**
	 * Release chunk to pool.
	 *
	 * @param {Object} instance chunk acquired from pool.
	 */
	TypedMemoryPool.prototype.release = function(instance){

		var viewConstructor = this._viewConstructor,
		    table           = this._CATable,
		    buffer,
		    pointer,
		    mask            = 0;
		//  #ifdef DEBUG
		if (!viewConstructor){
			throw new Error('TypedMemoryPool::release() | View constructor is not specified!');
		}
		if (!viewConstructor.prototype.isPrototypeOf(instance)){
			throw new Error('TypedMemoryPool::release() | `instance` parameter is not type of pool chunks prototype!');
		}
		//  #endif
		buffer = instance.buffer;
		if (buffer === this._buffer){
			pointer = instance.byteOffset / viewConstructor.BYTES_PER_ELEMENT / this._chunkSize;
			if (pointer >= 0){
				mask = 1 << (pointer % 8);
				table[(pointer / 8) | 0] &= ~mask;
				this._CATablePointer = pointer;
				this._acquired--;
			}
		}

	};

	/**
	 * Checks if chunk is acquired from pool.
	 *
	 * @param {Object} instance chunk to test.
	 * @returns {Boolean}
	 */
	TypedMemoryPool.prototype.isAcquired = function(instance){

		var viewConstructor = this._viewConstructor,
		    table           = this._CATable,
		    buffer,
		    pointer,
		    mask            = 0;
		//  #ifdef DEBUG
		if (!viewConstructor){
			throw new Error('TypedMemoryPool::isAcquired() | View constructor is not specified!');
		}
		if (!viewConstructor.prototype.isPrototypeOf(instance)){
			throw new Error('TypedMemoryPool::isAcquired() | `instance` parameter is not type of pool objects prototype!');
		}
		//  #endif
		buffer = instance.buffer;
		if (buffer === this._buffer){
			pointer = instance.byteOffset / viewConstructor.BYTES_PER_ELEMENT / this._chunkSize;
			if (pointer >= 0){
				mask = 1 << (pointer % 8);
				return table[(pointer / 8) | 0] & mask;
			}
		}
		return false;

	};

	exports.TypedMemoryPool = TypedMemoryPool;

})(module.exports);
