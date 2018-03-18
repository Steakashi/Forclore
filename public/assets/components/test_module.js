AFRAME.registerComponent('hello-world', {
  schema: {
    event: {type: 'string', default: ''},
    message: {type: 'string', default: 'Hello, World!'}
  },

  init: function () {
    console.log('Hello, World!');
  },

  doThing: function() {
  	console.log('It is doing something !')
  },

  update:function(oldData){
  	console.log('processing...')
  	this.doThing();
  	console.log(this.el)
  	console.log(this.data)
  	console.log(this.data.event)
 	if (this.data.event){
 		console.log('in da loop !')
 	}

 	var data = this.data;
    var el = this.el;
    // `event` updated. Remove the previous event listener if it exists.
    if (oldData.event && data.event !== oldData.event) {
      el.removeEventListener(oldData.event, this.eventHandlerFn);
    }
    if (data.event) {
      el.addEventListener(data.event, this.eventHandlerFn);
    } else {
      console.log(data.message);
    }
  }
});