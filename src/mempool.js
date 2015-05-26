var global;
//  #ifdef PLATFORM_MODULE
global = module.exports;
//  #else
//      #ifdef PLATFORM_HTML
global = window;
//      #else
//          #define var PLATFORM_UNKNOWN = true
//      #endif
//  #endif

(function(exports){

	//  #ifndef PLATFORM_UNKNOWN

	var module = {exports: {}};

	//  #include_once "MemoryPool.js"
	exports.MemoryPool = module.exports.MemoryPool;

	//  #include_once "TypedMemoryPool.js"
	exports.TypedMemoryPool = module.exports.TypedMemoryPool;

	//  #include_once "BufferMemoryPool.js"
	exports.BufferMemoryPool = module.exports.BufferMemoryPool;

	//  #else

	throw new Error('Unknown platform!');

	//  #endif

})(global);
