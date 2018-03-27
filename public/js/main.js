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
var Teleport= function(){

  "use strict";

  AFRAME.registerComponent('teleport', {
    dependencies: ['raycaster'],
    schema: {
      target: {type: 'vec3'},
      action: {type: 'string'},
      light: {type: 'boolean'},
      disable: {type: 'boolean', default:false},
      target_to_activate: {type: 'string', default:null}
    },

    init: function () {
      var el = this.el;
      var isIntersecting = false;

      var global_timer = 0;

      var data = this.data
      this.data_test = this.data
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null;

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
      
      function raycaster_intersected(){

        if (interaction_is_possible()){

          isIntersecting = true;
          loader.style.display = "block";
          
          requestAnimationFrame(function(timestamp){

            global_timer = setTimeout(function(){ action_to_perform() }, 1000);

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
	      step: {type: 'int', default:1},
        text_list: {type: 'array', default: []}
	    },

  		init:function(){

        var text_list = load_text_list()

        console.log('init text');
        this.el.setAttribute('text', 'value', text_displayer(this.data.step));



        function load_text_list(){

          return [
            'Test de texte1',
            'Test de texte2'
          ]

        }

        function text_displayer(step){

          var text_to_return = ''
          switch(step){

            case 0:
              text_to_return = text_list[0];
              break;

            case 1:
              text_to_return = text_list[1];
              break;

            default:
              text_to_return = '';
              break;
          
          }

          return text_to_return

        }

  		}

   	}); 

};

exports.init = TextHandler;

},{}],4:[function(require,module,exports){
var Torch = function(){

  	"use strict";

  	AFRAME.registerComponent('torch', {
	  	schema: {
	      light: {type: 'boolean', default:false},
        target: {type: 'string', default:null}
	    },

  		init:function(){

  			var el = this.el;
  			var data = this.data;

  			var _light = data.light;
        var _target = data.target;

  			if (_light == true){

  				_light = '; light:true';
  			
  			}
  			else{
  			
  				_light = '';
  			
  			}

        if (_target != null){

          _target = '; target_to_activate: ' + _target

        }
        else{

          _target = '';

        }

      var collider_entity = '<a-entity teleport="action:light_torch' + _light + _target + '" class="collidable" geometry="" material="transparent: true; opacity: 0 " position="0 0.45 0" scale="0.2 2.3 0.2" ></a-entity>'
			var object = '<a-gltf-model src="#torch_model"></a-gltf-model>'
      //var object = '<a-entity gltf-model="src: url(../models/objects/torch.gltf);" ></a-entity>'
			var light = '<a-light type="point" color="rgb(255, 169, 35)" intensity="0" distance="200" position="0 1.541 0"></a-light>'

			el.innerHTML = collider_entity + object + light;

  		}

   	}); 

};

exports.generate = Torch;

},{}],5:[function(require,module,exports){
var Teleport = require('./components/teleport.js');
var Torch = require('./components/torch.js');
var Eyes = require('./components/eyes.js');
var TextHandler = require('./components/text_handler.js');

window.console.log('main.js')
Teleport.launch();	
Torch.generate();
Eyes.open_eyes();
TextHandler.init();
},{"./components/eyes.js":1,"./components/teleport.js":2,"./components/text_handler.js":3,"./components/torch.js":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9leWVzLmpzIiwic3JjL2NvbXBvbmVudHMvdGVsZXBvcnQuanMiLCJzcmMvY29tcG9uZW50cy90ZXh0X2hhbmRsZXIuanMiLCJzcmMvY29tcG9uZW50cy90b3JjaC5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsInZhciBFeWVzPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2V5ZXMnLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9LFxuICAgICAgICB0YXJnZXQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBvZmZzZXRfeV9heGlzID0gMDtcbiAgICAgICAgdmFyIHByZXZpb3VzX29mZnNldF95X2F4aXMgPSAwO1xuICAgICAgICB2YXIgZGVjcmVhc2luZyA9IDAuMDFcbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxhY2tfc2NyZWVuXCIpO1xuICAgICAgICAvL2JsYWNrX3NjcmVlbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsgXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG4gICAgICAgICAgdmFyIHRpbWVyID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcicpLmdldEF0dHJpYnV0ZSgncm90YXRpb24nKTtcbiAgICAgICAgICAgIG9mZnNldF95X2F4aXMgKz0gKE1hdGguYWJzKHJvdGF0aW9uLnkgLSBwcmV2aW91c19vZmZzZXRfeV9heGlzKSAvIDIwMCk7XG4gICAgICAgICAgICBwcmV2aW91c19vZmZzZXRfeV9heGlzID0gcm90YXRpb24ueTtcblxuICAgICAgICAgICAgaWYob2Zmc2V0X3lfYXhpcyA+IDEpe1xuXG4gICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRpbWVyKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2Zmc2V0X3lfYXhpcyA+IDApe1xuXG4gICAgICAgICAgICAgIG9mZnNldF95X2F4aXMgLT0gZGVjcmVhc2luZztcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICBvZmZzZXRfeV9heGlzID0gMFxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJsYWNrX3NjcmVlbi5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAxIC0gb2Zmc2V0X3lfYXhpcyk7XG5cbiAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMub3Blbl9leWVzID0gRXllczsiLCJ2YXIgVGVsZXBvcnQ9IGZ1bmN0aW9uKCl7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZWxlcG9ydCcsIHtcbiAgICBkZXBlbmRlbmNpZXM6IFsncmF5Y2FzdGVyJ10sXG4gICAgc2NoZW1hOiB7XG4gICAgICB0YXJnZXQ6IHt0eXBlOiAndmVjMyd9LFxuICAgICAgYWN0aW9uOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbid9LFxuICAgICAgZGlzYWJsZToge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICB0YXJnZXRfdG9fYWN0aXZhdGU6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfVxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgdmFyIGlzSW50ZXJzZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgIHZhciBnbG9iYWxfdGltZXIgPSAwO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVxuICAgICAgdGhpcy5kYXRhX3Rlc3QgPSB0aGlzLmRhdGFcbiAgICAgIFxuICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZWxlcG9ydF9sb2FkZXInKTtcbiAgICAgIHZhciBhY3Rpb25fdG9fcGVyZm9ybSA9IG51bGw7XG5cbiAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnKXtcblxuICAgICAgICB2YXIgdGltZXJfYmxhY2tfc2NyZWVuID0gMDtcbiAgICAgICAgdmFyIHBsYXllciA9ICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllclwiKTtcbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxhY2tfc2NyZWVuXCIpO1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gdGVsZXBvcnRcblxuXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGludGVyYWN0XG5cbiAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdsaWdodF90b3JjaCcpe1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gbGlnaHRfdG9yY2hcblxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5saWdodCA9PSB0cnVlKXtcblxuICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKSk7XG5cbiAgICAgIH1cbiAgICAgIGVsc2V7XG5cbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWQpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZC1jbGVhcmVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQpOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpe1xuXG5cblxuICAgICAgICBpZiAoaXNJbnRlcnNlY3RpbmcgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcgJiYgKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgIT0gZGF0YS50YXJnZXQgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoKGRhdGEuYWN0aW9uID09ICdpbnRlcmFjdCcgfHwgZGF0YS5hY3Rpb24gPT0gXCJsaWdodF90b3JjaFwiKSAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfSBcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkKCl7XG5cbiAgICAgICAgaWYgKGludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCkpe1xuXG4gICAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSB0cnVlO1xuICAgICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgIFxuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgICBnbG9iYWxfdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGFjdGlvbl90b19wZXJmb3JtKCkgfSwgMTAwMCk7XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKXtcblxuICAgICAgICBpZiAoZ2xvYmFsX3RpbWVyKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZ2xvYmFsX3RpbWVyKTtcbiAgICAgICAgICBnbG9iYWxfdGltZXI9MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdCgpe1xuXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnZ3JlZW4nKTtcbiAgICAgICAgZGF0YS5kaXNhYmxlID0gdHJ1ZTtcbiAgICAgICAgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0ZWxlcG9ydCgpe1xuXG4gICAgICAgIHNob3dfYmxhY2tfc2NyZWVuKClcbiAgICAgICAgc2V0VGltZW91dChoaWRlX2JsYWNrX3NjcmVlbiwgMTAwMCk7IFxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNob3dfYmxhY2tfc2NyZWVuKCl7XG5cbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbl9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnb3BhY2l0eScpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwidG9cIiwgXCIxXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImxpbmVhclwiKTtcblxuICAgICAgICBibGFja19zY3JlZW4uYXBwZW5kQ2hpbGQoYmxhY2tfc2NyZWVuX2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGlkZV9ibGFja19zY3JlZW4oKXtcbiAgICAgICAgXG4gICAgICAgIHBsYXllci5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgZGF0YS50YXJnZXQgKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBibGFja19zY3JlZW5fYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ29wYWNpdHknKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIxXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMFwiKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgYmxhY2tfc2NyZWVuLmFwcGVuZENoaWxkKGJsYWNrX3NjcmVlbl9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMTAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwidG9cIiwgXCIxLjZcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQodGFyZ2V0KXtcblxuICAgICAgICB2YXIgbGlnaHRfYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnaW50ZW5zaXR5Jyk7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIzMDAwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjEuOFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMi41XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZGlyZWN0aW9uXCIsIFwiYWx0ZXJuYXRlXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZWFzaW5nXCIsIFwiZWFzZS1pbi1vdXQtZWxhc3RpY1wiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInJlcGVhdFwiLCBcImluZGVmaW5pdGVcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwiZm9yd2FyZHNcIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cbiBcbiAgICAgIGZ1bmN0aW9uIGxpZ2h0X3RvcmNoKCApe1xuXG4gICAgICAgIGludGVyYWN0KGRhdGEpO1xuXG4gICAgICAgIGlmIChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSAhPSBudWxsKSB7XG5cbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkuc2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICdkaXNhYmxlJywgZmFsc2UpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGlnaHRfb2JqZWN0ID0gZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0Jyk7XG4gICAgICAgIFxuICAgICAgICBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbihsaWdodF9vYmplY3QpXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIGxpZ2h0X29iamVjdC5yZW1vdmVDaGlsZChsaWdodF9vYmplY3QucXVlcnlTZWxlY3RvcignYS1hbmltYXRpb24nKSk7XG4gICAgICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChsaWdodF9vYmplY3QpXG5cbiAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICB9KTtcblxuICAgICAgfVxuXG4gICAgfSwgXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgfSxcblxuXG4gICAgaW50ZXJzZWN0SGFuZGxlcjogZnVuY3Rpb24oKXtcblxuICAgICAgXG4gICAgfSxcblxuICAgIGludGVyc2VjdFJlbW92YWxIYW5kbGVyOiBmdW5jdGlvbigpe1xuXG5cblxuICAgIH0sXG5cblxuICAgIHRlbGVwb3J0Q2hhcmFjdGVyOiBmdW5jdGlvbihlbCwgcGxheWVyKXtcblxuXG4gICAgfVxuXG4gIH0pOyBcblxufTtcblxuZXhwb3J0cy5sYXVuY2ggPSBUZWxlcG9ydDsiLCJ2YXIgVGV4dEhhbmRsZXIgPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RleHRfaGFuZGxlcicsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBzdGVwOiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6MX0sXG4gICAgICAgIHRleHRfbGlzdDoge3R5cGU6ICdhcnJheScsIGRlZmF1bHQ6IFtdfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciB0ZXh0X2xpc3QgPSBsb2FkX3RleHRfbGlzdCgpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ2luaXQgdGV4dCcpO1xuICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgndGV4dCcsICd2YWx1ZScsIHRleHRfZGlzcGxheWVyKHRoaXMuZGF0YS5zdGVwKSk7XG5cblxuXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRfdGV4dF9saXN0KCl7XG5cbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgJ1Rlc3QgZGUgdGV4dGUxJyxcbiAgICAgICAgICAgICdUZXN0IGRlIHRleHRlMidcbiAgICAgICAgICBdXG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHRleHRfZGlzcGxheWVyKHN0ZXApe1xuXG4gICAgICAgICAgdmFyIHRleHRfdG9fcmV0dXJuID0gJydcbiAgICAgICAgICBzd2l0Y2goc3RlcCl7XG5cbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSB0ZXh0X2xpc3RbMF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIHRleHRfdG9fcmV0dXJuID0gdGV4dF9saXN0WzFdO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSAnJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRleHRfdG9fcmV0dXJuXG5cbiAgICAgICAgfVxuXG4gIFx0XHR9XG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmluaXQgPSBUZXh0SGFuZGxlcjtcbiIsInZhciBUb3JjaCA9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndG9yY2gnLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9LFxuICAgICAgICB0YXJnZXQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gIFx0XHRcdHZhciBlbCA9IHRoaXMuZWw7XG4gIFx0XHRcdHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXG4gIFx0XHRcdHZhciBfbGlnaHQgPSBkYXRhLmxpZ2h0O1xuICAgICAgICB2YXIgX3RhcmdldCA9IGRhdGEudGFyZ2V0O1xuXG4gIFx0XHRcdGlmIChfbGlnaHQgPT0gdHJ1ZSl7XG5cbiAgXHRcdFx0XHRfbGlnaHQgPSAnOyBsaWdodDp0cnVlJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cbiAgXHRcdFx0ZWxzZXtcbiAgXHRcdFx0XG4gIFx0XHRcdFx0X2xpZ2h0ID0gJyc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG5cbiAgICAgICAgaWYgKF90YXJnZXQgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJzsgdGFyZ2V0X3RvX2FjdGl2YXRlOiAnICsgX3RhcmdldFxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgIHZhciBjb2xsaWRlcl9lbnRpdHkgPSAnPGEtZW50aXR5IHRlbGVwb3J0PVwiYWN0aW9uOmxpZ2h0X3RvcmNoJyArIF9saWdodCArIF90YXJnZXQgKyAnXCIgY2xhc3M9XCJjb2xsaWRhYmxlXCIgZ2VvbWV0cnk9XCJcIiBtYXRlcmlhbD1cInRyYW5zcGFyZW50OiB0cnVlOyBvcGFjaXR5OiAwIFwiIHBvc2l0aW9uPVwiMCAwLjQ1IDBcIiBzY2FsZT1cIjAuMiAyLjMgMC4yXCIgPjwvYS1lbnRpdHk+J1xuXHRcdFx0dmFyIG9iamVjdCA9ICc8YS1nbHRmLW1vZGVsIHNyYz1cIiN0b3JjaF9tb2RlbFwiPjwvYS1nbHRmLW1vZGVsPidcbiAgICAgIC8vdmFyIG9iamVjdCA9ICc8YS1lbnRpdHkgZ2x0Zi1tb2RlbD1cInNyYzogdXJsKC4uL21vZGVscy9vYmplY3RzL3RvcmNoLmdsdGYpO1wiID48L2EtZW50aXR5Pidcblx0XHRcdHZhciBsaWdodCA9ICc8YS1saWdodCB0eXBlPVwicG9pbnRcIiBjb2xvcj1cInJnYigyNTUsIDE2OSwgMzUpXCIgaW50ZW5zaXR5PVwiMFwiIGRpc3RhbmNlPVwiMjAwXCIgcG9zaXRpb249XCIwIDEuNTQxIDBcIj48L2EtbGlnaHQ+J1xuXG5cdFx0XHRlbC5pbm5lckhUTUwgPSBjb2xsaWRlcl9lbnRpdHkgKyBvYmplY3QgKyBsaWdodDtcblxuICBcdFx0fVxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5nZW5lcmF0ZSA9IFRvcmNoO1xuIiwidmFyIFRlbGVwb3J0ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RlbGVwb3J0LmpzJyk7XG52YXIgVG9yY2ggPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdG9yY2guanMnKTtcbnZhciBFeWVzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2V5ZXMuanMnKTtcbnZhciBUZXh0SGFuZGxlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZXh0X2hhbmRsZXIuanMnKTtcblxud2luZG93LmNvbnNvbGUubG9nKCdtYWluLmpzJylcblRlbGVwb3J0LmxhdW5jaCgpO1x0XG5Ub3JjaC5nZW5lcmF0ZSgpO1xuRXllcy5vcGVuX2V5ZXMoKTtcblRleHRIYW5kbGVyLmluaXQoKTsiXX0=
