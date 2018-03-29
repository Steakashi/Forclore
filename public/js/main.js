(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
var Eyes= function(){

  	"use strict";

  	AFRAME.registerComponent('eyes', {
	  	schema: {
	      light: {type: 'boolean', default:false},
        target: {type: 'string', default:null}
	    },

  		init:function(){

        var offset_y_axis = 0;
        var previous_offset_y_axis = 0;
        var decreasing = 0.01
        var black_screen = document.getElementById("black_screen");
        //black_screen.style.display = 'block'; 

        requestAnimationFrame(function(timestamp){
          var timer = window.setInterval(function(){
        
            var rotation = document.getElementById('player').getAttribute('rotation');
            offset_y_axis += (Math.abs(rotation.y - previous_offset_y_axis) / 200);
            previous_offset_y_axis = rotation.y;

            if(offset_y_axis > 1){

              window.clearInterval(timer);

            }
            else if (offset_y_axis > 0){

              offset_y_axis -= decreasing;

            }
            else{

              offset_y_axis = 0

            }

            black_screen.setAttribute('opacity', 1 - offset_y_axis);

          }, 10);
        });

      }


   	}); 

};

exports.open_eyes = Eyes;
},{}],2:[function(require,module,exports){
var Questbook= function(){

  	"use strict";

  	AFRAME.registerComponent('questbook', {
	  	schema: {
	       step: {step:'int', default:0}
	    },

  		init:function(){

        var el = this.el;
        var data = this.data;
        console.log('QUESTBOOK');
        console.log(data);

        var text_displayed = false;

        console.log('questbook launched');
        var text_handler = document.getElementById('text_handler');
        console.log(text_handler);

        el.sceneEl.addEventListener('pass_step', pass_step);

        function pass_step(step_string){

          console.log('PASS STEP');
          console.log(text_displayed);
          console.log

          if (text_displayed == false){

            text_displayed = true;

            if (typeof(step_string) != 'string'){

              var step = parseInt(step_string.detail);

            }
            else{

              var step = step_string;

            }

            if (step == 0){

              var new_step = el.getAttribute('questbook', 'step').step + 1

            }
            else{

              var new_step = step

            }

            console.log(new_step)
            el.setAttribute('questbook', 'step', new_step);
            var text = load_text(new_step);

            if (text != '!!END'){

              el.emit('display_text', text);

              setTimeout(function(){

                text_displayed = false;
                pass_step('0');  

              }, 6000);

            }

          }

        }

        function load_text(step){

          switch(step){

            case 1:
              return 'test';
              break;

            case 2:
              return 'test2';
              break;

            default:
              return '!!END';

          }

        }

      },

    
      test_function: function(){
        console.log('test successfull !');
      },

      update: function(oldData){

      }



   	}); 

};

exports.init = Questbook;
},{}],3:[function(require,module,exports){
var Teleport= function(){

  "use strict";

  AFRAME.registerComponent('teleport', {
    dependencies: ['raycaster'],
    schema: {
      target: {type: 'vec3'},
      action: {type: 'string'},
      light: {type: 'boolean'},
      target_to_activate: {type: 'string', default:null},
      event: {type: 'string', default:null},
      disable: {type: 'boolean', default:false},
      step: {type: 'int', default:0}
    },

    init: function () {
      var el = this.el;
      var isIntersecting = false;

      var global_timer = 0;

      var data = this.data
      this.data_test = this.data
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null;

      var questbook = document.getElementById('questbook')

      if (data.action == 'teleport'){

        var timer_black_screen = 0;
        var player =  document.querySelector("#player");
        var black_screen = document.getElementById("black_screen");

        action_to_perform = teleport


      }
      else if (data.action == 'interact'){

        action_to_perform = interact

      }
            else if (data.action == 'light_torch'){

        action_to_perform = light_torch

      }

      if (data.light == true){

        create_light_animation_repeat(el.parentNode.querySelector('a-light'));

      }
      else{

        this.el.addEventListener('raycaster-intersected', raycaster_intersected);
        this.el.addEventListener('raycaster-intersected-cleared', raycaster_intersected_cleared); 

      }

      function interaction_is_possible(){



        if (isIntersecting == false){

          if (data.action == 'teleport' && (player.getAttribute('position') != data.target && data.disable == false)){

            return true

          }
          else if ((data.action == 'interact' || data.action == "light_torch") && data.disable == false){

            return true

          } 

        }

        return false

      }

      function event_handler(){

        if (data.event){ 

          console.log('event handler from teleport');
          //questbook.setAttribute('questbook', 'step', 100);
          console.log(questbook);
          console.log(data.step);
          var step = data.step.toString();
          el.emit('pass_step', step); 

        }

      }
      
      function raycaster_intersected(){

        if (interaction_is_possible()){

          isIntersecting = true;
          loader.style.display = "block";
          
          requestAnimationFrame(function(timestamp){

            global_timer = setTimeout(function(){

              action_to_perform() 
              event_handler();

            }, 1000);

          });

        }

      }

      function raycaster_intersected_cleared(){

        if (global_timer){
          clearTimeout(global_timer);
          global_timer=0;
        }

        loader.style.display = "none"
        isIntersecting = false;

      }

      function interact(){

        el.setAttribute('material', 'color', 'green');
        data.disable = true;
        raycaster_intersected_cleared();

      }

      function teleport(){

        show_black_screen()
        setTimeout(hide_black_screen, 1000); 

      }

      function show_black_screen(){

        var black_screen_animation = document.createElement('a-animation');

        black_screen_animation.setAttribute('attribute', 'opacity');
        black_screen_animation.setAttribute("dur", "1000");
        black_screen_animation.setAttribute("from", "0");
        black_screen_animation.setAttribute("to", "1");
        black_screen_animation.setAttribute("easing", "linear");

        black_screen.appendChild(black_screen_animation);

      }

      function hide_black_screen(){
        
        player.setAttribute('position', data.target );
        
        var black_screen_animation = document.createElement('a-animation');

        black_screen_animation.setAttribute('attribute', 'opacity');
        black_screen_animation.setAttribute("dur", "1000");
        black_screen_animation.setAttribute("from", "1");
        black_screen_animation.setAttribute("to", "0");
        black_screen_animation.setAttribute("easing", "linear");

        black_screen.appendChild(black_screen_animation);

      }

      function create_light_transition(target){

        var light_animation = document.createElement('a-animation');

        light_animation.setAttribute('attribute', 'intensity');
        light_animation.setAttribute("dur", "1000");
        light_animation.setAttribute("from", "0");
        light_animation.setAttribute("to", "1.6");
        light_animation.setAttribute("easing", "linear");

        target.appendChild(light_animation);

      }

      function create_light_animation_repeat(target){

        var light_animation = document.createElement('a-animation');

        light_animation.setAttribute('attribute', 'intensity');
        light_animation.setAttribute("dur", "3000");
        light_animation.setAttribute("from", "1.8");
        light_animation.setAttribute("to", "2.5");
        light_animation.setAttribute("direction", "alternate");
        light_animation.setAttribute("easing", "ease-in-out-elastic");
        light_animation.setAttribute("repeat", "indefinite");
        light_animation.setAttribute("fill", "forwards");

        target.appendChild(light_animation);

      }
 
      function light_torch( ){

        interact(data);

        if (data.target_to_activate != null) {

          document.getElementById(data.target_to_activate).setAttribute('teleport', 'disable', false);

        }

        var light_object = el.parentNode.querySelector('a-light');
        
        create_light_transition(light_object)

        requestAnimationFrame(function(timestamp){

          setTimeout(function(){

            light_object.removeChild(light_object.querySelector('a-animation'));
            create_light_animation_repeat(light_object)

          }, 1000);

        });

      }

    }, 

    update: function(){

      this.init();

    },


    intersectHandler: function(){

      
    },

    intersectRemovalHandler: function(){



    },


    teleportCharacter: function(el, player){


    }

  }); 

};

exports.launch = Teleport;
},{}],4:[function(require,module,exports){
var TextHandler = function(){

  	"use strict";

  	AFRAME.registerComponent('text_handler', {
	  	schema: {
	      step: {type: 'int', default:0},
        text_list: {type: 'array', default: []}
	    },

  		init:function(){

        var el = this.el        

        console.log('init text');
        //this.el.setAttribute('text', 'value', this.text_displayer(this.data.step));
        //
        
        el.sceneEl.addEventListener('display_text', display_text);

        function display_text(text){

          console.log('ARG_TEST');
          console.log(text);

          el.setAttribute('text', 'value', text.detail);

          var text_animation = document.createElement('a-animation');
          text_animation.setAttribute('attribute', 'text.opacity');
          text_animation.setAttribute("dur", 3000);
          text_animation.setAttribute("from", "0");
          text_animation.setAttribute("to", "1");
          text_animation.setAttribute("direction", "alternate");
          text_animation.setAttribute("repeat", 1);
          text_animation.setAttribute("easing", "ease-out-expo");

          el.appendChild(text_animation);

        }

  		},

      text_displayer: function(step){

        var text_to_return = ''
        switch(step){

          case 0:
            text_to_return = this.text_list[0];
            break;

          case 1:
            text_to_return = this.text_list[1];
            break;  

          default:
            text_to_return = '';
            break;
        
        }

        return text_to_return

      },

   	}); 

};

exports.init = TextHandler;

},{}],5:[function(require,module,exports){
var Torch = function(){

  	"use strict";

  	AFRAME.registerComponent('torch', {
	  	schema: {
	      light: {type: 'boolean', default:false},
        target: {type: 'string', default:null},
        event: {type: 'string', default:null},
        step: {type: 'int', default: 0}
	    },

  		init:function(){

  			var el = this.el;
  			var data = this.data;

  			var _light = data.light;
        var _target = data.target;
        var _event = data.event;
        var _step = data.step;

  			if (_light == true){

  				_light = '; light:true';
  			
  			}
  			else{
  			
  				_light = '';
  			
  			}

        if (_target != null){

          _target = '; target_to_activate: ' + _target;

        }
        else{

          _target = '';

        }

        if (_event != null){

          _event = '; event: ' + _event;

        }
        else{

          _event = '';

        }

        if (_step != null){

          _step = '; step: ' + _step;

        }
        else{

          _step = '';

        }

        var collider_entity = '<a-entity teleport="action:light_torch' + _light + _target + _event + _step + '" class="collidable" geometry="" material="transparent: true; opacity: 0 " position="0 0.45 0" scale="0.2 2.3 0.2" ></a-entity>'
  			var object = '<a-gltf-model src="#torch_model"></a-gltf-model>'
        //var object = '<a-entity gltf-model="src: url(../models/objects/torch.gltf);" ></a-entity>'
  			var light = '<a-light type="point" color="rgb(255, 169, 35)" intensity="0" distance="200" position="0 1.541 0"></a-light>'

  			el.innerHTML = collider_entity + object + light;

    	}

   	}); 

};

exports.generate = Torch;

},{}],6:[function(require,module,exports){
var Teleport = require('./components/teleport.js');
var Torch = require('./components/torch.js');
var Eyes = require('./components/eyes.js');
var TextHandler = require('./components/text_handler.js');
var Questbook = require('./components/questbook.js');

window.console.log('main.js')
Teleport.launch();	
Torch.generate();
Eyes.open_eyes();
TextHandler.init();
Questbook.init();
},{"./components/eyes.js":1,"./components/questbook.js":2,"./components/teleport.js":3,"./components/text_handler.js":4,"./components/torch.js":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9leWVzLmpzIiwic3JjL2NvbXBvbmVudHMvcXVlc3Rib29rLmpzIiwic3JjL2NvbXBvbmVudHMvdGVsZXBvcnQuanMiLCJzcmMvY29tcG9uZW50cy90ZXh0X2hhbmRsZXIuanMiLCJzcmMvY29tcG9uZW50cy90b3JjaC5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ2YXIgRXllcz0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdleWVzJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgICAgdGFyZ2V0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgb2Zmc2V0X3lfYXhpcyA9IDA7XG4gICAgICAgIHZhciBwcmV2aW91c19vZmZzZXRfeV9heGlzID0gMDtcbiAgICAgICAgdmFyIGRlY3JlYXNpbmcgPSAwLjAxXG4gICAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrX3NjcmVlblwiKTtcbiAgICAgICAgLy9ibGFja19zY3JlZW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7IFxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuICAgICAgICAgIHZhciB0aW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgICAgIHZhciByb3RhdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXInKS5nZXRBdHRyaWJ1dGUoJ3JvdGF0aW9uJyk7XG4gICAgICAgICAgICBvZmZzZXRfeV9heGlzICs9IChNYXRoLmFicyhyb3RhdGlvbi55IC0gcHJldmlvdXNfb2Zmc2V0X3lfYXhpcykgLyAyMDApO1xuICAgICAgICAgICAgcHJldmlvdXNfb2Zmc2V0X3lfYXhpcyA9IHJvdGF0aW9uLnk7XG5cbiAgICAgICAgICAgIGlmKG9mZnNldF95X2F4aXMgPiAxKXtcblxuICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aW1lcik7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG9mZnNldF95X2F4aXMgPiAwKXtcblxuICAgICAgICAgICAgICBvZmZzZXRfeV9heGlzIC09IGRlY3JlYXNpbmc7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgb2Zmc2V0X3lfYXhpcyA9IDBcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBibGFja19zY3JlZW4uc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgMSAtIG9mZnNldF95X2F4aXMpO1xuXG4gICAgICAgICAgfSwgMTApO1xuICAgICAgICB9KTtcblxuICAgICAgfVxuXG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLm9wZW5fZXllcyA9IEV5ZXM7IiwidmFyIFF1ZXN0Ym9vaz0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdxdWVzdGJvb2snLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgIHN0ZXA6IHtzdGVwOidpbnQnLCBkZWZhdWx0OjB9XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKCdRVUVTVEJPT0snKTtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG5cbiAgICAgICAgdmFyIHRleHRfZGlzcGxheWVkID0gZmFsc2U7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3F1ZXN0Ym9vayBsYXVuY2hlZCcpO1xuICAgICAgICB2YXIgdGV4dF9oYW5kbGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RleHRfaGFuZGxlcicpO1xuICAgICAgICBjb25zb2xlLmxvZyh0ZXh0X2hhbmRsZXIpO1xuXG4gICAgICAgIGVsLnNjZW5lRWwuYWRkRXZlbnRMaXN0ZW5lcigncGFzc19zdGVwJywgcGFzc19zdGVwKTtcblxuICAgICAgICBmdW5jdGlvbiBwYXNzX3N0ZXAoc3RlcF9zdHJpbmcpe1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ1BBU1MgU1RFUCcpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHRleHRfZGlzcGxheWVkKTtcbiAgICAgICAgICBjb25zb2xlLmxvZ1xuXG4gICAgICAgICAgaWYgKHRleHRfZGlzcGxheWVkID09IGZhbHNlKXtcblxuICAgICAgICAgICAgdGV4dF9kaXNwbGF5ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mKHN0ZXBfc3RyaW5nKSAhPSAnc3RyaW5nJyl7XG5cbiAgICAgICAgICAgICAgdmFyIHN0ZXAgPSBwYXJzZUludChzdGVwX3N0cmluZy5kZXRhaWwpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgIHZhciBzdGVwID0gc3RlcF9zdHJpbmc7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0ZXAgPT0gMCl7XG5cbiAgICAgICAgICAgICAgdmFyIG5ld19zdGVwID0gZWwuZ2V0QXR0cmlidXRlKCdxdWVzdGJvb2snLCAnc3RlcCcpLnN0ZXAgKyAxXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgdmFyIG5ld19zdGVwID0gc3RlcFxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld19zdGVwKVxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdxdWVzdGJvb2snLCAnc3RlcCcsIG5ld19zdGVwKTtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gbG9hZF90ZXh0KG5ld19zdGVwKTtcblxuICAgICAgICAgICAgaWYgKHRleHQgIT0gJyEhRU5EJyl7XG5cbiAgICAgICAgICAgICAgZWwuZW1pdCgnZGlzcGxheV90ZXh0JywgdGV4dCk7XG5cbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgdGV4dF9kaXNwbGF5ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBwYXNzX3N0ZXAoJzAnKTsgIFxuXG4gICAgICAgICAgICAgIH0sIDYwMDApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRfdGV4dChzdGVwKXtcblxuICAgICAgICAgIHN3aXRjaChzdGVwKXtcblxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICByZXR1cm4gJ3Rlc3QnO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICByZXR1cm4gJ3Rlc3QyJztcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAnISFFTkQnO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgfSxcblxuICAgIFxuICAgICAgdGVzdF9mdW5jdGlvbjogZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3Rlc3Qgc3VjY2Vzc2Z1bGwgIScpO1xuICAgICAgfSxcblxuICAgICAgdXBkYXRlOiBmdW5jdGlvbihvbGREYXRhKXtcblxuICAgICAgfVxuXG5cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMuaW5pdCA9IFF1ZXN0Ym9vazsiLCJ2YXIgVGVsZXBvcnQ9IGZ1bmN0aW9uKCl7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZWxlcG9ydCcsIHtcbiAgICBkZXBlbmRlbmNpZXM6IFsncmF5Y2FzdGVyJ10sXG4gICAgc2NoZW1hOiB7XG4gICAgICB0YXJnZXQ6IHt0eXBlOiAndmVjMyd9LFxuICAgICAgYWN0aW9uOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbid9LFxuICAgICAgdGFyZ2V0X3RvX2FjdGl2YXRlOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICBldmVudDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LFxuICAgICAgZGlzYWJsZToge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICBzdGVwOiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6MH1cbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICAgIHZhciBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICB2YXIgZ2xvYmFsX3RpbWVyID0gMDtcblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcbiAgICAgIHRoaXMuZGF0YV90ZXN0ID0gdGhpcy5kYXRhXG4gICAgICBcbiAgICAgIHZhciBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVsZXBvcnRfbG9hZGVyJyk7XG4gICAgICB2YXIgYWN0aW9uX3RvX3BlcmZvcm0gPSBudWxsO1xuXG4gICAgICB2YXIgcXVlc3Rib29rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0Ym9vaycpXG5cbiAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnKXtcblxuICAgICAgICB2YXIgdGltZXJfYmxhY2tfc2NyZWVuID0gMDtcbiAgICAgICAgdmFyIHBsYXllciA9ICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllclwiKTtcbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxhY2tfc2NyZWVuXCIpO1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gdGVsZXBvcnRcblxuXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGludGVyYWN0XG5cbiAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdsaWdodF90b3JjaCcpe1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gbGlnaHRfdG9yY2hcblxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5saWdodCA9PSB0cnVlKXtcblxuICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKSk7XG5cbiAgICAgIH1cbiAgICAgIGVsc2V7XG5cbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWQpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZC1jbGVhcmVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQpOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpe1xuXG5cblxuICAgICAgICBpZiAoaXNJbnRlcnNlY3RpbmcgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcgJiYgKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgIT0gZGF0YS50YXJnZXQgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoKGRhdGEuYWN0aW9uID09ICdpbnRlcmFjdCcgfHwgZGF0YS5hY3Rpb24gPT0gXCJsaWdodF90b3JjaFwiKSAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfSBcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZXZlbnRfaGFuZGxlcigpe1xuXG4gICAgICAgIGlmIChkYXRhLmV2ZW50KXsgXG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnZXZlbnQgaGFuZGxlciBmcm9tIHRlbGVwb3J0Jyk7XG4gICAgICAgICAgLy9xdWVzdGJvb2suc2V0QXR0cmlidXRlKCdxdWVzdGJvb2snLCAnc3RlcCcsIDEwMCk7XG4gICAgICAgICAgY29uc29sZS5sb2cocXVlc3Rib29rKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhLnN0ZXApO1xuICAgICAgICAgIHZhciBzdGVwID0gZGF0YS5zdGVwLnRvU3RyaW5nKCk7XG4gICAgICAgICAgZWwuZW1pdCgncGFzc19zdGVwJywgc3RlcCk7IFxuXG4gICAgICAgIH1cblxuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiByYXljYXN0ZXJfaW50ZXJzZWN0ZWQoKXtcblxuICAgICAgICBpZiAoaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKSl7XG5cbiAgICAgICAgICBpc0ludGVyc2VjdGluZyA9IHRydWU7XG4gICAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICAgIGdsb2JhbF90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSgpIFxuICAgICAgICAgICAgICBldmVudF9oYW5kbGVyKCk7XG5cbiAgICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCl7XG5cbiAgICAgICAgaWYgKGdsb2JhbF90aW1lcil7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGdsb2JhbF90aW1lcik7XG4gICAgICAgICAgZ2xvYmFsX3RpbWVyPTA7XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgICAgIGlzSW50ZXJzZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW50ZXJhY3QoKXtcblxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ2dyZWVuJyk7XG4gICAgICAgIGRhdGEuZGlzYWJsZSA9IHRydWU7XG4gICAgICAgIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGVsZXBvcnQoKXtcblxuICAgICAgICBzaG93X2JsYWNrX3NjcmVlbigpXG4gICAgICAgIHNldFRpbWVvdXQoaGlkZV9ibGFja19zY3JlZW4sIDEwMDApOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG93X2JsYWNrX3NjcmVlbigpe1xuXG4gICAgICAgIHZhciBibGFja19zY3JlZW5fYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ29wYWNpdHknKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMVwiKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgYmxhY2tfc2NyZWVuLmFwcGVuZENoaWxkKGJsYWNrX3NjcmVlbl9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhpZGVfYmxhY2tfc2NyZWVuKCl7XG4gICAgICAgIFxuICAgICAgICBwbGF5ZXIuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIGRhdGEudGFyZ2V0ICk7XG4gICAgICAgIFxuICAgICAgICB2YXIgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdvcGFjaXR5Jyk7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMTAwMFwiKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMVwiKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjBcIik7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZWFzaW5nXCIsIFwibGluZWFyXCIpO1xuXG4gICAgICAgIGJsYWNrX3NjcmVlbi5hcHBlbmRDaGlsZChibGFja19zY3JlZW5fYW5pbWF0aW9uKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbih0YXJnZXQpe1xuXG4gICAgICAgIHZhciBsaWdodF9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdpbnRlbnNpdHknKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMS42XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZWFzaW5nXCIsIFwibGluZWFyXCIpO1xuXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaWdodF9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMzAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIxLjhcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjIuNVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImRpcmVjdGlvblwiLCBcImFsdGVybmF0ZVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImVhc2UtaW4tb3V0LWVsYXN0aWNcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJyZXBlYXRcIiwgXCJpbmRlZmluaXRlXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcImZvcndhcmRzXCIpO1xuXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaWdodF9hbmltYXRpb24pO1xuXG4gICAgICB9XG4gXG4gICAgICBmdW5jdGlvbiBsaWdodF90b3JjaCggKXtcblxuICAgICAgICBpbnRlcmFjdChkYXRhKTtcblxuICAgICAgICBpZiAoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUgIT0gbnVsbCkge1xuXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUpLnNldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAnZGlzYWJsZScsIGZhbHNlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxpZ2h0X29iamVjdCA9IGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpO1xuICAgICAgICBcbiAgICAgICAgY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24obGlnaHRfb2JqZWN0KVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBsaWdodF9vYmplY3QucmVtb3ZlQ2hpbGQobGlnaHRfb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoJ2EtYW5pbWF0aW9uJykpO1xuICAgICAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQobGlnaHRfb2JqZWN0KVxuXG4gICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgIH0sIFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpe1xuXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIH0sXG5cblxuICAgIGludGVyc2VjdEhhbmRsZXI6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIFxuICAgIH0sXG5cbiAgICBpbnRlcnNlY3RSZW1vdmFsSGFuZGxlcjogZnVuY3Rpb24oKXtcblxuXG5cbiAgICB9LFxuXG5cbiAgICB0ZWxlcG9ydENoYXJhY3RlcjogZnVuY3Rpb24oZWwsIHBsYXllcil7XG5cblxuICAgIH1cblxuICB9KTsgXG5cbn07XG5cbmV4cG9ydHMubGF1bmNoID0gVGVsZXBvcnQ7IiwidmFyIFRleHRIYW5kbGVyID0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZXh0X2hhbmRsZXInLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgc3RlcDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OjB9LFxuICAgICAgICB0ZXh0X2xpc3Q6IHt0eXBlOiAnYXJyYXknLCBkZWZhdWx0OiBbXX1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsICAgICAgICBcblxuICAgICAgICBjb25zb2xlLmxvZygnaW5pdCB0ZXh0Jyk7XG4gICAgICAgIC8vdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAndmFsdWUnLCB0aGlzLnRleHRfZGlzcGxheWVyKHRoaXMuZGF0YS5zdGVwKSk7XG4gICAgICAgIC8vXG4gICAgICAgIFxuICAgICAgICBlbC5zY2VuZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc3BsYXlfdGV4dCcsIGRpc3BsYXlfdGV4dCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZGlzcGxheV90ZXh0KHRleHQpe1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ0FSR19URVNUJyk7XG4gICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG5cbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAndmFsdWUnLCB0ZXh0LmRldGFpbCk7XG5cbiAgICAgICAgICB2YXIgdGV4dF9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ3RleHQub3BhY2l0eScpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCAzMDAwKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMFwiKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjFcIik7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZGlyZWN0aW9uXCIsIFwiYWx0ZXJuYXRlXCIpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInJlcGVhdFwiLCAxKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJlYXNlLW91dC1leHBvXCIpO1xuXG4gICAgICAgICAgZWwuYXBwZW5kQ2hpbGQodGV4dF9hbmltYXRpb24pO1xuXG4gICAgICAgIH1cblxuICBcdFx0fSxcblxuICAgICAgdGV4dF9kaXNwbGF5ZXI6IGZ1bmN0aW9uKHN0ZXApe1xuXG4gICAgICAgIHZhciB0ZXh0X3RvX3JldHVybiA9ICcnXG4gICAgICAgIHN3aXRjaChzdGVwKXtcblxuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHRleHRfdG9fcmV0dXJuID0gdGhpcy50ZXh0X2xpc3RbMF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHRleHRfdG9fcmV0dXJuID0gdGhpcy50ZXh0X2xpc3RbMV07XG4gICAgICAgICAgICBicmVhazsgIFxuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRleHRfdG9fcmV0dXJuID0gJyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGV4dF90b19yZXR1cm5cblxuICAgICAgfSxcblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMuaW5pdCA9IFRleHRIYW5kbGVyO1xuIiwidmFyIFRvcmNoID0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0b3JjaCcsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICAgIHRhcmdldDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LFxuICAgICAgICBldmVudDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LFxuICAgICAgICBzdGVwOiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6IDB9XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgXHRcdFx0dmFyIGVsID0gdGhpcy5lbDtcbiAgXHRcdFx0dmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgXHRcdFx0dmFyIF9saWdodCA9IGRhdGEubGlnaHQ7XG4gICAgICAgIHZhciBfdGFyZ2V0ID0gZGF0YS50YXJnZXQ7XG4gICAgICAgIHZhciBfZXZlbnQgPSBkYXRhLmV2ZW50O1xuICAgICAgICB2YXIgX3N0ZXAgPSBkYXRhLnN0ZXA7XG5cbiAgXHRcdFx0aWYgKF9saWdodCA9PSB0cnVlKXtcblxuICBcdFx0XHRcdF9saWdodCA9ICc7IGxpZ2h0OnRydWUnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuICBcdFx0XHRlbHNle1xuICBcdFx0XHRcbiAgXHRcdFx0XHRfbGlnaHQgPSAnJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cblxuICAgICAgICBpZiAoX3RhcmdldCAhPSBudWxsKXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnOyB0YXJnZXRfdG9fYWN0aXZhdGU6ICcgKyBfdGFyZ2V0O1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9ldmVudCAhPSBudWxsKXtcblxuICAgICAgICAgIF9ldmVudCA9ICc7IGV2ZW50OiAnICsgX2V2ZW50O1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF9ldmVudCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3N0ZXAgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfc3RlcCA9ICc7IHN0ZXA6ICcgKyBfc3RlcDtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfc3RlcCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29sbGlkZXJfZW50aXR5ID0gJzxhLWVudGl0eSB0ZWxlcG9ydD1cImFjdGlvbjpsaWdodF90b3JjaCcgKyBfbGlnaHQgKyBfdGFyZ2V0ICsgX2V2ZW50ICsgX3N0ZXAgKyAnXCIgY2xhc3M9XCJjb2xsaWRhYmxlXCIgZ2VvbWV0cnk9XCJcIiBtYXRlcmlhbD1cInRyYW5zcGFyZW50OiB0cnVlOyBvcGFjaXR5OiAwIFwiIHBvc2l0aW9uPVwiMCAwLjQ1IDBcIiBzY2FsZT1cIjAuMiAyLjMgMC4yXCIgPjwvYS1lbnRpdHk+J1xuICBcdFx0XHR2YXIgb2JqZWN0ID0gJzxhLWdsdGYtbW9kZWwgc3JjPVwiI3RvcmNoX21vZGVsXCI+PC9hLWdsdGYtbW9kZWw+J1xuICAgICAgICAvL3ZhciBvYmplY3QgPSAnPGEtZW50aXR5IGdsdGYtbW9kZWw9XCJzcmM6IHVybCguLi9tb2RlbHMvb2JqZWN0cy90b3JjaC5nbHRmKTtcIiA+PC9hLWVudGl0eT4nXG4gIFx0XHRcdHZhciBsaWdodCA9ICc8YS1saWdodCB0eXBlPVwicG9pbnRcIiBjb2xvcj1cInJnYigyNTUsIDE2OSwgMzUpXCIgaW50ZW5zaXR5PVwiMFwiIGRpc3RhbmNlPVwiMjAwXCIgcG9zaXRpb249XCIwIDEuNTQxIDBcIj48L2EtbGlnaHQ+J1xuXG4gIFx0XHRcdGVsLmlubmVySFRNTCA9IGNvbGxpZGVyX2VudGl0eSArIG9iamVjdCArIGxpZ2h0O1xuXG4gICAgXHR9XG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmdlbmVyYXRlID0gVG9yY2g7XG4iLCJ2YXIgVGVsZXBvcnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGVsZXBvcnQuanMnKTtcbnZhciBUb3JjaCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90b3JjaC5qcycpO1xudmFyIEV5ZXMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvZXllcy5qcycpO1xudmFyIFRleHRIYW5kbGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcycpO1xudmFyIFF1ZXN0Ym9vayA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9xdWVzdGJvb2suanMnKTtcblxud2luZG93LmNvbnNvbGUubG9nKCdtYWluLmpzJylcblRlbGVwb3J0LmxhdW5jaCgpO1x0XG5Ub3JjaC5nZW5lcmF0ZSgpO1xuRXllcy5vcGVuX2V5ZXMoKTtcblRleHRIYW5kbGVyLmluaXQoKTtcblF1ZXN0Ym9vay5pbml0KCk7Il19
