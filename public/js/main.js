(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
var Interaction= function(){

  "use strict";

  AFRAME.registerComponent('interaction', {
    dependencies: ['raycaster'],
    schema: {
      target            : {type: 'vec3'},                   // Point location for teleport                                                                                                                                       
      action            : {type: 'string'},                 // Interaction type. Possible values : "teleport", "interact", "light_torch".                                                                                                                            
      light             : {type: 'boolean'},                // Create light animation if true                                                                                                                     
      target_to_activate: {type: 'string', default:null},   // List of teleport to activate if object triggered. List of id separated by comma.                                                                                    
      event             : {type: 'string', default:null},   // Event to trigger if object activated.                                                                                                                 
      disable           : {type: 'boolean', default:false}, // If true, block object interaction.                                                                                                                
      allowed           : {type:'string', default:null},    // List of point from which the player can interact with the object. If null, interaction is possible from anywhere.                    
      step              : {type: 'int', default:0},         // If not empty, interaction will define the questbook to a specific step.                                                                                                                  
      message           : {type: 'string', default:null}    // Message to display when object triggered.                                                                                                                    

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbnRlcmFjdGlvbi5qcyIsInNyYy9jb21wb25lbnRzL3F1ZXN0Ym9vay5qcyIsInNyYy9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwidmFyIEludGVyYWN0aW9uPSBmdW5jdGlvbigpe1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnaW50ZXJhY3Rpb24nLCB7XG4gICAgZGVwZW5kZW5jaWVzOiBbJ3JheWNhc3RlciddLFxuICAgIHNjaGVtYToge1xuICAgICAgdGFyZ2V0ICAgICAgICAgICAgOiB7dHlwZTogJ3ZlYzMnfSwgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgbG9jYXRpb24gZm9yIHRlbGVwb3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBhY3Rpb24gICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJ30sICAgICAgICAgICAgICAgICAvLyBJbnRlcmFjdGlvbiB0eXBlLiBQb3NzaWJsZSB2YWx1ZXMgOiBcInRlbGVwb3J0XCIsIFwiaW50ZXJhY3RcIiwgXCJsaWdodF90b3JjaFwiLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGxpZ2h0ICAgICAgICAgICAgIDoge3R5cGU6ICdib29sZWFuJ30sICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBsaWdodCBhbmltYXRpb24gaWYgdHJ1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgdGFyZ2V0X3RvX2FjdGl2YXRlOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sICAgLy8gTGlzdCBvZiB0ZWxlcG9ydCB0byBhY3RpdmF0ZSBpZiBvYmplY3QgdHJpZ2dlcmVkLiBMaXN0IG9mIGlkIHNlcGFyYXRlZCBieSBjb21tYS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGV2ZW50ICAgICAgICAgICAgIDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LCAgIC8vIEV2ZW50IHRvIHRyaWdnZXIgaWYgb2JqZWN0IGFjdGl2YXRlZC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgZGlzYWJsZSAgICAgICAgICAgOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSwgLy8gSWYgdHJ1ZSwgYmxvY2sgb2JqZWN0IGludGVyYWN0aW9uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGFsbG93ZWQgICAgICAgICAgIDoge3R5cGU6J3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sICAgIC8vIExpc3Qgb2YgcG9pbnQgZnJvbSB3aGljaCB0aGUgcGxheWVyIGNhbiBpbnRlcmFjdCB3aXRoIHRoZSBvYmplY3QuIElmIG51bGwsIGludGVyYWN0aW9uIGlzIHBvc3NpYmxlIGZyb20gYW55d2hlcmUuICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHN0ZXAgICAgICAgICAgICAgIDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OjB9LCAgICAgICAgIC8vIElmIG5vdCBlbXB0eSwgaW50ZXJhY3Rpb24gd2lsbCBkZWZpbmUgdGhlIHF1ZXN0Ym9vayB0byBhIHNwZWNpZmljIHN0ZXAuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBtZXNzYWdlICAgICAgICAgICA6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSAgICAvLyBNZXNzYWdlIHRvIGRpc3BsYXkgd2hlbiBvYmplY3QgdHJpZ2dlcmVkLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkgeyBcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBpbXBvcnRhbnQgdmFyaWFibGVzXG4gICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcbiAgICAgIHZhciBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICB2YXIgZ2xvYmFsX3RpbWVyID0gMDtcbiAgICAgIFxuICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZWxlcG9ydF9sb2FkZXInKTtcbiAgICAgIHZhciBhY3Rpb25fdG9fcGVyZm9ybSA9IG51bGw7XG4gICAgICB2YXIgcGxheWVyID0gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWVyXCIpO1xuICAgICAgdmFyIHF1ZXN0Ym9vayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGJvb2snKVxuXG4gICAgICB2YXIgc3BoZXJlX2hlbHBlciA9ICc8YS1zcGhlcmUgcG9zaXRpb249XCIwIDIgMFwiIGdlb21ldHJ5PVwicmFkaXVzOjAuMVwiPjwvYS1zcGhlcmU+JztcbiAgICAgIHZhciB0aW1lcl9ibGFja19zY3JlZW4gPSAwO1xuICAgICAgdmFyIGJsYWNrX3NjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxhY2tfc2NyZWVuXCIpO1xuXG4gICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IF9kZXRlY3RfYWN0aW9uX3R5cGUoZGF0YS5hY3Rpb24pXG5cbiAgICAgIGlmIChkYXRhLmxpZ2h0ID09IHRydWUpe1xuXG4gICAgICAgIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpKTtcblxuICAgICAgfVxuICAgICAgZWxzZXtcblxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZCcsIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkLWNsZWFyZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCk7IFxuXG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICAgKiBDSEVDS0VSUyAmIEhBTkRMRVJTXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIF9kZXRlY3RfYWN0aW9uX3R5cGUoYWN0aW9uKXtcblxuICAgICAgICBpZiAgICAgIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnKXsgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSB0ZWxlcG9ydDsgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXsgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBpbnRlcmFjdDsgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnbGlnaHRfdG9yY2gnKXsgYWN0aW9uX3RvX3BlcmZvcm0gPSBsaWdodF90b3JjaDsgfVxuXG4gICAgICAgIHJldHVybiBhY3Rpb25fdG9fcGVyZm9ybVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9jaGVja19pZl9hbGxvd2VkKHBsYXllcl9wb3NpdGlvbil7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnRlcm1lZGlhdGUgY2hlY2sgZnVuY3Rpb24gKGNhbGxlZCBmb3IgdGVsZXBvcnQgaW50ZXJhY3Rpb24gdHlwZSlcbiAgICAgICAgICogSWYgYWxsb3dlZCBkYXRhIGlzIGZvdW5kLCBjaGVjayBpZiBwbGF5ZXIgY2FuIHVzZSB0ZWxlcG9ydGVyIGJ5IGNvbXBhcmluZyBwbGF5ZXIncyBwb3NpdGlvbiB0byBhbGwgYWxsb3dlZCB0cCdzIHBvc2l0aW9ucy5cbiAgICAgICAgICogQHBhcmFtIHt2ZWMzfSBbcGxheWVyX3Bvc2l0aW9uXSBbUGxheWVyIHBvc2l0aW9uIGluIHNwYWNlXVxuICAgICAgICAgKi9cblxuICAgICAgICB2YXIgdmFsdWVfdG9fcmV0dXJuID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGRhdGEuYWxsb3dlZCAhPSBudWxsKXtcbiAgICAgICAgICB2YXIgbGlzdF90cF9hbGxvd2VkID0gZGF0YS5hbGxvd2VkLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICBsaXN0X3RwX2FsbG93ZWQuZm9yRWFjaChmdW5jdGlvbih0cCl7XG4gICAgICAgICAgICBpZiAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS54ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC54ICYmXG4gICAgICAgICAgICAgICAgcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS55ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC55ICYmXG4gICAgICAgICAgICAgICAgcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS56ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC56KXtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHZhbHVlX3RvX3JldHVybiA9IHRydWU7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pXG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgdmFsdWVfdG9fcmV0dXJuID0gdHJ1ZTtcblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdmFsdWVfdG9fcmV0dXJuXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2ludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXRlY3QgaWYgaW50ZXJhY3Rpb24gd2l0aCBjdXJyZW50IG9iamVjdCBpcyBwb3NzaWJsZS5cbiAgICAgICAgICogMS4gICBDaGVjayBpZiBnZW5lcmFsIGludGVyYWN0aW9uIGlzIHBvc3NpYmxlXG4gICAgICAgICAqIDIuYS4gSWYgaW50ZXJhY3Rpb24gdHlwZSBpcyB0ZWxlcG9ydCBhbmQgcGxheWVyIHBvc2l0aW9uIGlzIGRpZmZlcmVudCBmcm9tIG9iamVjdCBwb3NpdGlvbiwgbGF1bmNoIGludGVybWVkaWF0ZSB2ZXJpZmljYXRpb24uXG4gICAgICAgICAqIDIuYi4gSWYgaW50ZXJhY3Rpb24gdHlwZSBpcyBkaWZmZXJlbnQsIGp1c3RlIGNoZWNrIGlmIGludGVyYWN0aW9uIGlzIGVuYWJsZWQuXG4gICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgaWYgKGlzSW50ZXJzZWN0aW5nID09IGZhbHNlKXtcbiAgICAgICAgICB2YXIgcGxheWVyX3Bvc2l0aW9uID0gcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKVxuXG4gICAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcgJiYgXG4gICAgICAgICAgICAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSAhPSBkYXRhLnRhcmdldCAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2UpICYmXG4gICAgICAgICAgICBfY2hlY2tfaWZfYWxsb3dlZCgpKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICgoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0JyB8fCBkYXRhLmFjdGlvbiA9PSBcImxpZ2h0X3RvcmNoXCIpICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9IFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2FuaW1hdGlvbl9taXhpbl9oYW5kbGVyKG1peGluX25hbWUsIGVsZW1lbnQpe1xuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhdGUgYW5pbWF0aW9uIG1peGluIGZvciB0cmFuc2l0aW9ucyBhbmQgbGlnaHRzLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW21peGluX25hbWVdIFtUeXBlIG9mIHRyYW5zaXRpb24uIFR3byB2YWx1ZXMgYWNjZXB0ZWQgOiBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBcInNjcmVlbl9oaWRlXCIgOiBwcm9ncmVzc2l2ZWx5IHRyYW5zbGF0ZSBzY3JlZW4gdG8gYmxhY2suIFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIFwic2NyZWVuX3Nob3dcIiA6IHByb2dyZXNzaXZlbHkgcmVtb3ZlIGJsYWNrIHNjcmVlbi5dXG4gICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdmFyIGFuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG4gICAgICAgIGFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJtaXhpblwiLCBtaXhpbl9uYW1lKTtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChhbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9ldmVudF9oYW5kbGVyKCl7XG5cbiAgICAgICAgaWYgKGRhdGEuZXZlbnQpeyBcblxuICAgICAgICAgIHZhciBzdGVwID0gZGF0YS5zdGVwLnRvU3RyaW5nKCk7XG4gICAgICAgICAgZWwuZW1pdCgncGFzc19zdGVwJywgc3RlcCk7IFxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICogUkFZQ0FTVElOR1xuICAgICAgICovXG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCgpe1xuXG5cbiAgICAgICAgaWYgKF9pbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpKXtcblxuICAgICAgICAgIGlzSW50ZXJzZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICBcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgICAgZ2xvYmFsX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgIGFjdGlvbl90b19wZXJmb3JtKCkgXG4gICAgICAgICAgICAgIF9ldmVudF9oYW5kbGVyKCk7XG5cbiAgICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCl7XG5cbiAgICAgICAgaWYgKGdsb2JhbF90aW1lcil7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGdsb2JhbF90aW1lcik7XG4gICAgICAgICAgZ2xvYmFsX3RpbWVyPTA7XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG5cbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICogQU5JTUFUSU9OIEhBTkRMRVJTXG4gICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gaGlkZV9zY3JlZW4oKXsgX2FuaW1hdGlvbl9taXhpbl9oYW5kbGVyKCdzY2VuZV9oaWRlJywgYmxhY2tfc2NyZWVuKTsgfVxuICAgICAgZnVuY3Rpb24gc2hvd19zY3JlZW4oKXsgcGxheWVyLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBkYXRhLnRhcmdldCApOyBfYW5pbWF0aW9uX21peGluX2hhbmRsZXIoJ3NjZW5lX3Nob3cnLCBibGFja19zY3JlZW4pOyB9XG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbih0YXJnZXQpeyBfYW5pbWF0aW9uX21peGluX2hhbmRsZXIoJ2NyZWF0ZV9saWdodCcsIHRhcmdldCk7IH1cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7IF9hbmltYXRpb25fbWl4aW5faGFuZGxlcignbGlnaHRfYW5pbWF0aW9uJywgdGFyZ2V0KTsgfVxuXG4gICAgICAvKlxuICAgICAgICogQ09SRVxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBkaXNhYmxlX2Z1dHVyZV9pbnRlcmFjdGlvbnMoKXtcblxuICAgICAgICBkYXRhLmRpc2FibGUgPSB0cnVlO1xuICAgICAgICByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCgpO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlX3RlbGVwb3J0ZXJzKCl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBY3RpdmF0ZSBsaXN0IG9mIHRwcyBnaXZlbiBieSBkYXRhLnRhcmdldF90b19hY3RpdmF0ZS5cbiAgICAgICAgICovXG5cbiAgICAgICAgaWYgKGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlICE9IG51bGwpIHtcblxuICAgICAgICAgIHZhciBsaXN0X3RwX3RvX2VuYWJsZSA9IGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlLnNwbGl0KCcsJyk7XG4gICAgICAgICAgbGlzdF90cF90b19lbmFibGUuZm9yRWFjaChmdW5jdGlvbih0cCl7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5zZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ2Rpc2FibGUnLCBmYWxzZSk7XG5cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBkaXNwbGF5X21lc3NhZ2UoKXtcbiAgICAgICAgXG4gICAgICAgIGlmIChkYXRhLm1lc3NhZ2UgIT0gbnVsbCl7XG5cbiAgICAgICAgICBlbC5lbWl0KCdkaXNwbGF5X3RleHQnLCBkYXRhLm1lc3NhZ2UpXG4gICAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgfSwgMTAwMDApO1xuXG4gICAgICAgIH0gXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRlbGVwb3J0KCl7XG5cbiAgICAgICAgaGlkZV9zY3JlZW4oKTtcbiAgICAgICAgc2V0VGltZW91dChzaG93X3NjcmVlbiwgMTAwMCk7XG4gICAgICAgIGRpc3BsYXlfbWVzc2FnZSgpO1xuXG4gICAgICB9XG4gXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdCgpe1xuICAgICAgICBhY3RpdmF0ZV90ZWxlcG9ydGVycygpO1xuICAgICAgICBkaXNhYmxlX2Z1dHVyZV9pbnRlcmFjdGlvbnMoKTtcbiAgICAgICAgZGlzcGxheV9tZXNzYWdlKCk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbGlnaHRfdG9yY2goICl7XG5cbiAgICAgICAgaW50ZXJhY3QoKTtcblxuICAgICAgICB2YXIgbGlnaHRfb2JqZWN0ID0gZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0Jyk7XG4gICAgICAgIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKGxpZ2h0X29iamVjdClcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgbGlnaHRfb2JqZWN0LnJlbW92ZUNoaWxkKGxpZ2h0X29iamVjdC5xdWVyeVNlbGVjdG9yKCdhLWFuaW1hdGlvbicpKTtcbiAgICAgICAgICAgIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KGxpZ2h0X29iamVjdClcblxuICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cbiAgICB9LCBcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKXtcblxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB9XG5cbiAgfSk7IFxuXG59O1xuXG5leHBvcnRzLmluaXQgPSBJbnRlcmFjdGlvbjtcbiIsInZhciBRdWVzdGJvb2s9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgncXVlc3Rib29rJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgICBzdGVwOiB7c3RlcDonaW50JywgZGVmYXVsdDowfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICBjb25zb2xlLmxvZygnUVVFU1RCT09LJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgICAgIHZhciB0ZXh0X2Rpc3BsYXllZCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdxdWVzdGJvb2sgbGF1bmNoZWQnKTtcbiAgICAgICAgdmFyIHRleHRfaGFuZGxlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXh0X2hhbmRsZXInKTtcbiAgICAgICAgY29uc29sZS5sb2codGV4dF9oYW5kbGVyKTtcblxuICAgICAgICBlbC5zY2VuZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Bhc3Nfc3RlcCcsIHBhc3Nfc3RlcCk7XG5cbiAgICAgICAgZnVuY3Rpb24gcGFzc19zdGVwKHN0ZXBfc3RyaW5nKXtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQQVNTIFNURVAnKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0X2Rpc3BsYXllZCk7XG4gICAgICAgICAgY29uc29sZS5sb2dcblxuICAgICAgICAgIGlmICh0ZXh0X2Rpc3BsYXllZCA9PSBmYWxzZSl7XG5cbiAgICAgICAgICAgIHRleHRfZGlzcGxheWVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZihzdGVwX3N0cmluZykgIT0gJ3N0cmluZycpe1xuXG4gICAgICAgICAgICAgIHZhciBzdGVwID0gcGFyc2VJbnQoc3RlcF9zdHJpbmcuZGV0YWlsKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICB2YXIgc3RlcCA9IHN0ZXBfc3RyaW5nO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGVwID09IDApe1xuXG4gICAgICAgICAgICAgIHZhciBuZXdfc3RlcCA9IGVsLmdldEF0dHJpYnV0ZSgncXVlc3Rib29rJywgJ3N0ZXAnKS5zdGVwICsgMVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgIHZhciBuZXdfc3RlcCA9IHN0ZXBcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdfc3RlcClcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgncXVlc3Rib29rJywgJ3N0ZXAnLCBuZXdfc3RlcCk7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGxvYWRfdGV4dChuZXdfc3RlcCk7XG5cbiAgICAgICAgICAgIGlmICh0ZXh0ICE9ICchIUVORCcpe1xuXG4gICAgICAgICAgICAgIGVsLmVtaXQoJ2Rpc3BsYXlfdGV4dCcsIHRleHQpO1xuXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgIHRleHRfZGlzcGxheWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcGFzc19zdGVwKCcwJyk7ICBcblxuICAgICAgICAgICAgICB9LCA2MDAwKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBsb2FkX3RleHQoc3RlcCl7XG5cbiAgICAgICAgICBzd2l0Y2goc3RlcCl7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgcmV0dXJuICd0ZXN0JztcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgcmV0dXJuICd0ZXN0Mic7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJyEhRU5EJztcblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgIH0sXG5cbiAgICBcbiAgICAgIHRlc3RfZnVuY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0IHN1Y2Nlc3NmdWxsICEnKTtcbiAgICAgIH0sXG5cbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24ob2xkRGF0YSl7XG5cbiAgICAgIH1cblxuXG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmluaXQgPSBRdWVzdGJvb2s7IiwidmFyIFRleHRIYW5kbGVyID0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZXh0X2hhbmRsZXInLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgc3RlcDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OjB9LFxuICAgICAgICB0ZXh0X2xpc3Q6IHt0eXBlOiAnYXJyYXknLCBkZWZhdWx0OiBbXX1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsICAgICAgICBcblxuICAgICAgICBjb25zb2xlLmxvZygnaW5pdCB0ZXh0Jyk7XG4gICAgICAgIC8vdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAndmFsdWUnLCB0aGlzLnRleHRfZGlzcGxheWVyKHRoaXMuZGF0YS5zdGVwKSk7XG4gICAgICAgIC8vXG4gICAgICAgIFxuICAgICAgICBlbC5zY2VuZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc3BsYXlfdGV4dCcsIGRpc3BsYXlfdGV4dCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZGlzcGxheV90ZXh0KHRleHQpe1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ0FSR19URVNUJyk7XG4gICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG5cbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAndmFsdWUnLCB0ZXh0LmRldGFpbCk7XG5cbiAgICAgICAgICB2YXIgdGV4dF9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ3RleHQub3BhY2l0eScpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCAzMDAwKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMFwiKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjFcIik7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZGlyZWN0aW9uXCIsIFwiYWx0ZXJuYXRlXCIpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInJlcGVhdFwiLCAxKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJlYXNlLW91dC1leHBvXCIpO1xuXG4gICAgICAgICAgZWwuYXBwZW5kQ2hpbGQodGV4dF9hbmltYXRpb24pO1xuXG4gICAgICAgIH1cblxuICBcdFx0fSxcblxuICAgICAgdGV4dF9kaXNwbGF5ZXI6IGZ1bmN0aW9uKHN0ZXApe1xuXG4gICAgICAgIHZhciB0ZXh0X3RvX3JldHVybiA9ICcnXG4gICAgICAgIHN3aXRjaChzdGVwKXtcblxuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHRleHRfdG9fcmV0dXJuID0gdGhpcy50ZXh0X2xpc3RbMF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHRleHRfdG9fcmV0dXJuID0gdGhpcy50ZXh0X2xpc3RbMV07XG4gICAgICAgICAgICBicmVhazsgIFxuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRleHRfdG9fcmV0dXJuID0gJyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGV4dF90b19yZXR1cm5cblxuICAgICAgfSxcblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMuaW5pdCA9IFRleHRIYW5kbGVyO1xuIiwidmFyIFRvcmNoID0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0b3JjaCcsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICAgIHRhcmdldDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LFxuICAgICAgICBldmVudDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9LFxuICAgICAgICBzdGVwOiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6IDB9XG5cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICBcdFx0XHR2YXIgZWwgPSB0aGlzLmVsO1xuICBcdFx0XHR2YXIgZGF0YSA9IHRoaXMuZGF0YTtcblxuICBcdFx0XHR2YXIgX2xpZ2h0ID0gZGF0YS5saWdodDtcbiAgICAgICAgdmFyIF90YXJnZXQgPSBkYXRhLnRhcmdldDtcbiAgICAgICAgdmFyIF9ldmVudCA9IGRhdGEuZXZlbnQ7XG4gICAgICAgIHZhciBfc3RlcCA9IGRhdGEuc3RlcDtcblxuICBcdFx0XHRpZiAoX2xpZ2h0ID09IHRydWUpe1xuXG4gIFx0XHRcdFx0X2xpZ2h0ID0gJzsgbGlnaHQ6dHJ1ZSc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG4gIFx0XHRcdGVsc2V7XG4gIFx0XHRcdFxuICBcdFx0XHRcdF9saWdodCA9ICcnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuXG4gICAgICAgIGlmIChfdGFyZ2V0ICE9IG51bGwpe1xuXG4gICAgICAgICAgX3RhcmdldCA9ICc7IHRhcmdldF90b19hY3RpdmF0ZTogJyArIF90YXJnZXQ7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgX3RhcmdldCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2V2ZW50ICE9IG51bGwpe1xuXG4gICAgICAgICAgX2V2ZW50ID0gJzsgZXZlbnQ6ICcgKyBfZXZlbnQ7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgX2V2ZW50ID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfc3RlcCAhPSBudWxsKXtcblxuICAgICAgICAgIF9zdGVwID0gJzsgc3RlcDogJyArIF9zdGVwO1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF9zdGVwID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb2xsaWRlcl9lbnRpdHkgPSAnPGEtZW50aXR5IHRlbGVwb3J0PVwiYWN0aW9uOmxpZ2h0X3RvcmNoJyArIF9saWdodCArIF90YXJnZXQgKyBfZXZlbnQgKyBfc3RlcCArICdcIiBjbGFzcz1cImNvbGxpZGFibGVcIiBnZW9tZXRyeT1cIlwiIG1hdGVyaWFsPVwidHJhbnNwYXJlbnQ6IHRydWU7IG9wYWNpdHk6IDAgXCIgcG9zaXRpb249XCIwIDEuMTIgMFwiIHNjYWxlPVwiMSAyLjUgMVwiID48L2EtZW50aXR5PidcbiAgXHRcdFx0dmFyIG9iamVjdCA9ICc8YS1nbHRmLW1vZGVsIHNyYz1cIiN0b3JjaF9tb2RlbFwiPjwvYS1nbHRmLW1vZGVsPidcbiAgICAgICAgLy92YXIgb2JqZWN0ID0gJzxhLWVudGl0eSBnbHRmLW1vZGVsPVwic3JjOiB1cmwoLi4vbW9kZWxzL29iamVjdHMvdG9yY2guZ2x0Zik7XCIgPjwvYS1lbnRpdHk+J1xuICBcdFx0XHR2YXIgbGlnaHQgPSAnPGEtbGlnaHQgdHlwZT1cInBvaW50XCIgY29sb3I9XCJyZ2IoMjU1LCAxODksIDEwNSlcIiBpbnRlbnNpdHk9XCIwXCIgZGlzdGFuY2U9XCI0MFwiIHBvc2l0aW9uPVwiLTAuMDMyIDIuMDIyIC0wLjE2XCI+PC9hLWxpZ2h0PidcblxuICBcdFx0XHRlbC5pbm5lckhUTUwgPSBjb2xsaWRlcl9lbnRpdHkgKyBvYmplY3QgKyBsaWdodDtcblxuICAgIFx0fVxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5nZW5lcmF0ZSA9IFRvcmNoO1xuIiwidmFyIEludGVyYWN0aW9uID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2ludGVyYWN0aW9uLmpzJyk7XG52YXIgVG9yY2ggPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdG9yY2guanMnKTtcbi8vdmFyIEV5ZXMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvZXllcy5qcycpO1xudmFyIFRleHRIYW5kbGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcycpO1xudmFyIFF1ZXN0Ym9vayA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9xdWVzdGJvb2suanMnKTtcblxud2luZG93LmNvbnNvbGUubG9nKCdtYWluLmpzJylcbkludGVyYWN0aW9uLmluaXQoKTtcdFxuVG9yY2guZ2VuZXJhdGUoKTtcbi8vRXllcy5vcGVuX2V5ZXMoKTtcblRleHRIYW5kbGVyLmluaXQoKTtcblF1ZXN0Ym9vay5pbml0KCk7Il19
