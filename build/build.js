var argv     = process.argv,
    arg, i, c, task, j, n,
    compiler = require('compiler.js'),
    tasks    = {
	    module: [
		    './module.debug.json',
		    './module.release.json'
	    ],
	    html: [
		    './html.debug.json',
		    './html.release.json'
	    ],
	    all: [
		    './module.debug.json',
		    './module.release.json',
		    './html.debug.json',
		    './html.release.json'
	    ]
    };

// process arguments.
for (i = 2, c = argv.length; i < c; ++i){
	arg = argv[i];
	if (tasks.hasOwnProperty(arg)){
		task = tasks[arg];
		for (j = 0, n = task.length; j < n; ++j){
			compiler.compile(task[j]);
		}
	} else {
		compiler.compile(arg);
	}
}
