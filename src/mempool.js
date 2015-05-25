var global;
//  #ifdef PLATFORM_MODULE
global = module.exports;
//  #else
//      #ifdef PLATFORM_HTML
global = window;
//      #else
throw new Error('Unknown platform!');
//      #endif
//  #endif

(function(exports){

	var module = {exports: {}};

	// #include_once "MemoryPool.js"
	exports.MemoryPool = module.exports.MemoryPool;

	// #include_once "TypedMemoryPool.js"
	exports.TypedMemoryPool = module.exports.TypedMemoryPool;

})(global);
