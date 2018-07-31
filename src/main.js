var Interaction = require('./components/interaction.js');
var Torch = require('./components/torch.js');
//var Eyes = require('./components/eyes.js');
var TextHandler = require('./components/text_handler.js');
var Questbook = require('./components/questbook.js');

window.console.log('main.js')
Interaction.init();	
Torch.generate();
//Eyes.open_eyes();
TextHandler.init();
Questbook.init();