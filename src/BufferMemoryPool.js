(function(exports){

	////
	/// TODO
	//

	function BufferMemoryPool(capacity){

		this.resize(capacity);

	}

	BufferMemoryPool._acquireMapDefragOps = 1 << 4;
	BufferMemoryPool._acquireMapPartBytesRange = ((1 << 15) - 1) << 2;

	BufferMemoryPool.alignTo = function(bytesCount, alignCount){

		return ((bytesCount + alignCount - 1) & ~(alignCount - 1)) | 0;

	};

	BufferMemoryPool.alignTo4 = function(bytesCount){

		return ((bytesCount + 3) & -4) | 0;

	};

	BufferMemoryPool.prototype._buffer = null;
	BufferMemoryPool.prototype._acquireMapPartsCount = 0;
	BufferMemoryPool.prototype._acquireMap = null;
	BufferMemoryPool.prototype._acquireMapSize = 0;
	BufferMemoryPool.prototype._capacity = 0;
	BufferMemoryPool.prototype._acquired = 0;


	Object.defineProperty(BufferMemoryPool.prototype, 'capacity', {

		get: function(){
			return this._capacity;
		}

	});

	Object.defineProperty(BufferMemoryPool.prototype, 'acquired', {

		get: function(){
			return this._acquired;
		}

	});

	Object.defineProperty(BufferMemoryPool.prototype, 'released', {

		get: function(){
			return this._capacity - this._acquired;
		}

	});

	BufferMemoryPool.prototype.resize = function(count){

		count = count > 4 ? BufferMemoryPool.alignTo4(count | 0) | 0 : 4;
		var partsCount,
		    acquireMap,
		    i, c;
		this.destroy();
		this._buffer = new ArrayBuffer(count);
		partsCount = this._acquireMapPartsCount = Math.ceil(count / BufferMemoryPool._acquireMapPartBytesRange) | 0;
		acquireMap = this._acquireMap = new Uint16Array(partsCount << 1);
		for (i = 0, c = partsCount << 1; i < c; ++i){
			acquireMap[i] = 1 << 15;
		}
		this._capacity = count;

	};

	BufferMemoryPool.prototype.destroy = function(){

		this._buffer = null;
		this._acquireMapPartsCount = 0;
		this._acquireMap = null;
		this._acquireMapSize = 0;
		this._capacity = 0;
		this._acquired = 0;

	};

	BufferMemoryPool.prototype.acquire = function(bytesCount){

		bytesCount = bytesCount > 4 ? BufferMemoryPool.alignTo4(bytesCount | 0) | 0 : 4;
		var acquired       = this._acquired,
		    capacity       = this._capacity,
		    acquireMap     = this._acquireMap,
		    acquireMapSize = this._acquireMapSize,
		    pointer        = 0,
		    currentOffset4,
		    currentCount4,
		    emptySector    = 0,
		    stackTrace,
		    stack;
		if (acquired + bytesCount <= capacity){
			if (acquireMapSize <= 0){
				this._acquireMapSize = 2;
				acquireMap[0] = 0;
				acquireMap[1] = bytesCount >> 2;
			} else {
				//pointer = // TODO
			}
		}
		// #ifdef DEBUG
		stackTrace = '';
		try {
			throw new Error();
		} catch (err){
			stack = err.stack;
			stackTrace = stack.substring(stack.indexOf('at'));
		}
		console.error('BufferMemoryPool::acquire() | Buffer created outside of pool!\nStackTrace: ' + stackTrace);
		// #endif
		return new ArrayBuffer(bytesCount);

	};

	exports.BufferMemoryPool = BufferMemoryPool;

})(module.exports);
