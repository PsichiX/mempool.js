(function(){

	var exports;
	//  #ifdef PLATFORM_MODULE
	exports = module.exports;
	//  #else
	//      #ifdef PLATFORM_HTML
	exports = window;
	//      #else
	//          #define var PLATFORM_UNKNOWN = true
	//      #endif
	//  #endif

	//  #ifndef PLATFORM_UNKNOWN
	(function(exports){

		var module = {exports: {}};

		//  #include_once "MemoryPool.js"
		exports.MemoryPool = module.exports.MemoryPool;

		//  #include_once "TypedMemoryPool.js"
		exports.TypedMemoryPool = module.exports.TypedMemoryPool;

		// TODO
		//  include_once "BufferMemoryPool.js"
		//exports.BufferMemoryPool = module.exports.BufferMemoryPool;

	})(exports);
	//  #else
	throw new Error('Unknown platform!');
	//  #endif

})();
