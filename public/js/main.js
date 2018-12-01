(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
var Interaction= function(){

  "use strict";

  AFRAME.registerComponent('interaction', {
    dependencies: ['raycaster'],
    schema: {
      target            : {type: 'vec3'},                   // Point location for teleport                                                                                                                                       
      action            : {type: 'string'},                 // Interaction type. Possible values : "teleport", "interact", "light_torch".                                                                                                                            
      light             : {type: 'boolean'},                // Create light animation if true                                                                                                                     
      target_to_activate: {type: 'string', default:null},   // List of teleport to activate if object is triggered. List of id separated by comma.                                                                                    
      event             : {type: 'string', default:null},   // Event to trigger if object is activated.                                                                                                                 
      disable           : {type: 'boolean', default:false}, // If true, block object interaction.                                                                                                                
      allowed           : {type: 'string', default:null},   // List of point from which the player can interact with the object. If null, interaction is possible from anywhere.                    
      step              : {type: 'int', default:0},         // If not empty, interaction will define the questbook to a specific step.                                                                                                                  
      message           : {type: 'string', default:null},   // Message to display when object is triggered.
      repeat            : {type: 'boolean', default:true},  // If false, action will not be triggered after first interaction.
      processing        : {type: 'boolean', default:false}  // Block multiple execution of script. Do not update this value !                                                                                                 
    },

    init: function () { 

      // Initialize important variables
      var el = this.el;
      var data = this.data

      var global_timer = 0;
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null;
      var player =  document.getElementById("player");
      var questbook = document.getElementById('questbook')

      var sphere_helper = '<a-sphere position="0 2 0" geometry="radius:0.1"></a-sphere>';
      var timer_black_screen = 0;
      var black_screen = document.getElementById("black_screen");

      action_to_perform = _detect_action_type(data.action)

      if (data.light == true){

        create_light_animation_repeat(el.parentNode.querySelector('a-light'));

      }
      else{

        this.el.addEventListener('raycaster-intersected', raycaster_intersected);
        this.el.addEventListener('raycaster-intersected-cleared', raycaster_intersected_cleared); 

      }

      /*
       * CHECKERS & HANDLERS
       */
      function _detect_action_type(action){

        if      (data.action == 'teleport'){    action_to_perform = teleport; }
        else if (data.action == 'interact'){    action_to_perform = interact; }
        else if (data.action == 'light_torch'){ action_to_perform = light_torch; }

        return action_to_perform

      }

      function _check_if_allowed(player_position){
        /**
         * Intermediate check function (called for teleport interaction type)
         * If allowed data is found, check if player can use teleporter by comparing player's position to all allowed tp's positions.
         * @param {vec3} [player_position] [Player position in space]
         */

        var value_to_return = false;

        if (data.allowed != null){
          var list_tp_allowed = data.allowed.split(',');

          list_tp_allowed.forEach(function(tp){
            if (player.getAttribute('position').x == document.getElementById(tp).getAttribute('teleport', 'target').target.x &&
                player.getAttribute('position').y == document.getElementById(tp).getAttribute('teleport', 'target').target.y &&
                player.getAttribute('position').z == document.getElementById(tp).getAttribute('teleport', 'target').target.z){
              
              value_to_return = true;

            }

          })

        }
        else{

          value_to_return = true;

        }
        
        return value_to_return

      }

      function _interaction_is_possible(){
        /**
         * Detect if interaction with current object is possible.
         * 1.   Check if general interaction is possible
         * 2.a. If interaction type is teleport and player position is different from object position, launch intermediate verification.
         * 2.b. If interaction type is different, juste check if interaction is enabled.
         */
        if (data.processing == false){
          var player_position = player.getAttribute('position')

          if (data.action == 'teleport' && 
            (player.getAttribute('position') != data.target && data.disable == false) &&
            _check_if_allowed()){

            return true

          }
          else if ((data.action == 'interact' || data.action == "light_torch") && data.disable == false){
            return true

          } 
        }
        return false

      }

      function _animation_mixin_handler(mixin_name, element){
        /**
         * Generate animation mixin for transitions and lights.
         * @param {string} [mixin_name] [Type of transition. Two values accepted : 
         *                               - "screen_hide" : progressively translate screen to black. 
         *                               - "screen_show" : progressively remove black screen.]
         */
        
        var animation = document.createElement('a-animation');
        animation.setAttribute("mixin", mixin_name);
        element.appendChild(animation);

      }

      function _event_handler(){

        if (data.event){ 

          var step = data.step.toString();
          el.emit('pass_step', step); 

        }

      }

      /*
       * RAYCASTING
       */
      
      function raycaster_intersected(){

        console.log('RAYCASTER INTERSECTED')

        if (_interaction_is_possible()){

          data.processing = true;

          loader.style.display = "block";
          
          requestAnimationFrame(function(timestamp){

            global_timer = setTimeout(function(){

              action_to_perform() 
              _event_handler();

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

        data.processing = false;

      }

      /*
       * ANIMATION HANDLERS
       */

      function hide_screen(){ _animation_mixin_handler('scene_hide', black_screen); }
      function show_screen(){ player.setAttribute('position', data.target ); _animation_mixin_handler('scene_show', black_screen); }
      function create_light_transition(target){ _animation_mixin_handler('create_light', target); }
      function create_light_animation_repeat(target){ _animation_mixin_handler('light_animation', target); }

      /*
       * CORE
       */
      function disable_future_interactions(){

        if (data.repeat == false){

          data.disable = true;
          raycaster_intersected_cleared();
        }

      }

      function activate_teleporters(){
        /**
         * Activate list of tps given by data.target_to_activate.
         */

        if (data.target_to_activate != null) {

          var list_tp_to_enable = data.target_to_activate.split(',');
          list_tp_to_enable.forEach(function(tp){

            document.getElementById(tp).setAttribute('teleport', 'disable', false);

          })

        }

      }

      function display_message(){

        console.log('DISPLAY MESSAGE');
        console.log(data.message);
        
        if (data.message != null){

          el.emit('display_text', data.message)
          loader.style.display = "none"

          setTimeout(function(){

            data.processing = false;

          }, 1000);

        } 
      }

      function teleport(){

        hide_screen();
        setTimeout(show_screen, 1000);
        display_message();

      }
 
      function interact(){
        disable_future_interactions();
        activate_teleporters();
        display_message();

      }

      function light_torch( ){

        interact();

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

    }

  }); 

};

exports.init = Interaction;

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
var TextHandler = function(){

  	"use strict";

  	AFRAME.registerComponent('text_handler', {
	  	schema: {
	      step: {type: 'int', default:0},
        text_list: {type: 'array', default: []}
	    },

  		init:function(){

        var el = this.el        
        el.sceneEl.addEventListener('display_text', display_text);

        function display_text(text){

          el.setAttribute('text', 'value', text.detail);
          var animation = document.createElement('a-animation');
          animation.setAttribute("mixin", 'text_animation');
          el.appendChild(animation);

        }

  		},

   	}); 

};

exports.init = TextHandler;

},{}],4:[function(require,module,exports){
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

        var collider_entity = '<a-entity teleport="action:light_torch' + _light + _target + _event + _step + '" class="collidable" geometry="" material="transparent: true; opacity: 0 " position="0 1.12 0" scale="1 2.5 1" ></a-entity>'
  			var object = '<a-gltf-model src="#torch_model"></a-gltf-model>'
        //var object = '<a-entity gltf-model="src: url(../models/objects/torch.gltf);" ></a-entity>'
  			var light = '<a-light type="point" color="rgb(255, 189, 105)" intensity="0" distance="40" position="-0.032 2.022 -0.16"></a-light>'

  			el.innerHTML = collider_entity + object + light;

    	}

   	}); 

};

exports.generate = Torch;

},{}],5:[function(require,module,exports){
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
},{"./components/interaction.js":1,"./components/questbook.js":2,"./components/text_handler.js":3,"./components/torch.js":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbnRlcmFjdGlvbi5qcyIsInNyYy9jb21wb25lbnRzL3F1ZXN0Ym9vay5qcyIsInNyYy9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsInZhciBJbnRlcmFjdGlvbj0gZnVuY3Rpb24oKXtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICBBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2ludGVyYWN0aW9uJywge1xuICAgIGRlcGVuZGVuY2llczogWydyYXljYXN0ZXInXSxcbiAgICBzY2hlbWE6IHtcbiAgICAgIHRhcmdldCAgICAgICAgICAgIDoge3R5cGU6ICd2ZWMzJ30sICAgICAgICAgICAgICAgICAgIC8vIFBvaW50IGxvY2F0aW9uIGZvciB0ZWxlcG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgYWN0aW9uICAgICAgICAgICAgOiB7dHlwZTogJ3N0cmluZyd9LCAgICAgICAgICAgICAgICAgLy8gSW50ZXJhY3Rpb24gdHlwZS4gUG9zc2libGUgdmFsdWVzIDogXCJ0ZWxlcG9ydFwiLCBcImludGVyYWN0XCIsIFwibGlnaHRfdG9yY2hcIi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBsaWdodCAgICAgICAgICAgICA6IHt0eXBlOiAnYm9vbGVhbid9LCAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbGlnaHQgYW5pbWF0aW9uIGlmIHRydWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHRhcmdldF90b19hY3RpdmF0ZToge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LCAgIC8vIExpc3Qgb2YgdGVsZXBvcnQgdG8gYWN0aXZhdGUgaWYgb2JqZWN0IGlzIHRyaWdnZXJlZC4gTGlzdCBvZiBpZCBzZXBhcmF0ZWQgYnkgY29tbWEuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBldmVudCAgICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSwgICAvLyBFdmVudCB0byB0cmlnZ2VyIGlmIG9iamVjdCBpcyBhY3RpdmF0ZWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGRpc2FibGUgICAgICAgICAgIDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sIC8vIElmIHRydWUsIGJsb2NrIG9iamVjdCBpbnRlcmFjdGlvbi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBhbGxvd2VkICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSwgICAvLyBMaXN0IG9mIHBvaW50IGZyb20gd2hpY2ggdGhlIHBsYXllciBjYW4gaW50ZXJhY3Qgd2l0aCB0aGUgb2JqZWN0LiBJZiBudWxsLCBpbnRlcmFjdGlvbiBpcyBwb3NzaWJsZSBmcm9tIGFueXdoZXJlLiAgICAgICAgICAgICAgICAgICAgXG4gICAgICBzdGVwICAgICAgICAgICAgICA6IHt0eXBlOiAnaW50JywgZGVmYXVsdDowfSwgICAgICAgICAvLyBJZiBub3QgZW1wdHksIGludGVyYWN0aW9uIHdpbGwgZGVmaW5lIHRoZSBxdWVzdGJvb2sgdG8gYSBzcGVjaWZpYyBzdGVwLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgbWVzc2FnZSAgICAgICAgICAgOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sICAgLy8gTWVzc2FnZSB0byBkaXNwbGF5IHdoZW4gb2JqZWN0IGlzIHRyaWdnZXJlZC5cbiAgICAgIHJlcGVhdCAgICAgICAgICAgIDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDp0cnVlfSwgIC8vIElmIGZhbHNlLCBhY3Rpb24gd2lsbCBub3QgYmUgdHJpZ2dlcmVkIGFmdGVyIGZpcnN0IGludGVyYWN0aW9uLlxuICAgICAgcHJvY2Vzc2luZyAgICAgICAgOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSAgLy8gQmxvY2sgbXVsdGlwbGUgZXhlY3V0aW9uIG9mIHNjcmlwdC4gRG8gbm90IHVwZGF0ZSB0aGlzIHZhbHVlICEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHsgXG5cbiAgICAgIC8vIEluaXRpYWxpemUgaW1wb3J0YW50IHZhcmlhYmxlc1xuICAgICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhXG5cbiAgICAgIHZhciBnbG9iYWxfdGltZXIgPSAwO1xuICAgICAgXG4gICAgICB2YXIgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbGVwb3J0X2xvYWRlcicpO1xuICAgICAgdmFyIGFjdGlvbl90b19wZXJmb3JtID0gbnVsbDtcbiAgICAgIHZhciBwbGF5ZXIgPSAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5ZXJcIik7XG4gICAgICB2YXIgcXVlc3Rib29rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1ZXN0Ym9vaycpXG5cbiAgICAgIHZhciBzcGhlcmVfaGVscGVyID0gJzxhLXNwaGVyZSBwb3NpdGlvbj1cIjAgMiAwXCIgZ2VvbWV0cnk9XCJyYWRpdXM6MC4xXCI+PC9hLXNwaGVyZT4nO1xuICAgICAgdmFyIHRpbWVyX2JsYWNrX3NjcmVlbiA9IDA7XG4gICAgICB2YXIgYmxhY2tfc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibGFja19zY3JlZW5cIik7XG5cbiAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gX2RldGVjdF9hY3Rpb25fdHlwZShkYXRhLmFjdGlvbilcblxuICAgICAgaWYgKGRhdGEubGlnaHQgPT0gdHJ1ZSl7XG5cbiAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQoZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0JykpO1xuXG4gICAgICB9XG4gICAgICBlbHNle1xuXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkKTtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQtY2xlYXJlZCcsIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKTsgXG5cbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqIENIRUNLRVJTICYgSEFORExFUlNcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gX2RldGVjdF9hY3Rpb25fdHlwZShhY3Rpb24pe1xuXG4gICAgICAgIGlmICAgICAgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcpeyAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IHRlbGVwb3J0OyB9XG4gICAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdpbnRlcmFjdCcpeyAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGludGVyYWN0OyB9XG4gICAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdsaWdodF90b3JjaCcpeyBhY3Rpb25fdG9fcGVyZm9ybSA9IGxpZ2h0X3RvcmNoOyB9XG5cbiAgICAgICAgcmV0dXJuIGFjdGlvbl90b19wZXJmb3JtXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2NoZWNrX2lmX2FsbG93ZWQocGxheWVyX3Bvc2l0aW9uKXtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludGVybWVkaWF0ZSBjaGVjayBmdW5jdGlvbiAoY2FsbGVkIGZvciB0ZWxlcG9ydCBpbnRlcmFjdGlvbiB0eXBlKVxuICAgICAgICAgKiBJZiBhbGxvd2VkIGRhdGEgaXMgZm91bmQsIGNoZWNrIGlmIHBsYXllciBjYW4gdXNlIHRlbGVwb3J0ZXIgYnkgY29tcGFyaW5nIHBsYXllcidzIHBvc2l0aW9uIHRvIGFsbCBhbGxvd2VkIHRwJ3MgcG9zaXRpb25zLlxuICAgICAgICAgKiBAcGFyYW0ge3ZlYzN9IFtwbGF5ZXJfcG9zaXRpb25dIFtQbGF5ZXIgcG9zaXRpb24gaW4gc3BhY2VdXG4gICAgICAgICAqL1xuXG4gICAgICAgIHZhciB2YWx1ZV90b19yZXR1cm4gPSBmYWxzZTtcblxuICAgICAgICBpZiAoZGF0YS5hbGxvd2VkICE9IG51bGwpe1xuICAgICAgICAgIHZhciBsaXN0X3RwX2FsbG93ZWQgPSBkYXRhLmFsbG93ZWQuc3BsaXQoJywnKTtcblxuICAgICAgICAgIGxpc3RfdHBfYWxsb3dlZC5mb3JFYWNoKGZ1bmN0aW9uKHRwKXtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLnggPT0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHApLmdldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAndGFyZ2V0JykudGFyZ2V0LnggJiZcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLnkgPT0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHApLmdldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAndGFyZ2V0JykudGFyZ2V0LnkgJiZcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLnogPT0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHApLmdldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAndGFyZ2V0JykudGFyZ2V0Lnope1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgdmFsdWVfdG9fcmV0dXJuID0gdHJ1ZTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSlcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICB2YWx1ZV90b19yZXR1cm4gPSB0cnVlO1xuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB2YWx1ZV90b19yZXR1cm5cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKXtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERldGVjdCBpZiBpbnRlcmFjdGlvbiB3aXRoIGN1cnJlbnQgb2JqZWN0IGlzIHBvc3NpYmxlLlxuICAgICAgICAgKiAxLiAgIENoZWNrIGlmIGdlbmVyYWwgaW50ZXJhY3Rpb24gaXMgcG9zc2libGVcbiAgICAgICAgICogMi5hLiBJZiBpbnRlcmFjdGlvbiB0eXBlIGlzIHRlbGVwb3J0IGFuZCBwbGF5ZXIgcG9zaXRpb24gaXMgZGlmZmVyZW50IGZyb20gb2JqZWN0IHBvc2l0aW9uLCBsYXVuY2ggaW50ZXJtZWRpYXRlIHZlcmlmaWNhdGlvbi5cbiAgICAgICAgICogMi5iLiBJZiBpbnRlcmFjdGlvbiB0eXBlIGlzIGRpZmZlcmVudCwganVzdGUgY2hlY2sgaWYgaW50ZXJhY3Rpb24gaXMgZW5hYmxlZC5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChkYXRhLnByb2Nlc3NpbmcgPT0gZmFsc2Upe1xuICAgICAgICAgIHZhciBwbGF5ZXJfcG9zaXRpb24gPSBwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpXG5cbiAgICAgICAgICBpZiAoZGF0YS5hY3Rpb24gPT0gJ3RlbGVwb3J0JyAmJiBcbiAgICAgICAgICAgIChwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpICE9IGRhdGEudGFyZ2V0ICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSkgJiZcbiAgICAgICAgICAgIF9jaGVja19pZl9hbGxvd2VkKCkpe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnIHx8IGRhdGEuYWN0aW9uID09IFwibGlnaHRfdG9yY2hcIikgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKXtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9hbmltYXRpb25fbWl4aW5faGFuZGxlcihtaXhpbl9uYW1lLCBlbGVtZW50KXtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdlbmVyYXRlIGFuaW1hdGlvbiBtaXhpbiBmb3IgdHJhbnNpdGlvbnMgYW5kIGxpZ2h0cy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFttaXhpbl9uYW1lXSBbVHlwZSBvZiB0cmFuc2l0aW9uLiBUd28gdmFsdWVzIGFjY2VwdGVkIDogXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gXCJzY3JlZW5faGlkZVwiIDogcHJvZ3Jlc3NpdmVseSB0cmFuc2xhdGUgc2NyZWVuIHRvIGJsYWNrLiBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBcInNjcmVlbl9zaG93XCIgOiBwcm9ncmVzc2l2ZWx5IHJlbW92ZSBibGFjayBzY3JlZW4uXVxuICAgICAgICAgKi9cbiAgICAgICAgXG4gICAgICAgIHZhciBhbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuICAgICAgICBhbmltYXRpb24uc2V0QXR0cmlidXRlKFwibWl4aW5cIiwgbWl4aW5fbmFtZSk7XG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoYW5pbWF0aW9uKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfZXZlbnRfaGFuZGxlcigpe1xuXG4gICAgICAgIGlmIChkYXRhLmV2ZW50KXsgXG5cbiAgICAgICAgICB2YXIgc3RlcCA9IGRhdGEuc3RlcC50b1N0cmluZygpO1xuICAgICAgICAgIGVsLmVtaXQoJ3Bhc3Nfc3RlcCcsIHN0ZXApOyBcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqIFJBWUNBU1RJTkdcbiAgICAgICAqL1xuICAgICAgXG4gICAgICBmdW5jdGlvbiByYXljYXN0ZXJfaW50ZXJzZWN0ZWQoKXtcblxuICAgICAgICBjb25zb2xlLmxvZygnUkFZQ0FTVEVSIElOVEVSU0VDVEVEJylcblxuICAgICAgICBpZiAoX2ludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCkpe1xuXG4gICAgICAgICAgZGF0YS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuICAgICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgIFxuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgICBnbG9iYWxfdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgYWN0aW9uX3RvX3BlcmZvcm0oKSBcbiAgICAgICAgICAgICAgX2V2ZW50X2hhbmRsZXIoKTtcblxuICAgICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKXtcblxuICAgICAgICBpZiAoZ2xvYmFsX3RpbWVyKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZ2xvYmFsX3RpbWVyKTtcbiAgICAgICAgICBnbG9iYWxfdGltZXI9MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcblxuICAgICAgICBkYXRhLnByb2Nlc3NpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICogQU5JTUFUSU9OIEhBTkRMRVJTXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gaGlkZV9zY3JlZW4oKXsgX2FuaW1hdGlvbl9taXhpbl9oYW5kbGVyKCdzY2VuZV9oaWRlJywgYmxhY2tfc2NyZWVuKTsgfVxuICAgICAgZnVuY3Rpb24gc2hvd19zY3JlZW4oKXsgcGxheWVyLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBkYXRhLnRhcmdldCApOyBfYW5pbWF0aW9uX21peGluX2hhbmRsZXIoJ3NjZW5lX3Nob3cnLCBibGFja19zY3JlZW4pOyB9XG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbih0YXJnZXQpeyBfYW5pbWF0aW9uX21peGluX2hhbmRsZXIoJ2NyZWF0ZV9saWdodCcsIHRhcmdldCk7IH1cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7IF9hbmltYXRpb25fbWl4aW5faGFuZGxlcignbGlnaHRfYW5pbWF0aW9uJywgdGFyZ2V0KTsgfVxuXG4gICAgICAvKlxuICAgICAgICogQ09SRVxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBkaXNhYmxlX2Z1dHVyZV9pbnRlcmFjdGlvbnMoKXtcblxuICAgICAgICBpZiAoZGF0YS5yZXBlYXQgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgZGF0YS5kaXNhYmxlID0gdHJ1ZTtcbiAgICAgICAgICByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCgpO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYWN0aXZhdGVfdGVsZXBvcnRlcnMoKXtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFjdGl2YXRlIGxpc3Qgb2YgdHBzIGdpdmVuIGJ5IGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlLlxuICAgICAgICAgKi9cblxuICAgICAgICBpZiAoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUgIT0gbnVsbCkge1xuXG4gICAgICAgICAgdmFyIGxpc3RfdHBfdG9fZW5hYmxlID0gZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUuc3BsaXQoJywnKTtcbiAgICAgICAgICBsaXN0X3RwX3RvX2VuYWJsZS5mb3JFYWNoKGZ1bmN0aW9uKHRwKXtcblxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHApLnNldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAnZGlzYWJsZScsIGZhbHNlKTtcblxuICAgICAgICAgIH0pXG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRpc3BsYXlfbWVzc2FnZSgpe1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdESVNQTEFZIE1FU1NBR0UnKTtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChkYXRhLm1lc3NhZ2UgIT0gbnVsbCl7XG5cbiAgICAgICAgICBlbC5lbWl0KCdkaXNwbGF5X3RleHQnLCBkYXRhLm1lc3NhZ2UpXG4gICAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBkYXRhLnByb2Nlc3NpbmcgPSBmYWxzZTtcblxuICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIH0gXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRlbGVwb3J0KCl7XG5cbiAgICAgICAgaGlkZV9zY3JlZW4oKTtcbiAgICAgICAgc2V0VGltZW91dChzaG93X3NjcmVlbiwgMTAwMCk7XG4gICAgICAgIGRpc3BsYXlfbWVzc2FnZSgpO1xuXG4gICAgICB9XG4gXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdCgpe1xuICAgICAgICBkaXNhYmxlX2Z1dHVyZV9pbnRlcmFjdGlvbnMoKTtcbiAgICAgICAgYWN0aXZhdGVfdGVsZXBvcnRlcnMoKTtcbiAgICAgICAgZGlzcGxheV9tZXNzYWdlKCk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbGlnaHRfdG9yY2goICl7XG5cbiAgICAgICAgaW50ZXJhY3QoKTtcblxuICAgICAgICB2YXIgbGlnaHRfb2JqZWN0ID0gZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0Jyk7XG4gICAgICAgIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKGxpZ2h0X29iamVjdClcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgbGlnaHRfb2JqZWN0LnJlbW92ZUNoaWxkKGxpZ2h0X29iamVjdC5xdWVyeVNlbGVjdG9yKCdhLWFuaW1hdGlvbicpKTtcbiAgICAgICAgICAgIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KGxpZ2h0X29iamVjdClcblxuICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cbiAgICB9LCBcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKXtcblxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB9XG5cbiAgfSk7IFxuXG59O1xuXG5leHBvcnRzLmluaXQgPSBJbnRlcmFjdGlvbjtcbiIsInZhciBRdWVzdGJvb2s9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgncXVlc3Rib29rJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgICBzdGVwOiB7c3RlcDonaW50JywgZGVmYXVsdDowfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICBjb25zb2xlLmxvZygnUVVFU1RCT09LJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgICAgIHZhciB0ZXh0X2Rpc3BsYXllZCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdxdWVzdGJvb2sgbGF1bmNoZWQnKTtcbiAgICAgICAgdmFyIHRleHRfaGFuZGxlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXh0X2hhbmRsZXInKTtcbiAgICAgICAgY29uc29sZS5sb2codGV4dF9oYW5kbGVyKTtcblxuICAgICAgICBlbC5zY2VuZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Bhc3Nfc3RlcCcsIHBhc3Nfc3RlcCk7XG5cbiAgICAgICAgZnVuY3Rpb24gcGFzc19zdGVwKHN0ZXBfc3RyaW5nKXtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQQVNTIFNURVAnKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0X2Rpc3BsYXllZCk7XG4gICAgICAgICAgY29uc29sZS5sb2dcblxuICAgICAgICAgIGlmICh0ZXh0X2Rpc3BsYXllZCA9PSBmYWxzZSl7XG5cbiAgICAgICAgICAgIHRleHRfZGlzcGxheWVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZihzdGVwX3N0cmluZykgIT0gJ3N0cmluZycpe1xuXG4gICAgICAgICAgICAgIHZhciBzdGVwID0gcGFyc2VJbnQoc3RlcF9zdHJpbmcuZGV0YWlsKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICB2YXIgc3RlcCA9IHN0ZXBfc3RyaW5nO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGVwID09IDApe1xuXG4gICAgICAgICAgICAgIHZhciBuZXdfc3RlcCA9IGVsLmdldEF0dHJpYnV0ZSgncXVlc3Rib29rJywgJ3N0ZXAnKS5zdGVwICsgMVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgIHZhciBuZXdfc3RlcCA9IHN0ZXBcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdfc3RlcClcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgncXVlc3Rib29rJywgJ3N0ZXAnLCBuZXdfc3RlcCk7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGxvYWRfdGV4dChuZXdfc3RlcCk7XG5cbiAgICAgICAgICAgIGlmICh0ZXh0ICE9ICchIUVORCcpe1xuXG4gICAgICAgICAgICAgIGVsLmVtaXQoJ2Rpc3BsYXlfdGV4dCcsIHRleHQpO1xuXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgIHRleHRfZGlzcGxheWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcGFzc19zdGVwKCcwJyk7ICBcblxuICAgICAgICAgICAgICB9LCA2MDAwKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBsb2FkX3RleHQoc3RlcCl7XG5cbiAgICAgICAgICBzd2l0Y2goc3RlcCl7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgcmV0dXJuICd0ZXN0JztcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgcmV0dXJuICd0ZXN0Mic7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJyEhRU5EJztcblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgIH0sXG5cbiAgICBcbiAgICAgIHRlc3RfZnVuY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0IHN1Y2Nlc3NmdWxsICEnKTtcbiAgICAgIH0sXG5cbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24ob2xkRGF0YSl7XG5cbiAgICAgIH1cblxuXG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmluaXQgPSBRdWVzdGJvb2s7IiwidmFyIFRleHRIYW5kbGVyID0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZXh0X2hhbmRsZXInLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgc3RlcDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OjB9LFxuICAgICAgICB0ZXh0X2xpc3Q6IHt0eXBlOiAnYXJyYXknLCBkZWZhdWx0OiBbXX1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsICAgICAgICBcbiAgICAgICAgZWwuc2NlbmVFbC5hZGRFdmVudExpc3RlbmVyKCdkaXNwbGF5X3RleHQnLCBkaXNwbGF5X3RleHQpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRpc3BsYXlfdGV4dCh0ZXh0KXtcblxuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgndGV4dCcsICd2YWx1ZScsIHRleHQuZGV0YWlsKTtcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcbiAgICAgICAgICBhbmltYXRpb24uc2V0QXR0cmlidXRlKFwibWl4aW5cIiwgJ3RleHRfYW5pbWF0aW9uJyk7XG4gICAgICAgICAgZWwuYXBwZW5kQ2hpbGQoYW5pbWF0aW9uKTtcblxuICAgICAgICB9XG5cbiAgXHRcdH0sXG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmluaXQgPSBUZXh0SGFuZGxlcjtcbiIsInZhciBUb3JjaCA9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndG9yY2gnLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9LFxuICAgICAgICB0YXJnZXQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSxcbiAgICAgICAgZXZlbnQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSxcbiAgICAgICAgc3RlcDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OiAwfVxuXG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgXHRcdFx0dmFyIGVsID0gdGhpcy5lbDtcbiAgXHRcdFx0dmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgXHRcdFx0dmFyIF9saWdodCA9IGRhdGEubGlnaHQ7XG4gICAgICAgIHZhciBfdGFyZ2V0ID0gZGF0YS50YXJnZXQ7XG4gICAgICAgIHZhciBfZXZlbnQgPSBkYXRhLmV2ZW50O1xuICAgICAgICB2YXIgX3N0ZXAgPSBkYXRhLnN0ZXA7XG5cbiAgXHRcdFx0aWYgKF9saWdodCA9PSB0cnVlKXtcblxuICBcdFx0XHRcdF9saWdodCA9ICc7IGxpZ2h0OnRydWUnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuICBcdFx0XHRlbHNle1xuICBcdFx0XHRcbiAgXHRcdFx0XHRfbGlnaHQgPSAnJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cblxuICAgICAgICBpZiAoX3RhcmdldCAhPSBudWxsKXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnOyB0YXJnZXRfdG9fYWN0aXZhdGU6ICcgKyBfdGFyZ2V0O1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9ldmVudCAhPSBudWxsKXtcblxuICAgICAgICAgIF9ldmVudCA9ICc7IGV2ZW50OiAnICsgX2V2ZW50O1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF9ldmVudCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3N0ZXAgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfc3RlcCA9ICc7IHN0ZXA6ICcgKyBfc3RlcDtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfc3RlcCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29sbGlkZXJfZW50aXR5ID0gJzxhLWVudGl0eSB0ZWxlcG9ydD1cImFjdGlvbjpsaWdodF90b3JjaCcgKyBfbGlnaHQgKyBfdGFyZ2V0ICsgX2V2ZW50ICsgX3N0ZXAgKyAnXCIgY2xhc3M9XCJjb2xsaWRhYmxlXCIgZ2VvbWV0cnk9XCJcIiBtYXRlcmlhbD1cInRyYW5zcGFyZW50OiB0cnVlOyBvcGFjaXR5OiAwIFwiIHBvc2l0aW9uPVwiMCAxLjEyIDBcIiBzY2FsZT1cIjEgMi41IDFcIiA+PC9hLWVudGl0eT4nXG4gIFx0XHRcdHZhciBvYmplY3QgPSAnPGEtZ2x0Zi1tb2RlbCBzcmM9XCIjdG9yY2hfbW9kZWxcIj48L2EtZ2x0Zi1tb2RlbD4nXG4gICAgICAgIC8vdmFyIG9iamVjdCA9ICc8YS1lbnRpdHkgZ2x0Zi1tb2RlbD1cInNyYzogdXJsKC4uL21vZGVscy9vYmplY3RzL3RvcmNoLmdsdGYpO1wiID48L2EtZW50aXR5PidcbiAgXHRcdFx0dmFyIGxpZ2h0ID0gJzxhLWxpZ2h0IHR5cGU9XCJwb2ludFwiIGNvbG9yPVwicmdiKDI1NSwgMTg5LCAxMDUpXCIgaW50ZW5zaXR5PVwiMFwiIGRpc3RhbmNlPVwiNDBcIiBwb3NpdGlvbj1cIi0wLjAzMiAyLjAyMiAtMC4xNlwiPjwvYS1saWdodD4nXG5cbiAgXHRcdFx0ZWwuaW5uZXJIVE1MID0gY29sbGlkZXJfZW50aXR5ICsgb2JqZWN0ICsgbGlnaHQ7XG5cbiAgICBcdH1cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMuZ2VuZXJhdGUgPSBUb3JjaDtcbiIsInZhciBJbnRlcmFjdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9pbnRlcmFjdGlvbi5qcycpO1xudmFyIFRvcmNoID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RvcmNoLmpzJyk7XG4vL3ZhciBFeWVzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2V5ZXMuanMnKTtcbnZhciBUZXh0SGFuZGxlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZXh0X2hhbmRsZXIuanMnKTtcbnZhciBRdWVzdGJvb2sgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcXVlc3Rib29rLmpzJyk7XG5cbndpbmRvdy5jb25zb2xlLmxvZygnbWFpbi5qcycpXG5JbnRlcmFjdGlvbi5pbml0KCk7XHRcblRvcmNoLmdlbmVyYXRlKCk7XG4vL0V5ZXMub3Blbl9leWVzKCk7XG5UZXh0SGFuZGxlci5pbml0KCk7XG5RdWVzdGJvb2suaW5pdCgpOyJdfQ==
