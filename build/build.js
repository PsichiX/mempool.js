var argv        = process.argv,
    arg, i, c, o, cmd, param, config, mode,
    fs          = require('fs'),
    bundler     = require('bundler.js'),
    actionsPath = './actions.js',
    actions     = fs.existsSync(actionsPath) ? require(actionsPath) : null,
    configPath  = './bundle.json',
    tasks       = {
	    module: [
		    'module.debug',
		    'module.release'
	    ]
    };

// process arguments.
for (i = 2, c = argv.length; i < c; ++i){
	arg = argv[i];
	if (arg.substring(0, 2) === '--' || arg.substring(0, 1) === '-'){
		o = arg.indexOf(':');
		if (o < 0){
			cmd   = arg;
			param = null;
		} else {
			cmd   = arg.substring(0, o);
			param = arg.substring(o + 1);
		}
		if (cmd === '--bundle' || cmd === '-b'){
			o = param.indexOf('=');
			if (o < 0){
				config = param;
				mode   = null;
			} else {
				config = param.substring(0, o);
				mode   = param.substring(o + 1);
			}
			bundler.bundle(config, actions, mode);
		} else if (cmd === '--task' || cmd === '-t'){
			if (tasks.hasOwnProperty(param)){
				var j, n,
				    task = tasks[param];
				for (j = 0, n = task.length; j < n; ++j){
					bundler.bundle(configPath, actions, task[j]);
				}
			} else {
				console.error('Task does not exists: ' + param);
			}
		}
	} else {
		bundler.bundle(configPath, actions, arg);
	}
}
