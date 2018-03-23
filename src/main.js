var Teleport = require('./components/teleport.js');
var Torch = require('./components/torch.js');
var Eyes = require('./components/eyes.js')

window.console.log('main.js')
Teleport.launch();	
Torch.generate();
Eyes.open_eyes();