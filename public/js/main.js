(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
      allowed: {type:'string', default:null},
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

      function check_if_allowed(){

        var value_to_return = false;

        if (data.allowed != null){

          var list_tp_allowed =data.allowed.split(',');

          list_tp_allowed.forEach(function(tp){

            if (player.getAttribute('position') == document.getElementById(tp).getAttribute('teleport', 'target').target){
              
              value_to_return = true;

            }

          })

        }
        else{

          value_to_return = true;

        }
        
        return value_to_return

      }

      function interaction_is_possible(){


        if (isIntersecting == false){

          if (data.action == 'teleport' && 
            (player.getAttribute('position') != data.target && data.disable == false) &&
            check_if_allowed()){

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

          console.log('interaction is possible !');

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
  			var light = '<a-light type="point" color="rgb(255, 169, 35)" intensity="0" distance="200" position="-0.032 2.022 -0.16"></a-light>'

  			el.innerHTML = collider_entity + object + light;

    	}

   	}); 

};

exports.generate = Torch;

},{}],5:[function(require,module,exports){
var Teleport = require('./components/teleport.js');
var Torch = require('./components/torch.js');
//var Eyes = require('./components/eyes.js');
var TextHandler = require('./components/text_handler.js');
var Questbook = require('./components/questbook.js');

window.console.log('main.js')
Teleport.launch();	
Torch.generate();
//Eyes.open_eyes();
TextHandler.init();
Questbook.init();
},{"./components/questbook.js":1,"./components/teleport.js":2,"./components/text_handler.js":3,"./components/torch.js":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9xdWVzdGJvb2suanMiLCJzcmMvY29tcG9uZW50cy90ZWxlcG9ydC5qcyIsInNyYy9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ2YXIgUXVlc3Rib29rPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3F1ZXN0Ym9vaycsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICAgc3RlcDoge3N0ZXA6J2ludCcsIGRlZmF1bHQ6MH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgY29uc29sZS5sb2coJ1FVRVNUQk9PSycpO1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcblxuICAgICAgICB2YXIgdGV4dF9kaXNwbGF5ZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zb2xlLmxvZygncXVlc3Rib29rIGxhdW5jaGVkJyk7XG4gICAgICAgIHZhciB0ZXh0X2hhbmRsZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGV4dF9oYW5kbGVyJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHRfaGFuZGxlcik7XG5cbiAgICAgICAgZWwuc2NlbmVFbC5hZGRFdmVudExpc3RlbmVyKCdwYXNzX3N0ZXAnLCBwYXNzX3N0ZXApO1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhc3Nfc3RlcChzdGVwX3N0cmluZyl7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnUEFTUyBTVEVQJyk7XG4gICAgICAgICAgY29uc29sZS5sb2codGV4dF9kaXNwbGF5ZWQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nXG5cbiAgICAgICAgICBpZiAodGV4dF9kaXNwbGF5ZWQgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgICB0ZXh0X2Rpc3BsYXllZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Yoc3RlcF9zdHJpbmcpICE9ICdzdHJpbmcnKXtcblxuICAgICAgICAgICAgICB2YXIgc3RlcCA9IHBhcnNlSW50KHN0ZXBfc3RyaW5nLmRldGFpbCk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgdmFyIHN0ZXAgPSBzdGVwX3N0cmluZztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RlcCA9PSAwKXtcblxuICAgICAgICAgICAgICB2YXIgbmV3X3N0ZXAgPSBlbC5nZXRBdHRyaWJ1dGUoJ3F1ZXN0Ym9vaycsICdzdGVwJykuc3RlcCArIDFcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICB2YXIgbmV3X3N0ZXAgPSBzdGVwXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2cobmV3X3N0ZXApXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3F1ZXN0Ym9vaycsICdzdGVwJywgbmV3X3N0ZXApO1xuICAgICAgICAgICAgdmFyIHRleHQgPSBsb2FkX3RleHQobmV3X3N0ZXApO1xuXG4gICAgICAgICAgICBpZiAodGV4dCAhPSAnISFFTkQnKXtcblxuICAgICAgICAgICAgICBlbC5lbWl0KCdkaXNwbGF5X3RleHQnLCB0ZXh0KTtcblxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICB0ZXh0X2Rpc3BsYXllZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHBhc3Nfc3RlcCgnMCcpOyAgXG5cbiAgICAgICAgICAgICAgfSwgNjAwMCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZF90ZXh0KHN0ZXApe1xuXG4gICAgICAgICAgc3dpdGNoKHN0ZXApe1xuXG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIHJldHVybiAndGVzdCc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIHJldHVybiAndGVzdDInO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICchIUVORCc7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9LFxuXG4gICAgXG4gICAgICB0ZXN0X2Z1bmN0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZygndGVzdCBzdWNjZXNzZnVsbCAhJyk7XG4gICAgICB9LFxuXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKG9sZERhdGEpe1xuXG4gICAgICB9XG5cblxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5pbml0ID0gUXVlc3Rib29rOyIsInZhciBUZWxlcG9ydD0gZnVuY3Rpb24oKXtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICBBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RlbGVwb3J0Jywge1xuICAgIGRlcGVuZGVuY2llczogWydyYXljYXN0ZXInXSxcbiAgICBzY2hlbWE6IHtcbiAgICAgIHRhcmdldDoge3R5cGU6ICd2ZWMzJ30sXG4gICAgICBhY3Rpb246IHt0eXBlOiAnc3RyaW5nJ30sXG4gICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJ30sXG4gICAgICB0YXJnZXRfdG9fYWN0aXZhdGU6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSxcbiAgICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICBkaXNhYmxlOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgIGFsbG93ZWQ6IHt0eXBlOidzdHJpbmcnLCBkZWZhdWx0Om51bGx9LFxuICAgICAgc3RlcDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OjB9XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgICB2YXIgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgdmFyIGdsb2JhbF90aW1lciA9IDA7XG5cbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhXG4gICAgICB0aGlzLmRhdGFfdGVzdCA9IHRoaXMuZGF0YVxuICAgICAgXG4gICAgICB2YXIgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbGVwb3J0X2xvYWRlcicpO1xuICAgICAgdmFyIGFjdGlvbl90b19wZXJmb3JtID0gbnVsbDtcblxuICAgICAgdmFyIHF1ZXN0Ym9vayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGJvb2snKVxuXG4gICAgICBpZiAoZGF0YS5hY3Rpb24gPT0gJ3RlbGVwb3J0Jyl7XG5cbiAgICAgICAgdmFyIHRpbWVyX2JsYWNrX3NjcmVlbiA9IDA7XG4gICAgICAgIHZhciBwbGF5ZXIgPSAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJcIik7XG4gICAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrX3NjcmVlblwiKTtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IHRlbGVwb3J0XG5cblxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0Jyl7XG5cbiAgICAgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBpbnRlcmFjdFxuXG4gICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnbGlnaHRfdG9yY2gnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGxpZ2h0X3RvcmNoXG5cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEubGlnaHQgPT0gdHJ1ZSl7XG5cbiAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQoZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0JykpO1xuXG4gICAgICB9XG4gICAgICBlbHNle1xuXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkKTtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQtY2xlYXJlZCcsIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKTsgXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2hlY2tfaWZfYWxsb3dlZCgpe1xuXG4gICAgICAgIHZhciB2YWx1ZV90b19yZXR1cm4gPSBmYWxzZTtcblxuICAgICAgICBpZiAoZGF0YS5hbGxvd2VkICE9IG51bGwpe1xuXG4gICAgICAgICAgdmFyIGxpc3RfdHBfYWxsb3dlZCA9ZGF0YS5hbGxvd2VkLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICBsaXN0X3RwX2FsbG93ZWQuZm9yRWFjaChmdW5jdGlvbih0cCl7XG5cbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldCl7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB2YWx1ZV90b19yZXR1cm4gPSB0cnVlO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIHZhbHVlX3RvX3JldHVybiA9IHRydWU7XG5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHZhbHVlX3RvX3JldHVyblxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCl7XG5cblxuICAgICAgICBpZiAoaXNJbnRlcnNlY3RpbmcgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcgJiYgXG4gICAgICAgICAgICAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSAhPSBkYXRhLnRhcmdldCAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2UpICYmXG4gICAgICAgICAgICBjaGVja19pZl9hbGxvd2VkKCkpe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnIHx8IGRhdGEuYWN0aW9uID09IFwibGlnaHRfdG9yY2hcIikgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH0gXG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGV2ZW50X2hhbmRsZXIoKXtcblxuICAgICAgICBpZiAoZGF0YS5ldmVudCl7IFxuXG4gICAgICAgICAgY29uc29sZS5sb2coJ2V2ZW50IGhhbmRsZXIgZnJvbSB0ZWxlcG9ydCcpO1xuICAgICAgICAgIC8vcXVlc3Rib29rLnNldEF0dHJpYnV0ZSgncXVlc3Rib29rJywgJ3N0ZXAnLCAxMDApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHF1ZXN0Ym9vayk7XG4gICAgICAgICAgY29uc29sZS5sb2coZGF0YS5zdGVwKTtcbiAgICAgICAgICB2YXIgc3RlcCA9IGRhdGEuc3RlcC50b1N0cmluZygpO1xuICAgICAgICAgIGVsLmVtaXQoJ3Bhc3Nfc3RlcCcsIHN0ZXApOyBcblxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkKCl7XG5cbiAgICAgICAgaWYgKGludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCkpe1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ2ludGVyYWN0aW9uIGlzIHBvc3NpYmxlICEnKTtcblxuICAgICAgICAgIGlzSW50ZXJzZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICBcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgICAgZ2xvYmFsX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgIGFjdGlvbl90b19wZXJmb3JtKCkgXG4gICAgICAgICAgICAgIGV2ZW50X2hhbmRsZXIoKTtcblxuICAgICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKXtcblxuICAgICAgICBpZiAoZ2xvYmFsX3RpbWVyKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZ2xvYmFsX3RpbWVyKTtcbiAgICAgICAgICBnbG9iYWxfdGltZXI9MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdCgpe1xuXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnZ3JlZW4nKTtcbiAgICAgICAgZGF0YS5kaXNhYmxlID0gdHJ1ZTtcbiAgICAgICAgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0ZWxlcG9ydCgpe1xuXG4gICAgICAgIHNob3dfYmxhY2tfc2NyZWVuKClcbiAgICAgICAgc2V0VGltZW91dChoaWRlX2JsYWNrX3NjcmVlbiwgMTAwMCk7IFxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNob3dfYmxhY2tfc2NyZWVuKCl7XG5cbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbl9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnb3BhY2l0eScpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwidG9cIiwgXCIxXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImxpbmVhclwiKTtcblxuICAgICAgICBibGFja19zY3JlZW4uYXBwZW5kQ2hpbGQoYmxhY2tfc2NyZWVuX2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGlkZV9ibGFja19zY3JlZW4oKXtcbiAgICAgICAgXG4gICAgICAgIHBsYXllci5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgZGF0YS50YXJnZXQgKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBibGFja19zY3JlZW5fYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ29wYWNpdHknKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIxXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMFwiKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgYmxhY2tfc2NyZWVuLmFwcGVuZENoaWxkKGJsYWNrX3NjcmVlbl9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMTAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwidG9cIiwgXCIxLjZcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQodGFyZ2V0KXtcblxuICAgICAgICB2YXIgbGlnaHRfYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnaW50ZW5zaXR5Jyk7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIzMDAwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjEuOFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMi41XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZGlyZWN0aW9uXCIsIFwiYWx0ZXJuYXRlXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZWFzaW5nXCIsIFwiZWFzZS1pbi1vdXQtZWxhc3RpY1wiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInJlcGVhdFwiLCBcImluZGVmaW5pdGVcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwiZm9yd2FyZHNcIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cbiBcbiAgICAgIGZ1bmN0aW9uIGxpZ2h0X3RvcmNoKCApe1xuXG4gICAgICAgIGludGVyYWN0KGRhdGEpO1xuXG4gICAgICAgIGlmIChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSAhPSBudWxsKSB7XG5cbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkuc2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICdkaXNhYmxlJywgZmFsc2UpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGlnaHRfb2JqZWN0ID0gZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0Jyk7XG4gICAgICAgIFxuICAgICAgICBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbihsaWdodF9vYmplY3QpXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIGxpZ2h0X29iamVjdC5yZW1vdmVDaGlsZChsaWdodF9vYmplY3QucXVlcnlTZWxlY3RvcignYS1hbmltYXRpb24nKSk7XG4gICAgICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChsaWdodF9vYmplY3QpXG5cbiAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICB9KTtcblxuICAgICAgfVxuXG4gICAgfSwgXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgfSxcblxuXG4gICAgaW50ZXJzZWN0SGFuZGxlcjogZnVuY3Rpb24oKXtcblxuICAgICAgXG4gICAgfSxcblxuICAgIGludGVyc2VjdFJlbW92YWxIYW5kbGVyOiBmdW5jdGlvbigpe1xuXG5cblxuICAgIH0sXG5cblxuICAgIHRlbGVwb3J0Q2hhcmFjdGVyOiBmdW5jdGlvbihlbCwgcGxheWVyKXtcblxuXG4gICAgfVxuXG4gIH0pOyBcblxufTtcblxuZXhwb3J0cy5sYXVuY2ggPSBUZWxlcG9ydDsiLCJ2YXIgVGV4dEhhbmRsZXIgPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RleHRfaGFuZGxlcicsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBzdGVwOiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6MH0sXG4gICAgICAgIHRleHRfbGlzdDoge3R5cGU6ICdhcnJheScsIGRlZmF1bHQ6IFtdfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBlbCA9IHRoaXMuZWwgICAgICAgIFxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdpbml0IHRleHQnKTtcbiAgICAgICAgLy90aGlzLmVsLnNldEF0dHJpYnV0ZSgndGV4dCcsICd2YWx1ZScsIHRoaXMudGV4dF9kaXNwbGF5ZXIodGhpcy5kYXRhLnN0ZXApKTtcbiAgICAgICAgLy9cbiAgICAgICAgXG4gICAgICAgIGVsLnNjZW5lRWwuYWRkRXZlbnRMaXN0ZW5lcignZGlzcGxheV90ZXh0JywgZGlzcGxheV90ZXh0KTtcblxuICAgICAgICBmdW5jdGlvbiBkaXNwbGF5X3RleHQodGV4dCl7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnQVJHX1RFU1QnKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcblxuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgndGV4dCcsICd2YWx1ZScsIHRleHQuZGV0YWlsKTtcblxuICAgICAgICAgIHZhciB0ZXh0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAndGV4dC5vcGFjaXR5Jyk7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIDMwMDApO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwXCIpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMVwiKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkaXJlY3Rpb25cIiwgXCJhbHRlcm5hdGVcIik7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwicmVwZWF0XCIsIDEpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImVhc2Utb3V0LWV4cG9cIik7XG5cbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZCh0ZXh0X2FuaW1hdGlvbik7XG5cbiAgICAgICAgfVxuXG4gIFx0XHR9LFxuXG4gICAgICB0ZXh0X2Rpc3BsYXllcjogZnVuY3Rpb24oc3RlcCl7XG5cbiAgICAgICAgdmFyIHRleHRfdG9fcmV0dXJuID0gJydcbiAgICAgICAgc3dpdGNoKHN0ZXApe1xuXG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSB0aGlzLnRleHRfbGlzdFswXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSB0aGlzLnRleHRfbGlzdFsxXTtcbiAgICAgICAgICAgIGJyZWFrOyAgXG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSAnJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0ZXh0X3RvX3JldHVyblxuXG4gICAgICB9LFxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5pbml0ID0gVGV4dEhhbmRsZXI7XG4iLCJ2YXIgVG9yY2ggPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RvcmNoJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgICAgdGFyZ2V0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICAgIHN0ZXA6IHt0eXBlOiAnaW50JywgZGVmYXVsdDogMH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICBcdFx0XHR2YXIgZWwgPSB0aGlzLmVsO1xuICBcdFx0XHR2YXIgZGF0YSA9IHRoaXMuZGF0YTtcblxuICBcdFx0XHR2YXIgX2xpZ2h0ID0gZGF0YS5saWdodDtcbiAgICAgICAgdmFyIF90YXJnZXQgPSBkYXRhLnRhcmdldDtcbiAgICAgICAgdmFyIF9ldmVudCA9IGRhdGEuZXZlbnQ7XG4gICAgICAgIHZhciBfc3RlcCA9IGRhdGEuc3RlcDtcblxuICBcdFx0XHRpZiAoX2xpZ2h0ID09IHRydWUpe1xuXG4gIFx0XHRcdFx0X2xpZ2h0ID0gJzsgbGlnaHQ6dHJ1ZSc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG4gIFx0XHRcdGVsc2V7XG4gIFx0XHRcdFxuICBcdFx0XHRcdF9saWdodCA9ICcnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuXG4gICAgICAgIGlmIChfdGFyZ2V0ICE9IG51bGwpe1xuXG4gICAgICAgICAgX3RhcmdldCA9ICc7IHRhcmdldF90b19hY3RpdmF0ZTogJyArIF90YXJnZXQ7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgX3RhcmdldCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2V2ZW50ICE9IG51bGwpe1xuXG4gICAgICAgICAgX2V2ZW50ID0gJzsgZXZlbnQ6ICcgKyBfZXZlbnQ7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgX2V2ZW50ID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfc3RlcCAhPSBudWxsKXtcblxuICAgICAgICAgIF9zdGVwID0gJzsgc3RlcDogJyArIF9zdGVwO1xuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF9zdGVwID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb2xsaWRlcl9lbnRpdHkgPSAnPGEtZW50aXR5IHRlbGVwb3J0PVwiYWN0aW9uOmxpZ2h0X3RvcmNoJyArIF9saWdodCArIF90YXJnZXQgKyBfZXZlbnQgKyBfc3RlcCArICdcIiBjbGFzcz1cImNvbGxpZGFibGVcIiBnZW9tZXRyeT1cIlwiIG1hdGVyaWFsPVwidHJhbnNwYXJlbnQ6IHRydWU7IG9wYWNpdHk6IDAgXCIgcG9zaXRpb249XCIwIDEuMTIgMFwiIHNjYWxlPVwiMSAyLjUgMVwiID48L2EtZW50aXR5PidcbiAgXHRcdFx0dmFyIG9iamVjdCA9ICc8YS1nbHRmLW1vZGVsIHNyYz1cIiN0b3JjaF9tb2RlbFwiPjwvYS1nbHRmLW1vZGVsPidcbiAgICAgICAgLy92YXIgb2JqZWN0ID0gJzxhLWVudGl0eSBnbHRmLW1vZGVsPVwic3JjOiB1cmwoLi4vbW9kZWxzL29iamVjdHMvdG9yY2guZ2x0Zik7XCIgPjwvYS1lbnRpdHk+J1xuICBcdFx0XHR2YXIgbGlnaHQgPSAnPGEtbGlnaHQgdHlwZT1cInBvaW50XCIgY29sb3I9XCJyZ2IoMjU1LCAxNjksIDM1KVwiIGludGVuc2l0eT1cIjBcIiBkaXN0YW5jZT1cIjIwMFwiIHBvc2l0aW9uPVwiLTAuMDMyIDIuMDIyIC0wLjE2XCI+PC9hLWxpZ2h0PidcblxuICBcdFx0XHRlbC5pbm5lckhUTUwgPSBjb2xsaWRlcl9lbnRpdHkgKyBvYmplY3QgKyBsaWdodDtcblxuICAgIFx0fVxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5nZW5lcmF0ZSA9IFRvcmNoO1xuIiwidmFyIFRlbGVwb3J0ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RlbGVwb3J0LmpzJyk7XG52YXIgVG9yY2ggPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdG9yY2guanMnKTtcbi8vdmFyIEV5ZXMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvZXllcy5qcycpO1xudmFyIFRleHRIYW5kbGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcycpO1xudmFyIFF1ZXN0Ym9vayA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9xdWVzdGJvb2suanMnKTtcblxud2luZG93LmNvbnNvbGUubG9nKCdtYWluLmpzJylcblRlbGVwb3J0LmxhdW5jaCgpO1x0XG5Ub3JjaC5nZW5lcmF0ZSgpO1xuLy9FeWVzLm9wZW5fZXllcygpO1xuVGV4dEhhbmRsZXIuaW5pdCgpO1xuUXVlc3Rib29rLmluaXQoKTsiXX0=
