var Torch= function(){

  	"use strict";

  	AFRAME.registerComponent('torch', {
	  	schema: {
	      light: {type: 'boolean', default:''}
	    },

  		init:function(){

  			var el = this.el;
  			var data = this.data;

  			var _light = data.light;

  			console.log('DATA TORCh');
  			console.log(_light);

  			if (_light == true){

  				_light = '; light:true';
  			
  			}
  			else{
  			
  				_light = '';
  			
  			}


			var collider_entity = '<a-entity teleport="action:light_torch' + _light + '" class="collidable" geometry="" transparent="true" position="0 0.45 0" scale="0.2 2.3 0.2" ></a-entity>'
			var object = '<a-obj-model src="public/models/objects/firetorch.obj" obj-model="public/models/objects/firetorch.obj" scale="0.02 0.02 0.02" material=""></a-obj-model>'
			var light = '<a-light type="point" color="orange" intensity="0" distance="100" position="0 1.541 0"></a-light>'

			el.innerHTML = collider_entity + object + light;

			console.log(el);

  		}

   	}); 

};

exports.generate = Torch;