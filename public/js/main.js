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
      allowed           : {type:'string', default:null},    // List of point from which the player can interact with the object. If null, interaction is possible from anywhere.                    
      step              : {type: 'int', default:0},         // If not empty, interaction will define the questbook to a specific step.                                                                                                                  
      message           : {type: 'string', default:null}    // Message to display when object is triggered.                                                                                                                    

    },

    init: function () { 

      // Initialize important variables
      var el = this.el;
      var data = this.data
      var isIntersecting = false;

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
        
        if (isIntersecting == false){
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


        if (_interaction_is_possible()){

          isIntersecting = true;
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

        isIntersecting = false;

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

        data.disable = true;
        raycaster_intersected_cleared();

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

            isIntersecting = false;

          }, 10000);

        } 
      }

      function teleport(){

        hide_screen();
        setTimeout(show_screen, 1000);
        display_message();

      }
 
      function interact(){
        activate_teleporters();
        disable_future_interactions();
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
          e.appendChild(animation);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbnRlcmFjdGlvbi5qcyIsInNyYy9jb21wb25lbnRzL3F1ZXN0Ym9vay5qcyIsInNyYy9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwidmFyIEludGVyYWN0aW9uPSBmdW5jdGlvbigpe1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnaW50ZXJhY3Rpb24nLCB7XG4gICAgZGVwZW5kZW5jaWVzOiBbJ3JheWNhc3RlciddLFxuICAgIHNjaGVtYToge1xuICAgICAgdGFyZ2V0ICAgICAgICAgICAgOiB7dHlwZTogJ3ZlYzMnfSwgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgbG9jYXRpb24gZm9yIHRlbGVwb3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBhY3Rpb24gICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJ30sICAgICAgICAgICAgICAgICAvLyBJbnRlcmFjdGlvbiB0eXBlLiBQb3NzaWJsZSB2YWx1ZXMgOiBcInRlbGVwb3J0XCIsIFwiaW50ZXJhY3RcIiwgXCJsaWdodF90b3JjaFwiLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGxpZ2h0ICAgICAgICAgICAgIDoge3R5cGU6ICdib29sZWFuJ30sICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBsaWdodCBhbmltYXRpb24gaWYgdHJ1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgdGFyZ2V0X3RvX2FjdGl2YXRlOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sICAgLy8gTGlzdCBvZiB0ZWxlcG9ydCB0byBhY3RpdmF0ZSBpZiBvYmplY3QgaXMgdHJpZ2dlcmVkLiBMaXN0IG9mIGlkIHNlcGFyYXRlZCBieSBjb21tYS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGV2ZW50ICAgICAgICAgICAgIDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LCAgIC8vIEV2ZW50IHRvIHRyaWdnZXIgaWYgb2JqZWN0IGlzIGFjdGl2YXRlZC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgZGlzYWJsZSAgICAgICAgICAgOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSwgLy8gSWYgdHJ1ZSwgYmxvY2sgb2JqZWN0IGludGVyYWN0aW9uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGFsbG93ZWQgICAgICAgICAgIDoge3R5cGU6J3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sICAgIC8vIExpc3Qgb2YgcG9pbnQgZnJvbSB3aGljaCB0aGUgcGxheWVyIGNhbiBpbnRlcmFjdCB3aXRoIHRoZSBvYmplY3QuIElmIG51bGwsIGludGVyYWN0aW9uIGlzIHBvc3NpYmxlIGZyb20gYW55d2hlcmUuICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHN0ZXAgICAgICAgICAgICAgIDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OjB9LCAgICAgICAgIC8vIElmIG5vdCBlbXB0eSwgaW50ZXJhY3Rpb24gd2lsbCBkZWZpbmUgdGhlIHF1ZXN0Ym9vayB0byBhIHNwZWNpZmljIHN0ZXAuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBtZXNzYWdlICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSAgICAvLyBNZXNzYWdlIHRvIGRpc3BsYXkgd2hlbiBvYmplY3QgaXMgdHJpZ2dlcmVkLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkgeyBcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBpbXBvcnRhbnQgdmFyaWFibGVzXG4gICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcbiAgICAgIHZhciBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICB2YXIgZ2xvYmFsX3RpbWVyID0gMDtcbiAgICAgIFxuICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZWxlcG9ydF9sb2FkZXInKTtcbiAgICAgIHZhciBhY3Rpb25fdG9fcGVyZm9ybSA9IG51bGw7XG4gICAgICB2YXIgcGxheWVyID0gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWVyXCIpO1xuICAgICAgdmFyIHF1ZXN0Ym9vayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGJvb2snKVxuXG4gICAgICB2YXIgc3BoZXJlX2hlbHBlciA9ICc8YS1zcGhlcmUgcG9zaXRpb249XCIwIDIgMFwiIGdlb21ldHJ5PVwicmFkaXVzOjAuMVwiPjwvYS1zcGhlcmU+JztcbiAgICAgIHZhciB0aW1lcl9ibGFja19zY3JlZW4gPSAwO1xuICAgICAgdmFyIGJsYWNrX3NjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxhY2tfc2NyZWVuXCIpO1xuXG4gICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IF9kZXRlY3RfYWN0aW9uX3R5cGUoZGF0YS5hY3Rpb24pXG5cbiAgICAgIGlmIChkYXRhLmxpZ2h0ID09IHRydWUpe1xuXG4gICAgICAgIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpKTtcblxuICAgICAgfVxuICAgICAgZWxzZXtcblxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZCcsIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkLWNsZWFyZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCk7IFxuXG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICAgKiBDSEVDS0VSUyAmIEhBTkRMRVJTXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIF9kZXRlY3RfYWN0aW9uX3R5cGUoYWN0aW9uKXtcblxuICAgICAgICBpZiAgICAgIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnKXsgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSB0ZWxlcG9ydDsgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXsgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBpbnRlcmFjdDsgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnbGlnaHRfdG9yY2gnKXsgYWN0aW9uX3RvX3BlcmZvcm0gPSBsaWdodF90b3JjaDsgfVxuXG4gICAgICAgIHJldHVybiBhY3Rpb25fdG9fcGVyZm9ybVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9jaGVja19pZl9hbGxvd2VkKHBsYXllcl9wb3NpdGlvbil7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnRlcm1lZGlhdGUgY2hlY2sgZnVuY3Rpb24gKGNhbGxlZCBmb3IgdGVsZXBvcnQgaW50ZXJhY3Rpb24gdHlwZSlcbiAgICAgICAgICogSWYgYWxsb3dlZCBkYXRhIGlzIGZvdW5kLCBjaGVjayBpZiBwbGF5ZXIgY2FuIHVzZSB0ZWxlcG9ydGVyIGJ5IGNvbXBhcmluZyBwbGF5ZXIncyBwb3NpdGlvbiB0byBhbGwgYWxsb3dlZCB0cCdzIHBvc2l0aW9ucy5cbiAgICAgICAgICogQHBhcmFtIHt2ZWMzfSBbcGxheWVyX3Bvc2l0aW9uXSBbUGxheWVyIHBvc2l0aW9uIGluIHNwYWNlXVxuICAgICAgICAgKi9cblxuICAgICAgICB2YXIgdmFsdWVfdG9fcmV0dXJuID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGRhdGEuYWxsb3dlZCAhPSBudWxsKXtcbiAgICAgICAgICB2YXIgbGlzdF90cF9hbGxvd2VkID0gZGF0YS5hbGxvd2VkLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICBsaXN0X3RwX2FsbG93ZWQuZm9yRWFjaChmdW5jdGlvbih0cCl7XG4gICAgICAgICAgICBpZiAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS54ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC54ICYmXG4gICAgICAgICAgICAgICAgcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS55ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC55ICYmXG4gICAgICAgICAgICAgICAgcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS56ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC56KXtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHZhbHVlX3RvX3JldHVybiA9IHRydWU7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pXG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgdmFsdWVfdG9fcmV0dXJuID0gdHJ1ZTtcblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdmFsdWVfdG9fcmV0dXJuXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2ludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXRlY3QgaWYgaW50ZXJhY3Rpb24gd2l0aCBjdXJyZW50IG9iamVjdCBpcyBwb3NzaWJsZS5cbiAgICAgICAgICogMS4gICBDaGVjayBpZiBnZW5lcmFsIGludGVyYWN0aW9uIGlzIHBvc3NpYmxlXG4gICAgICAgICAqIDIuYS4gSWYgaW50ZXJhY3Rpb24gdHlwZSBpcyB0ZWxlcG9ydCBhbmQgcGxheWVyIHBvc2l0aW9uIGlzIGRpZmZlcmVudCBmcm9tIG9iamVjdCBwb3NpdGlvbiwgbGF1bmNoIGludGVybWVkaWF0ZSB2ZXJpZmljYXRpb24uXG4gICAgICAgICAqIDIuYi4gSWYgaW50ZXJhY3Rpb24gdHlwZSBpcyBkaWZmZXJlbnQsIGp1c3RlIGNoZWNrIGlmIGludGVyYWN0aW9uIGlzIGVuYWJsZWQuXG4gICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzSW50ZXJzZWN0aW5nID09IGZhbHNlKXtcbiAgICAgICAgICB2YXIgcGxheWVyX3Bvc2l0aW9uID0gcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKVxuXG4gICAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcgJiYgXG4gICAgICAgICAgICAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSAhPSBkYXRhLnRhcmdldCAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2UpICYmXG4gICAgICAgICAgICBfY2hlY2tfaWZfYWxsb3dlZCgpKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICgoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0JyB8fCBkYXRhLmFjdGlvbiA9PSBcImxpZ2h0X3RvcmNoXCIpICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9IFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2FuaW1hdGlvbl9taXhpbl9oYW5kbGVyKG1peGluX25hbWUsIGVsZW1lbnQpe1xuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhdGUgYW5pbWF0aW9uIG1peGluIGZvciB0cmFuc2l0aW9ucyBhbmQgbGlnaHRzLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW21peGluX25hbWVdIFtUeXBlIG9mIHRyYW5zaXRpb24uIFR3byB2YWx1ZXMgYWNjZXB0ZWQgOiBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBcInNjcmVlbl9oaWRlXCIgOiBwcm9ncmVzc2l2ZWx5IHRyYW5zbGF0ZSBzY3JlZW4gdG8gYmxhY2suIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIFwic2NyZWVuX3Nob3dcIiA6IHByb2dyZXNzaXZlbHkgcmVtb3ZlIGJsYWNrIHNjcmVlbi5dXG4gICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdmFyIGFuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG4gICAgICAgIGFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJtaXhpblwiLCBtaXhpbl9uYW1lKTtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChhbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9ldmVudF9oYW5kbGVyKCl7XG5cbiAgICAgICAgaWYgKGRhdGEuZXZlbnQpeyBcblxuICAgICAgICAgIHZhciBzdGVwID0gZGF0YS5zdGVwLnRvU3RyaW5nKCk7XG4gICAgICAgICAgZWwuZW1pdCgncGFzc19zdGVwJywgc3RlcCk7IFxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICogUkFZQ0FTVElOR1xuICAgICAgICovXG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCgpe1xuXG5cbiAgICAgICAgaWYgKF9pbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpKXtcblxuICAgICAgICAgIGlzSW50ZXJzZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICBcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgICAgZ2xvYmFsX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgIGFjdGlvbl90b19wZXJmb3JtKCkgXG4gICAgICAgICAgICAgIF9ldmVudF9oYW5kbGVyKCk7XG5cbiAgICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCl7XG5cbiAgICAgICAgaWYgKGdsb2JhbF90aW1lcil7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGdsb2JhbF90aW1lcik7XG4gICAgICAgICAgZ2xvYmFsX3RpbWVyPTA7XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG5cbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICogQU5JTUFUSU9OIEhBTkRMRVJTXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gaGlkZV9zY3JlZW4oKXsgX2FuaW1hdGlvbl9taXhpbl9oYW5kbGVyKCdzY2VuZV9oaWRlJywgYmxhY2tfc2NyZWVuKTsgfVxuICAgICAgZnVuY3Rpb24gc2hvd19zY3JlZW4oKXsgcGxheWVyLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBkYXRhLnRhcmdldCApOyBfYW5pbWF0aW9uX21peGluX2hhbmRsZXIoJ3NjZW5lX3Nob3cnLCBibGFja19zY3JlZW4pOyB9XG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbih0YXJnZXQpeyBfYW5pbWF0aW9uX21peGluX2hhbmRsZXIoJ2NyZWF0ZV9saWdodCcsIHRhcmdldCk7IH1cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7IF9hbmltYXRpb25fbWl4aW5faGFuZGxlcignbGlnaHRfYW5pbWF0aW9uJywgdGFyZ2V0KTsgfVxuXG4gICAgICAvKlxuICAgICAgICogQ09SRVxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBkaXNhYmxlX2Z1dHVyZV9pbnRlcmFjdGlvbnMoKXtcblxuICAgICAgICBkYXRhLmRpc2FibGUgPSB0cnVlO1xuICAgICAgICByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCgpO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlX3RlbGVwb3J0ZXJzKCl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBY3RpdmF0ZSBsaXN0IG9mIHRwcyBnaXZlbiBieSBkYXRhLnRhcmdldF90b19hY3RpdmF0ZS5cbiAgICAgICAgICovXG5cbiAgICAgICAgaWYgKGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlICE9IG51bGwpIHtcblxuICAgICAgICAgIHZhciBsaXN0X3RwX3RvX2VuYWJsZSA9IGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlLnNwbGl0KCcsJyk7XG4gICAgICAgICAgbGlzdF90cF90b19lbmFibGUuZm9yRWFjaChmdW5jdGlvbih0cCl7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5zZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ2Rpc2FibGUnLCBmYWxzZSk7XG5cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBkaXNwbGF5X21lc3NhZ2UoKXtcblxuICAgICAgICBjb25zb2xlLmxvZygnRElTUExBWSBNRVNTQUdFJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEubWVzc2FnZSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoZGF0YS5tZXNzYWdlICE9IG51bGwpe1xuXG4gICAgICAgICAgZWwuZW1pdCgnZGlzcGxheV90ZXh0JywgZGF0YS5tZXNzYWdlKVxuICAgICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgICAgIH0sIDEwMDAwKTtcblxuICAgICAgICB9IFxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0ZWxlcG9ydCgpe1xuXG4gICAgICAgIGhpZGVfc2NyZWVuKCk7XG4gICAgICAgIHNldFRpbWVvdXQoc2hvd19zY3JlZW4sIDEwMDApO1xuICAgICAgICBkaXNwbGF5X21lc3NhZ2UoKTtcblxuICAgICAgfVxuIFxuICAgICAgZnVuY3Rpb24gaW50ZXJhY3QoKXtcbiAgICAgICAgYWN0aXZhdGVfdGVsZXBvcnRlcnMoKTtcbiAgICAgICAgZGlzYWJsZV9mdXR1cmVfaW50ZXJhY3Rpb25zKCk7XG4gICAgICAgIGRpc3BsYXlfbWVzc2FnZSgpO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGxpZ2h0X3RvcmNoKCApe1xuXG4gICAgICAgIGludGVyYWN0KCk7XG5cbiAgICAgICAgdmFyIGxpZ2h0X29iamVjdCA9IGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpO1xuICAgICAgICBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbihsaWdodF9vYmplY3QpXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIGxpZ2h0X29iamVjdC5yZW1vdmVDaGlsZChsaWdodF9vYmplY3QucXVlcnlTZWxlY3RvcignYS1hbmltYXRpb24nKSk7XG4gICAgICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChsaWdodF9vYmplY3QpXG5cbiAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICB9KTtcblxuICAgICAgfVxuXG4gICAgfSwgXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgfVxuXG4gIH0pOyBcblxufTtcblxuZXhwb3J0cy5pbml0ID0gSW50ZXJhY3Rpb247XG4iLCJ2YXIgUXVlc3Rib29rPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3F1ZXN0Ym9vaycsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICAgc3RlcDoge3N0ZXA6J2ludCcsIGRlZmF1bHQ6MH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgY29uc29sZS5sb2coJ1FVRVNUQk9PSycpO1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcblxuICAgICAgICB2YXIgdGV4dF9kaXNwbGF5ZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zb2xlLmxvZygncXVlc3Rib29rIGxhdW5jaGVkJyk7XG4gICAgICAgIHZhciB0ZXh0X2hhbmRsZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGV4dF9oYW5kbGVyJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHRfaGFuZGxlcik7XG5cbiAgICAgICAgZWwuc2NlbmVFbC5hZGRFdmVudExpc3RlbmVyKCdwYXNzX3N0ZXAnLCBwYXNzX3N0ZXApO1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhc3Nfc3RlcChzdGVwX3N0cmluZyl7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnUEFTUyBTVEVQJyk7XG4gICAgICAgICAgY29uc29sZS5sb2codGV4dF9kaXNwbGF5ZWQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nXG5cbiAgICAgICAgICBpZiAodGV4dF9kaXNwbGF5ZWQgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgICB0ZXh0X2Rpc3BsYXllZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Yoc3RlcF9zdHJpbmcpICE9ICdzdHJpbmcnKXtcblxuICAgICAgICAgICAgICB2YXIgc3RlcCA9IHBhcnNlSW50KHN0ZXBfc3RyaW5nLmRldGFpbCk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgdmFyIHN0ZXAgPSBzdGVwX3N0cmluZztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RlcCA9PSAwKXtcblxuICAgICAgICAgICAgICB2YXIgbmV3X3N0ZXAgPSBlbC5nZXRBdHRyaWJ1dGUoJ3F1ZXN0Ym9vaycsICdzdGVwJykuc3RlcCArIDFcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICB2YXIgbmV3X3N0ZXAgPSBzdGVwXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2cobmV3X3N0ZXApXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3F1ZXN0Ym9vaycsICdzdGVwJywgbmV3X3N0ZXApO1xuICAgICAgICAgICAgdmFyIHRleHQgPSBsb2FkX3RleHQobmV3X3N0ZXApO1xuXG4gICAgICAgICAgICBpZiAodGV4dCAhPSAnISFFTkQnKXtcblxuICAgICAgICAgICAgICBlbC5lbWl0KCdkaXNwbGF5X3RleHQnLCB0ZXh0KTtcblxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICB0ZXh0X2Rpc3BsYXllZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHBhc3Nfc3RlcCgnMCcpOyAgXG5cbiAgICAgICAgICAgICAgfSwgNjAwMCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZF90ZXh0KHN0ZXApe1xuXG4gICAgICAgICAgc3dpdGNoKHN0ZXApe1xuXG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIHJldHVybiAndGVzdCc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIHJldHVybiAndGVzdDInO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICchIUVORCc7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9LFxuXG4gICAgXG4gICAgICB0ZXN0X2Z1bmN0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZygndGVzdCBzdWNjZXNzZnVsbCAhJyk7XG4gICAgICB9LFxuXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKG9sZERhdGEpe1xuXG4gICAgICB9XG5cblxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5pbml0ID0gUXVlc3Rib29rOyIsInZhciBUZXh0SGFuZGxlciA9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndGV4dF9oYW5kbGVyJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIHN0ZXA6IHt0eXBlOiAnaW50JywgZGVmYXVsdDowfSxcbiAgICAgICAgdGV4dF9saXN0OiB7dHlwZTogJ2FycmF5JywgZGVmYXVsdDogW119XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIGVsID0gdGhpcy5lbCAgICAgICAgXG4gICAgICAgIGVsLnNjZW5lRWwuYWRkRXZlbnRMaXN0ZW5lcignZGlzcGxheV90ZXh0JywgZGlzcGxheV90ZXh0KTtcblxuICAgICAgICBmdW5jdGlvbiBkaXNwbGF5X3RleHQodGV4dCl7XG5cbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAndmFsdWUnLCB0ZXh0LmRldGFpbCk7XG4gICAgICAgICAgdmFyIGFuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG4gICAgICAgICAgYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcIm1peGluXCIsICd0ZXh0X2FuaW1hdGlvbicpO1xuICAgICAgICAgIGUuYXBwZW5kQ2hpbGQoYW5pbWF0aW9uKTtcblxuICAgICAgICB9XG5cbiAgXHRcdH0sXG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmluaXQgPSBUZXh0SGFuZGxlcjtcbiIsInZhciBUb3JjaCA9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndG9yY2gnLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9LFxuICAgICAgICB0YXJnZXQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSxcbiAgICAgICAgZXZlbnQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSxcbiAgICAgICAgc3RlcDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OiAwfVxuXG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgXHRcdFx0dmFyIGVsID0gdGhpcy5lbDtcbiAgXHRcdFx0dmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgXHRcdFx0dmFyIF9saWdodCA9IGRhdGEubGlnaHQ7XG4gICAgICAgIHZhciBfdGFyZ2V0ID0gZGF0YS50YXJnZXQ7XG4gICAgICAgIHZhciBfZXZlbnQgPSBkYXRhLmV2ZW50O1xuICAgICAgICB2YXIgX3N0ZXAgPSBkYXRhLnN0ZXA7XG5cbiAgXHRcdFx0aWYgKF9saWdodCA9PSB0cnVlKXtcblxuICBcdFx0XHRcdF9saWdodCA9ICc7IGxpZ2h0OnRydWUnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuICBcdFx0XHRlbHNle1xuICBcdFx0XHRcbiAgXHRcdFx0XHRfbGlnaHQgPSAnJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cblxuICAgICAgICBpZiAoX3RhcmdldCAhPSBudWxsKXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnOyB0YXJnZXRfdG9fYWN0aXZhdGU6ICcgKyBfdGFyZ2V0O1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9ldmVudCAhPSBudWxsKXtcblxuICAgICAgICAgIF9ldmVudCA9ICc7IGV2ZW50OiAnICsgX2V2ZW50O1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF9ldmVudCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3N0ZXAgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfc3RlcCA9ICc7IHN0ZXA6ICcgKyBfc3RlcDtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfc3RlcCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29sbGlkZXJfZW50aXR5ID0gJzxhLWVudGl0eSB0ZWxlcG9ydD1cImFjdGlvbjpsaWdodF90b3JjaCcgKyBfbGlnaHQgKyBfdGFyZ2V0ICsgX2V2ZW50ICsgX3N0ZXAgKyAnXCIgY2xhc3M9XCJjb2xsaWRhYmxlXCIgZ2VvbWV0cnk9XCJcIiBtYXRlcmlhbD1cInRyYW5zcGFyZW50OiB0cnVlOyBvcGFjaXR5OiAwIFwiIHBvc2l0aW9uPVwiMCAxLjEyIDBcIiBzY2FsZT1cIjEgMi41IDFcIiA+PC9hLWVudGl0eT4nXG4gIFx0XHRcdHZhciBvYmplY3QgPSAnPGEtZ2x0Zi1tb2RlbCBzcmM9XCIjdG9yY2hfbW9kZWxcIj48L2EtZ2x0Zi1tb2RlbD4nXG4gICAgICAgIC8vdmFyIG9iamVjdCA9ICc8YS1lbnRpdHkgZ2x0Zi1tb2RlbD1cInNyYzogdXJsKC4uL21vZGVscy9vYmplY3RzL3RvcmNoLmdsdGYpO1wiID48L2EtZW50aXR5PidcbiAgXHRcdFx0dmFyIGxpZ2h0ID0gJzxhLWxpZ2h0IHR5cGU9XCJwb2ludFwiIGNvbG9yPVwicmdiKDI1NSwgMTg5LCAxMDUpXCIgaW50ZW5zaXR5PVwiMFwiIGRpc3RhbmNlPVwiNDBcIiBwb3NpdGlvbj1cIi0wLjAzMiAyLjAyMiAtMC4xNlwiPjwvYS1saWdodD4nXG5cbiAgXHRcdFx0ZWwuaW5uZXJIVE1MID0gY29sbGlkZXJfZW50aXR5ICsgb2JqZWN0ICsgbGlnaHQ7XG5cbiAgICBcdH1cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMuZ2VuZXJhdGUgPSBUb3JjaDtcbiIsInZhciBJbnRlcmFjdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9pbnRlcmFjdGlvbi5qcycpO1xudmFyIFRvcmNoID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RvcmNoLmpzJyk7XG4vL3ZhciBFeWVzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2V5ZXMuanMnKTtcbnZhciBUZXh0SGFuZGxlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZXh0X2hhbmRsZXIuanMnKTtcbnZhciBRdWVzdGJvb2sgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcXVlc3Rib29rLmpzJyk7XG5cbndpbmRvdy5jb25zb2xlLmxvZygnbWFpbi5qcycpXG5JbnRlcmFjdGlvbi5pbml0KCk7XHRcblRvcmNoLmdlbmVyYXRlKCk7XG4vL0V5ZXMub3Blbl9leWVzKCk7XG5UZXh0SGFuZGxlci5pbml0KCk7XG5RdWVzdGJvb2suaW5pdCgpOyJdfQ==
