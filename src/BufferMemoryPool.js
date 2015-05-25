// TODO
(function(exports){

	function BufferMemoryPool(capacity){

		this.resize(capacity);

	}

	BufferMemoryPool.alignTo = function(bytesCount, alignCount){

		return (bytesCount + alignCount - 1) & ~(alignCount - 1);

	};

	BufferMemoryPool.alignTo4 = function(bytesCount){

		return (bytesCount + 3) & -4;

	};

	BufferMemoryPool.prototype._buffer = null;
	BufferMemoryPool.prototype._acquireMap = null;
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

		count = count > 1 ? BufferMemoryPool.alignTo4(count | 0) : 4;
		var buffer;
		this.destroy();
		buffer = this._buffer = new ArrayBuffer(count);
		// TODO

	};

	exports.BufferMemoryPool = BufferMemoryPool;

})(module.exports);
