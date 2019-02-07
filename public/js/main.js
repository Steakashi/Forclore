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
      delete            : {type: 'boolean', default:false}, // If true, delete object after triggered.
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

          if (data.delete){ entity.parentNode.removeChild(entity); }
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

        console.log('DISPLAY MESSAGE lol');
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

          var animation_found = document.getElementById('text_animation_id');
          if (animation_found){
            animation_found.parentNode.removeChild(animation_found)
          }

          el.setAttribute('text', 'value', text.detail);
          var animation = document.createElement('a-animation');
          animation.setAttribute("mixin", 'text_animation');
          animation.setAttribute("id", 'text_animation_id');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbnRlcmFjdGlvbi5qcyIsInNyYy9jb21wb25lbnRzL3F1ZXN0Ym9vay5qcyIsInNyYy9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsInZhciBJbnRlcmFjdGlvbj0gZnVuY3Rpb24oKXtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICBBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2ludGVyYWN0aW9uJywge1xuICAgIGRlcGVuZGVuY2llczogWydyYXljYXN0ZXInXSxcbiAgICBzY2hlbWE6IHtcbiAgICAgIHRhcmdldCAgICAgICAgICAgIDoge3R5cGU6ICd2ZWMzJ30sICAgICAgICAgICAgICAgICAgIC8vIFBvaW50IGxvY2F0aW9uIGZvciB0ZWxlcG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgYWN0aW9uICAgICAgICAgICAgOiB7dHlwZTogJ3N0cmluZyd9LCAgICAgICAgICAgICAgICAgLy8gSW50ZXJhY3Rpb24gdHlwZS4gUG9zc2libGUgdmFsdWVzIDogXCJ0ZWxlcG9ydFwiLCBcImludGVyYWN0XCIsIFwibGlnaHRfdG9yY2hcIi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBsaWdodCAgICAgICAgICAgICA6IHt0eXBlOiAnYm9vbGVhbid9LCAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbGlnaHQgYW5pbWF0aW9uIGlmIHRydWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHRhcmdldF90b19hY3RpdmF0ZToge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LCAgIC8vIExpc3Qgb2YgdGVsZXBvcnQgdG8gYWN0aXZhdGUgaWYgb2JqZWN0IGlzIHRyaWdnZXJlZC4gTGlzdCBvZiBpZCBzZXBhcmF0ZWQgYnkgY29tbWEuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBldmVudCAgICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSwgICAvLyBFdmVudCB0byB0cmlnZ2VyIGlmIG9iamVjdCBpcyBhY3RpdmF0ZWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGRpc2FibGUgICAgICAgICAgIDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sIC8vIElmIHRydWUsIGJsb2NrIG9iamVjdCBpbnRlcmFjdGlvbi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBhbGxvd2VkICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSwgICAvLyBMaXN0IG9mIHBvaW50IGZyb20gd2hpY2ggdGhlIHBsYXllciBjYW4gaW50ZXJhY3Qgd2l0aCB0aGUgb2JqZWN0LiBJZiBudWxsLCBpbnRlcmFjdGlvbiBpcyBwb3NzaWJsZSBmcm9tIGFueXdoZXJlLiAgICAgICAgICAgICAgICAgICAgXG4gICAgICBzdGVwICAgICAgICAgICAgICA6IHt0eXBlOiAnaW50JywgZGVmYXVsdDowfSwgICAgICAgICAvLyBJZiBub3QgZW1wdHksIGludGVyYWN0aW9uIHdpbGwgZGVmaW5lIHRoZSBxdWVzdGJvb2sgdG8gYSBzcGVjaWZpYyBzdGVwLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgbWVzc2FnZSAgICAgICAgICAgOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sICAgLy8gTWVzc2FnZSB0byBkaXNwbGF5IHdoZW4gb2JqZWN0IGlzIHRyaWdnZXJlZC5cbiAgICAgIHJlcGVhdCAgICAgICAgICAgIDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDp0cnVlfSwgIC8vIElmIGZhbHNlLCBhY3Rpb24gd2lsbCBub3QgYmUgdHJpZ2dlcmVkIGFmdGVyIGZpcnN0IGludGVyYWN0aW9uLlxuICAgICAgZGVsZXRlICAgICAgICAgICAgOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSwgLy8gSWYgdHJ1ZSwgZGVsZXRlIG9iamVjdCBhZnRlciB0cmlnZ2VyZWQuXG4gICAgICBwcm9jZXNzaW5nICAgICAgICA6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9ICAvLyBCbG9jayBtdWx0aXBsZSBleGVjdXRpb24gb2Ygc2NyaXB0LiBEbyBub3QgdXBkYXRlIHRoaXMgdmFsdWUgISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkgeyBcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBpbXBvcnRhbnQgdmFyaWFibGVzXG4gICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcblxuICAgICAgdmFyIGdsb2JhbF90aW1lciA9IDA7XG4gICAgICBcbiAgICAgIHZhciBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVsZXBvcnRfbG9hZGVyJyk7XG4gICAgICB2YXIgYWN0aW9uX3RvX3BlcmZvcm0gPSBudWxsO1xuICAgICAgdmFyIHBsYXllciA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYXllclwiKTtcbiAgICAgIHZhciBxdWVzdGJvb2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVlc3Rib29rJylcblxuICAgICAgdmFyIHNwaGVyZV9oZWxwZXIgPSAnPGEtc3BoZXJlIHBvc2l0aW9uPVwiMCAyIDBcIiBnZW9tZXRyeT1cInJhZGl1czowLjFcIj48L2Etc3BoZXJlPic7XG4gICAgICB2YXIgdGltZXJfYmxhY2tfc2NyZWVuID0gMDtcbiAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrX3NjcmVlblwiKTtcblxuICAgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBfZGV0ZWN0X2FjdGlvbl90eXBlKGRhdGEuYWN0aW9uKVxuXG4gICAgICBpZiAoZGF0YS5saWdodCA9PSB0cnVlKXtcblxuICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKSk7XG5cbiAgICAgIH1cbiAgICAgIGVsc2V7XG5cbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWQpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZC1jbGVhcmVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQpOyBcblxuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICogQ0hFQ0tFUlMgJiBIQU5ETEVSU1xuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBfZGV0ZWN0X2FjdGlvbl90eXBlKGFjdGlvbil7XG5cbiAgICAgICAgaWYgICAgICAoZGF0YS5hY3Rpb24gPT0gJ3RlbGVwb3J0Jyl7ICAgIGFjdGlvbl90b19wZXJmb3JtID0gdGVsZXBvcnQ7IH1cbiAgICAgICAgZWxzZSBpZiAoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0Jyl7ICAgIGFjdGlvbl90b19wZXJmb3JtID0gaW50ZXJhY3Q7IH1cbiAgICAgICAgZWxzZSBpZiAoZGF0YS5hY3Rpb24gPT0gJ2xpZ2h0X3RvcmNoJyl7IGFjdGlvbl90b19wZXJmb3JtID0gbGlnaHRfdG9yY2g7IH1cblxuICAgICAgICByZXR1cm4gYWN0aW9uX3RvX3BlcmZvcm1cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfY2hlY2tfaWZfYWxsb3dlZChwbGF5ZXJfcG9zaXRpb24pe1xuICAgICAgICAvKipcbiAgICAgICAgICogSW50ZXJtZWRpYXRlIGNoZWNrIGZ1bmN0aW9uIChjYWxsZWQgZm9yIHRlbGVwb3J0IGludGVyYWN0aW9uIHR5cGUpXG4gICAgICAgICAqIElmIGFsbG93ZWQgZGF0YSBpcyBmb3VuZCwgY2hlY2sgaWYgcGxheWVyIGNhbiB1c2UgdGVsZXBvcnRlciBieSBjb21wYXJpbmcgcGxheWVyJ3MgcG9zaXRpb24gdG8gYWxsIGFsbG93ZWQgdHAncyBwb3NpdGlvbnMuXG4gICAgICAgICAqIEBwYXJhbSB7dmVjM30gW3BsYXllcl9wb3NpdGlvbl0gW1BsYXllciBwb3NpdGlvbiBpbiBzcGFjZV1cbiAgICAgICAgICovXG5cbiAgICAgICAgdmFyIHZhbHVlX3RvX3JldHVybiA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChkYXRhLmFsbG93ZWQgIT0gbnVsbCl7XG4gICAgICAgICAgdmFyIGxpc3RfdHBfYWxsb3dlZCA9IGRhdGEuYWxsb3dlZC5zcGxpdCgnLCcpO1xuXG4gICAgICAgICAgbGlzdF90cF9hbGxvd2VkLmZvckVhY2goZnVuY3Rpb24odHApe1xuICAgICAgICAgICAgaWYgKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykueCA9PSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0cCkuZ2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICd0YXJnZXQnKS50YXJnZXQueCAmJlxuICAgICAgICAgICAgICAgIHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykueSA9PSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0cCkuZ2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICd0YXJnZXQnKS50YXJnZXQueSAmJlxuICAgICAgICAgICAgICAgIHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykueiA9PSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0cCkuZ2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICd0YXJnZXQnKS50YXJnZXQueil7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB2YWx1ZV90b19yZXR1cm4gPSB0cnVlO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIHZhbHVlX3RvX3JldHVybiA9IHRydWU7XG5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHZhbHVlX3RvX3JldHVyblxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9pbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpe1xuICAgICAgICAvKipcbiAgICAgICAgICogRGV0ZWN0IGlmIGludGVyYWN0aW9uIHdpdGggY3VycmVudCBvYmplY3QgaXMgcG9zc2libGUuXG4gICAgICAgICAqIDEuICAgQ2hlY2sgaWYgZ2VuZXJhbCBpbnRlcmFjdGlvbiBpcyBwb3NzaWJsZVxuICAgICAgICAgKiAyLmEuIElmIGludGVyYWN0aW9uIHR5cGUgaXMgdGVsZXBvcnQgYW5kIHBsYXllciBwb3NpdGlvbiBpcyBkaWZmZXJlbnQgZnJvbSBvYmplY3QgcG9zaXRpb24sIGxhdW5jaCBpbnRlcm1lZGlhdGUgdmVyaWZpY2F0aW9uLlxuICAgICAgICAgKiAyLmIuIElmIGludGVyYWN0aW9uIHR5cGUgaXMgZGlmZmVyZW50LCBqdXN0ZSBjaGVjayBpZiBpbnRlcmFjdGlvbiBpcyBlbmFibGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKGRhdGEucHJvY2Vzc2luZyA9PSBmYWxzZSl7XG4gICAgICAgICAgdmFyIHBsYXllcl9wb3NpdGlvbiA9IHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJylcblxuICAgICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnICYmIFxuICAgICAgICAgICAgKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgIT0gZGF0YS50YXJnZXQgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKSAmJlxuICAgICAgICAgICAgX2NoZWNrX2lmX2FsbG93ZWQoKSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoKGRhdGEuYWN0aW9uID09ICdpbnRlcmFjdCcgfHwgZGF0YS5hY3Rpb24gPT0gXCJsaWdodF90b3JjaFwiKSAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2Upe1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2FuaW1hdGlvbl9taXhpbl9oYW5kbGVyKG1peGluX25hbWUsIGVsZW1lbnQpe1xuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhdGUgYW5pbWF0aW9uIG1peGluIGZvciB0cmFuc2l0aW9ucyBhbmQgbGlnaHRzLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW21peGluX25hbWVdIFtUeXBlIG9mIHRyYW5zaXRpb24uIFR3byB2YWx1ZXMgYWNjZXB0ZWQgOiBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBcInNjcmVlbl9oaWRlXCIgOiBwcm9ncmVzc2l2ZWx5IHRyYW5zbGF0ZSBzY3JlZW4gdG8gYmxhY2suIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIFwic2NyZWVuX3Nob3dcIiA6IHByb2dyZXNzaXZlbHkgcmVtb3ZlIGJsYWNrIHNjcmVlbi5dXG4gICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdmFyIGFuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG4gICAgICAgIGFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJtaXhpblwiLCBtaXhpbl9uYW1lKTtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChhbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9ldmVudF9oYW5kbGVyKCl7XG5cbiAgICAgICAgaWYgKGRhdGEuZXZlbnQpeyBcblxuICAgICAgICAgIHZhciBzdGVwID0gZGF0YS5zdGVwLnRvU3RyaW5nKCk7XG4gICAgICAgICAgZWwuZW1pdCgncGFzc19zdGVwJywgc3RlcCk7IFxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICogUkFZQ0FTVElOR1xuICAgICAgICovXG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCgpe1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdSQVlDQVNURVIgSU5URVJTRUNURUQnKVxuXG4gICAgICAgIGlmIChfaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKSl7XG5cbiAgICAgICAgICBkYXRhLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICAgIGdsb2JhbF90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSgpIFxuICAgICAgICAgICAgICBfZXZlbnRfaGFuZGxlcigpO1xuXG4gICAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCgpe1xuXG4gICAgICAgIGlmIChnbG9iYWxfdGltZXIpe1xuICAgICAgICAgIGNsZWFyVGltZW91dChnbG9iYWxfdGltZXIpO1xuICAgICAgICAgIGdsb2JhbF90aW1lcj0wO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuXG4gICAgICAgIGRhdGEucHJvY2Vzc2luZyA9IGZhbHNlO1xuXG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICAgKiBBTklNQVRJT04gSEFORExFUlNcbiAgICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBoaWRlX3NjcmVlbigpeyBfYW5pbWF0aW9uX21peGluX2hhbmRsZXIoJ3NjZW5lX2hpZGUnLCBibGFja19zY3JlZW4pOyB9XG4gICAgICBmdW5jdGlvbiBzaG93X3NjcmVlbigpeyBwbGF5ZXIuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIGRhdGEudGFyZ2V0ICk7IF9hbmltYXRpb25fbWl4aW5faGFuZGxlcignc2NlbmVfc2hvdycsIGJsYWNrX3NjcmVlbik7IH1cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKHRhcmdldCl7IF9hbmltYXRpb25fbWl4aW5faGFuZGxlcignY3JlYXRlX2xpZ2h0JywgdGFyZ2V0KTsgfVxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQodGFyZ2V0KXsgX2FuaW1hdGlvbl9taXhpbl9oYW5kbGVyKCdsaWdodF9hbmltYXRpb24nLCB0YXJnZXQpOyB9XG5cbiAgICAgIC8qXG4gICAgICAgKiBDT1JFXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGRpc2FibGVfZnV0dXJlX2ludGVyYWN0aW9ucygpe1xuXG4gICAgICAgIGlmIChkYXRhLnJlcGVhdCA9PSBmYWxzZSl7XG5cbiAgICAgICAgICBkYXRhLmRpc2FibGUgPSB0cnVlO1xuICAgICAgICAgIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCk7XG5cbiAgICAgICAgICBpZiAoZGF0YS5kZWxldGUpeyBlbnRpdHkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbnRpdHkpOyB9XG4gICAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlX3RlbGVwb3J0ZXJzKCl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBY3RpdmF0ZSBsaXN0IG9mIHRwcyBnaXZlbiBieSBkYXRhLnRhcmdldF90b19hY3RpdmF0ZS5cbiAgICAgICAgICovXG5cbiAgICAgICAgaWYgKGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlICE9IG51bGwpIHtcblxuICAgICAgICAgIHZhciBsaXN0X3RwX3RvX2VuYWJsZSA9IGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlLnNwbGl0KCcsJyk7XG4gICAgICAgICAgbGlzdF90cF90b19lbmFibGUuZm9yRWFjaChmdW5jdGlvbih0cCl7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5zZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ2Rpc2FibGUnLCBmYWxzZSk7XG5cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBkaXNwbGF5X21lc3NhZ2UoKXtcblxuICAgICAgICBjb25zb2xlLmxvZygnRElTUExBWSBNRVNTQUdFIGxvbCcpO1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhLm1lc3NhZ2UpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGRhdGEubWVzc2FnZSAhPSBudWxsKXtcblxuICAgICAgICAgIGVsLmVtaXQoJ2Rpc3BsYXlfdGV4dCcsIGRhdGEubWVzc2FnZSlcbiAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIGRhdGEucHJvY2Vzc2luZyA9IGZhbHNlO1xuXG4gICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgfSBcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGVsZXBvcnQoKXtcblxuICAgICAgICBoaWRlX3NjcmVlbigpO1xuICAgICAgICBzZXRUaW1lb3V0KHNob3dfc2NyZWVuLCAxMDAwKTtcbiAgICAgICAgZGlzcGxheV9tZXNzYWdlKCk7XG5cbiAgICAgIH1cbiBcbiAgICAgIGZ1bmN0aW9uIGludGVyYWN0KCl7XG4gICAgICAgIGRpc2FibGVfZnV0dXJlX2ludGVyYWN0aW9ucygpO1xuICAgICAgICBhY3RpdmF0ZV90ZWxlcG9ydGVycygpO1xuICAgICAgICBkaXNwbGF5X21lc3NhZ2UoKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBsaWdodF90b3JjaCggKXtcblxuICAgICAgICBpbnRlcmFjdCgpO1xuXG4gICAgICAgIHZhciBsaWdodF9vYmplY3QgPSBlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKTtcbiAgICAgICAgY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24obGlnaHRfb2JqZWN0KVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBsaWdodF9vYmplY3QucmVtb3ZlQ2hpbGQobGlnaHRfb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoJ2EtYW5pbWF0aW9uJykpO1xuICAgICAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQobGlnaHRfb2JqZWN0KVxuXG4gICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgIH0sIFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpe1xuXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIH1cblxuICB9KTsgXG5cbn07XG5cbmV4cG9ydHMuaW5pdCA9IEludGVyYWN0aW9uO1xuIiwidmFyIFF1ZXN0Ym9vaz0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdxdWVzdGJvb2snLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgIHN0ZXA6IHtzdGVwOidpbnQnLCBkZWZhdWx0OjB9XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKCdRVUVTVEJPT0snKTtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG5cbiAgICAgICAgdmFyIHRleHRfZGlzcGxheWVkID0gZmFsc2U7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3F1ZXN0Ym9vayBsYXVuY2hlZCcpO1xuICAgICAgICB2YXIgdGV4dF9oYW5kbGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RleHRfaGFuZGxlcicpO1xuICAgICAgICBjb25zb2xlLmxvZyh0ZXh0X2hhbmRsZXIpO1xuXG4gICAgICAgIGVsLnNjZW5lRWwuYWRkRXZlbnRMaXN0ZW5lcigncGFzc19zdGVwJywgcGFzc19zdGVwKTtcblxuICAgICAgICBmdW5jdGlvbiBwYXNzX3N0ZXAoc3RlcF9zdHJpbmcpe1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ1BBU1MgU1RFUCcpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHRleHRfZGlzcGxheWVkKTtcbiAgICAgICAgICBjb25zb2xlLmxvZ1xuXG4gICAgICAgICAgaWYgKHRleHRfZGlzcGxheWVkID09IGZhbHNlKXtcblxuICAgICAgICAgICAgdGV4dF9kaXNwbGF5ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mKHN0ZXBfc3RyaW5nKSAhPSAnc3RyaW5nJyl7XG5cbiAgICAgICAgICAgICAgdmFyIHN0ZXAgPSBwYXJzZUludChzdGVwX3N0cmluZy5kZXRhaWwpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgIHZhciBzdGVwID0gc3RlcF9zdHJpbmc7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0ZXAgPT0gMCl7XG5cbiAgICAgICAgICAgICAgdmFyIG5ld19zdGVwID0gZWwuZ2V0QXR0cmlidXRlKCdxdWVzdGJvb2snLCAnc3RlcCcpLnN0ZXAgKyAxXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgdmFyIG5ld19zdGVwID0gc3RlcFxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld19zdGVwKVxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdxdWVzdGJvb2snLCAnc3RlcCcsIG5ld19zdGVwKTtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gbG9hZF90ZXh0KG5ld19zdGVwKTtcblxuICAgICAgICAgICAgaWYgKHRleHQgIT0gJyEhRU5EJyl7XG5cbiAgICAgICAgICAgICAgZWwuZW1pdCgnZGlzcGxheV90ZXh0JywgdGV4dCk7XG5cbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgdGV4dF9kaXNwbGF5ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBwYXNzX3N0ZXAoJzAnKTsgIFxuXG4gICAgICAgICAgICAgIH0sIDYwMDApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRfdGV4dChzdGVwKXtcblxuICAgICAgICAgIHN3aXRjaChzdGVwKXtcblxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICByZXR1cm4gJ3Rlc3QnO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICByZXR1cm4gJ3Rlc3QyJztcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAnISFFTkQnO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgfSxcblxuICAgIFxuICAgICAgdGVzdF9mdW5jdGlvbjogZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3Rlc3Qgc3VjY2Vzc2Z1bGwgIScpO1xuICAgICAgfSxcblxuICAgICAgdXBkYXRlOiBmdW5jdGlvbihvbGREYXRhKXtcblxuICAgICAgfVxuXG5cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMuaW5pdCA9IFF1ZXN0Ym9vazsiLCJ2YXIgVGV4dEhhbmRsZXIgPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RleHRfaGFuZGxlcicsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBzdGVwOiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6MH0sXG4gICAgICAgIHRleHRfbGlzdDoge3R5cGU6ICdhcnJheScsIGRlZmF1bHQ6IFtdfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBlbCA9IHRoaXMuZWwgICAgICAgIFxuICAgICAgICBlbC5zY2VuZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc3BsYXlfdGV4dCcsIGRpc3BsYXlfdGV4dCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZGlzcGxheV90ZXh0KHRleHQpe1xuXG4gICAgICAgICAgdmFyIGFuaW1hdGlvbl9mb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXh0X2FuaW1hdGlvbl9pZCcpO1xuICAgICAgICAgIGlmIChhbmltYXRpb25fZm91bmQpe1xuICAgICAgICAgICAgYW5pbWF0aW9uX2ZvdW5kLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYW5pbWF0aW9uX2ZvdW5kKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgndGV4dCcsICd2YWx1ZScsIHRleHQuZGV0YWlsKTtcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcbiAgICAgICAgICBhbmltYXRpb24uc2V0QXR0cmlidXRlKFwibWl4aW5cIiwgJ3RleHRfYW5pbWF0aW9uJyk7XG4gICAgICAgICAgYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImlkXCIsICd0ZXh0X2FuaW1hdGlvbl9pZCcpO1xuICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGFuaW1hdGlvbik7XG5cbiAgICAgICAgfVxuXG4gIFx0XHR9LFxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5pbml0ID0gVGV4dEhhbmRsZXI7XG4iLCJ2YXIgVG9yY2ggPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RvcmNoJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgICAgdGFyZ2V0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICAgIHN0ZXA6IHt0eXBlOiAnaW50JywgZGVmYXVsdDogMH1cblxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gIFx0XHRcdHZhciBlbCA9IHRoaXMuZWw7XG4gIFx0XHRcdHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXG4gIFx0XHRcdHZhciBfbGlnaHQgPSBkYXRhLmxpZ2h0O1xuICAgICAgICB2YXIgX3RhcmdldCA9IGRhdGEudGFyZ2V0O1xuICAgICAgICB2YXIgX2V2ZW50ID0gZGF0YS5ldmVudDtcbiAgICAgICAgdmFyIF9zdGVwID0gZGF0YS5zdGVwO1xuXG4gIFx0XHRcdGlmIChfbGlnaHQgPT0gdHJ1ZSl7XG5cbiAgXHRcdFx0XHRfbGlnaHQgPSAnOyBsaWdodDp0cnVlJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cbiAgXHRcdFx0ZWxzZXtcbiAgXHRcdFx0XG4gIFx0XHRcdFx0X2xpZ2h0ID0gJyc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG5cbiAgICAgICAgaWYgKF90YXJnZXQgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJzsgdGFyZ2V0X3RvX2FjdGl2YXRlOiAnICsgX3RhcmdldDtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfZXZlbnQgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfZXZlbnQgPSAnOyBldmVudDogJyArIF9ldmVudDtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfZXZlbnQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9zdGVwICE9IG51bGwpe1xuXG4gICAgICAgICAgX3N0ZXAgPSAnOyBzdGVwOiAnICsgX3N0ZXA7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgX3N0ZXAgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbGxpZGVyX2VudGl0eSA9ICc8YS1lbnRpdHkgdGVsZXBvcnQ9XCJhY3Rpb246bGlnaHRfdG9yY2gnICsgX2xpZ2h0ICsgX3RhcmdldCArIF9ldmVudCArIF9zdGVwICsgJ1wiIGNsYXNzPVwiY29sbGlkYWJsZVwiIGdlb21ldHJ5PVwiXCIgbWF0ZXJpYWw9XCJ0cmFuc3BhcmVudDogdHJ1ZTsgb3BhY2l0eTogMCBcIiBwb3NpdGlvbj1cIjAgMS4xMiAwXCIgc2NhbGU9XCIxIDIuNSAxXCIgPjwvYS1lbnRpdHk+J1xuICBcdFx0XHR2YXIgb2JqZWN0ID0gJzxhLWdsdGYtbW9kZWwgc3JjPVwiI3RvcmNoX21vZGVsXCI+PC9hLWdsdGYtbW9kZWw+J1xuICAgICAgICAvL3ZhciBvYmplY3QgPSAnPGEtZW50aXR5IGdsdGYtbW9kZWw9XCJzcmM6IHVybCguLi9tb2RlbHMvb2JqZWN0cy90b3JjaC5nbHRmKTtcIiA+PC9hLWVudGl0eT4nXG4gIFx0XHRcdHZhciBsaWdodCA9ICc8YS1saWdodCB0eXBlPVwicG9pbnRcIiBjb2xvcj1cInJnYigyNTUsIDE4OSwgMTA1KVwiIGludGVuc2l0eT1cIjBcIiBkaXN0YW5jZT1cIjQwXCIgcG9zaXRpb249XCItMC4wMzIgMi4wMjIgLTAuMTZcIj48L2EtbGlnaHQ+J1xuXG4gIFx0XHRcdGVsLmlubmVySFRNTCA9IGNvbGxpZGVyX2VudGl0eSArIG9iamVjdCArIGxpZ2h0O1xuXG4gICAgXHR9XG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmdlbmVyYXRlID0gVG9yY2g7XG4iLCJ2YXIgSW50ZXJhY3Rpb24gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvaW50ZXJhY3Rpb24uanMnKTtcbnZhciBUb3JjaCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90b3JjaC5qcycpO1xuLy92YXIgRXllcyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9leWVzLmpzJyk7XG52YXIgVGV4dEhhbmRsZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGV4dF9oYW5kbGVyLmpzJyk7XG52YXIgUXVlc3Rib29rID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3F1ZXN0Ym9vay5qcycpO1xuXG53aW5kb3cuY29uc29sZS5sb2coJ21haW4uanMnKVxuSW50ZXJhY3Rpb24uaW5pdCgpO1x0XG5Ub3JjaC5nZW5lcmF0ZSgpO1xuLy9FeWVzLm9wZW5fZXllcygpO1xuVGV4dEhhbmRsZXIuaW5pdCgpO1xuUXVlc3Rib29rLmluaXQoKTsiXX0=
