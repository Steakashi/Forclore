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
        var black_screen = document.getElementById("blackscreen");
        //black_screen.style.display = 'block';

        requestAnimationFrame(function(timestamp){
          window.setInterval(function(){
        
            var rotation = document.getElementById('player').getAttribute('rotation');
            offset_y_axis += (Math.abs(rotation.y - previous_offset_y_axis) / 200);
            console.log(offset_y_axis);
            previous_offset_y_axis = rotation.y;

            if (offset_y_axis > 0){

              offset_y_axis -= decreasing;

            }
            else{

              offset_y_axis = 0

            }

            black_screen.setAttribute('material', 'opacity', 1 - offset_y_axis);

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

        var timer_blackscreen = 0;
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

        black_screen.style.display = 'block';
        black_screen.style.webkitAnimationName = 'add_opacity';
        black_screen.style.webkitAnimationDuration = '1s';

      }

      function hide_black_screen(){

        
        player.setAttribute('position', data.target );
        
        black_screen.style.webkitAnimationName = 'remove_opacity';
        black_screen.style.webkitAnimationDuration = '1s';

        setTimeout(function(){

          black_screen.style.display = 'none';
          black_screen.style.opacity = 0;

        }, 1000)

      }

      function create_light_transition(target){

        var light_animation = document.createElement('a-animation');

        light_animation.setAttribute('attribute', 'intensity');
        light_animation.setAttribute("dur", "1000");
        light_animation.setAttribute("from", "0");
        light_animation.setAttribute("to", "1.6");
        light_animation.setAttribute("esing", "easeIn");

        target.appendChild(light_animation);

      }

      function create_light_animation_repeat(target){

        var light_animation = document.createElement('a-animation');

        light_animation.setAttribute('attribute', 'intensity');
        light_animation.setAttribute("dur", "3000");
        light_animation.setAttribute("from", "1.8");
        light_animation.setAttribute("to", "2.5");
        light_animation.setAttribute("direction", "alternate");
        light_animation.setAttribute("esing", "easeInOutElastic");
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
var Torch= function(){

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
			var object = '<a-obj-model src="public/models/objects/firetorch.obj" obj-model="public/models/objects/firetorch.obj" scale="0.02 0.02 0.02" material=""></a-obj-model>'
			var light = '<a-light type="point" color="rgb(255, 169, 35)" intensity="0" distance="200" position="0 1.541 0"></a-light>'

			el.innerHTML = collider_entity + object + light;

  		}

   	}); 

};

exports.generate = Torch;

},{}],4:[function(require,module,exports){
var Teleport = require('./components/teleport.js');
var Torch = require('./components/torch.js');
var Eyes = require('./components/eyes.js')

window.console.log('main.js')
Teleport.launch();	
Torch.generate();
Eyes.open_eyes();
},{"./components/eyes.js":1,"./components/teleport.js":2,"./components/torch.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9leWVzLmpzIiwic3JjL2NvbXBvbmVudHMvdGVsZXBvcnQuanMiLCJzcmMvY29tcG9uZW50cy90b3JjaC5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ2YXIgRXllcz0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdleWVzJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgICAgdGFyZ2V0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgb2Zmc2V0X3lfYXhpcyA9IDA7XG4gICAgICAgIHZhciBwcmV2aW91c19vZmZzZXRfeV9heGlzID0gMDtcbiAgICAgICAgdmFyIGRlY3JlYXNpbmcgPSAwLjAxXG4gICAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrc2NyZWVuXCIpO1xuICAgICAgICAvL2JsYWNrX3NjcmVlbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcbiAgICAgICAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgXG4gICAgICAgICAgICB2YXIgcm90YXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyJykuZ2V0QXR0cmlidXRlKCdyb3RhdGlvbicpO1xuICAgICAgICAgICAgb2Zmc2V0X3lfYXhpcyArPSAoTWF0aC5hYnMocm90YXRpb24ueSAtIHByZXZpb3VzX29mZnNldF95X2F4aXMpIC8gMjAwKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9mZnNldF95X2F4aXMpO1xuICAgICAgICAgICAgcHJldmlvdXNfb2Zmc2V0X3lfYXhpcyA9IHJvdGF0aW9uLnk7XG5cbiAgICAgICAgICAgIGlmIChvZmZzZXRfeV9heGlzID4gMCl7XG5cbiAgICAgICAgICAgICAgb2Zmc2V0X3lfYXhpcyAtPSBkZWNyZWFzaW5nO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgIG9mZnNldF95X2F4aXMgPSAwXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmxhY2tfc2NyZWVuLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnb3BhY2l0eScsIDEgLSBvZmZzZXRfeV9heGlzKTtcblxuICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMub3Blbl9leWVzID0gRXllczsiLCJ2YXIgVGVsZXBvcnQ9IGZ1bmN0aW9uKCl7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZWxlcG9ydCcsIHtcbiAgICBkZXBlbmRlbmNpZXM6IFsncmF5Y2FzdGVyJ10sXG4gICAgc2NoZW1hOiB7XG4gICAgICB0YXJnZXQ6IHt0eXBlOiAndmVjMyd9LFxuICAgICAgYWN0aW9uOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbid9LFxuICAgICAgZGlzYWJsZToge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICB0YXJnZXRfdG9fYWN0aXZhdGU6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfVxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgdmFyIGlzSW50ZXJzZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgIHZhciBnbG9iYWxfdGltZXIgPSAwO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVxuICAgICAgdGhpcy5kYXRhX3Rlc3QgPSB0aGlzLmRhdGFcbiAgICAgIFxuICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZWxlcG9ydF9sb2FkZXInKTtcbiAgICAgIHZhciBhY3Rpb25fdG9fcGVyZm9ybSA9IG51bGw7XG5cbiAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnKXtcblxuICAgICAgICB2YXIgdGltZXJfYmxhY2tzY3JlZW4gPSAwO1xuICAgICAgICB2YXIgcGxheWVyID0gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyXCIpO1xuICAgICAgICB2YXIgYmxhY2tfc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibGFja19zY3JlZW5cIik7XG5cbiAgICAgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSB0ZWxlcG9ydFxuXG5cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdpbnRlcmFjdCcpe1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gaW50ZXJhY3RcblxuICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZGF0YS5hY3Rpb24gPT0gJ2xpZ2h0X3RvcmNoJyl7XG5cbiAgICAgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBsaWdodF90b3JjaFxuXG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmxpZ2h0ID09IHRydWUpe1xuXG4gICAgICAgIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpKTtcblxuICAgICAgfVxuICAgICAgZWxzZXtcblxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZCcsIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkLWNsZWFyZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCk7IFxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCl7XG5cblxuXG4gICAgICAgIGlmIChpc0ludGVyc2VjdGluZyA9PSBmYWxzZSl7XG5cbiAgICAgICAgICBpZiAoZGF0YS5hY3Rpb24gPT0gJ3RlbGVwb3J0JyAmJiAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSAhPSBkYXRhLnRhcmdldCAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2UpKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICgoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0JyB8fCBkYXRhLmFjdGlvbiA9PSBcImxpZ2h0X3RvcmNoXCIpICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9IFxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiByYXljYXN0ZXJfaW50ZXJzZWN0ZWQoKXtcblxuICAgICAgICBpZiAoaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKSl7XG5cbiAgICAgICAgICBpc0ludGVyc2VjdGluZyA9IHRydWU7XG4gICAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICAgIGdsb2JhbF90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgYWN0aW9uX3RvX3BlcmZvcm0oKSB9LCAxMDAwKTtcblxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCgpe1xuXG4gICAgICAgIGlmIChnbG9iYWxfdGltZXIpe1xuICAgICAgICAgIGNsZWFyVGltZW91dChnbG9iYWxfdGltZXIpO1xuICAgICAgICAgIGdsb2JhbF90aW1lcj0wO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgICBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGludGVyYWN0KCl7XG5cbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsICdjb2xvcicsICdncmVlbicpO1xuICAgICAgICBkYXRhLmRpc2FibGUgPSB0cnVlO1xuICAgICAgICByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCgpO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRlbGVwb3J0KCl7XG5cbiAgICAgICAgc2hvd19ibGFja19zY3JlZW4oKVxuICAgICAgICBzZXRUaW1lb3V0KGhpZGVfYmxhY2tfc2NyZWVuLCAxMDAwKTsgXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvd19ibGFja19zY3JlZW4oKXtcblxuICAgICAgICBibGFja19zY3JlZW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS53ZWJraXRBbmltYXRpb25OYW1lID0gJ2FkZF9vcGFjaXR5JztcbiAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLndlYmtpdEFuaW1hdGlvbkR1cmF0aW9uID0gJzFzJztcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoaWRlX2JsYWNrX3NjcmVlbigpe1xuXG4gICAgICAgIFxuICAgICAgICBwbGF5ZXIuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIGRhdGEudGFyZ2V0ICk7XG4gICAgICAgIFxuICAgICAgICBibGFja19zY3JlZW4uc3R5bGUud2Via2l0QW5pbWF0aW9uTmFtZSA9ICdyZW1vdmVfb3BhY2l0eSc7XG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS53ZWJraXRBbmltYXRpb25EdXJhdGlvbiA9ICcxcyc7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLm9wYWNpdHkgPSAwO1xuXG4gICAgICAgIH0sIDEwMDApXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24odGFyZ2V0KXtcblxuICAgICAgICB2YXIgbGlnaHRfYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnaW50ZW5zaXR5Jyk7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjEuNlwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVzaW5nXCIsIFwiZWFzZUluXCIpO1xuXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaWdodF9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMzAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIxLjhcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjIuNVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImRpcmVjdGlvblwiLCBcImFsdGVybmF0ZVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVzaW5nXCIsIFwiZWFzZUluT3V0RWxhc3RpY1wiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInJlcGVhdFwiLCBcImluZGVmaW5pdGVcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwiZm9yd2FyZHNcIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cbiBcbiAgICAgIGZ1bmN0aW9uIGxpZ2h0X3RvcmNoKCApe1xuXG4gICAgICAgIGludGVyYWN0KGRhdGEpO1xuXG4gICAgICAgIGlmIChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSAhPSBudWxsKSB7XG5cbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkuc2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICdkaXNhYmxlJywgZmFsc2UpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGlnaHRfb2JqZWN0ID0gZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0Jyk7XG4gICAgICAgIFxuICAgICAgICBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbihsaWdodF9vYmplY3QpXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIGxpZ2h0X29iamVjdC5yZW1vdmVDaGlsZChsaWdodF9vYmplY3QucXVlcnlTZWxlY3RvcignYS1hbmltYXRpb24nKSk7XG4gICAgICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChsaWdodF9vYmplY3QpXG5cbiAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICB9KTtcblxuICAgICAgfVxuXG4gICAgfSwgXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgfSxcblxuXG4gICAgaW50ZXJzZWN0SGFuZGxlcjogZnVuY3Rpb24oKXtcblxuICAgICAgXG4gICAgfSxcblxuICAgIGludGVyc2VjdFJlbW92YWxIYW5kbGVyOiBmdW5jdGlvbigpe1xuXG5cblxuICAgIH0sXG5cblxuICAgIHRlbGVwb3J0Q2hhcmFjdGVyOiBmdW5jdGlvbihlbCwgcGxheWVyKXtcblxuXG4gICAgfVxuXG4gIH0pOyBcblxufTtcblxuZXhwb3J0cy5sYXVuY2ggPSBUZWxlcG9ydDsiLCJ2YXIgVG9yY2g9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndG9yY2gnLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9LFxuICAgICAgICB0YXJnZXQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gIFx0XHRcdHZhciBlbCA9IHRoaXMuZWw7XG4gIFx0XHRcdHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXG4gIFx0XHRcdHZhciBfbGlnaHQgPSBkYXRhLmxpZ2h0O1xuICAgICAgICB2YXIgX3RhcmdldCA9IGRhdGEudGFyZ2V0O1xuXG4gIFx0XHRcdGlmIChfbGlnaHQgPT0gdHJ1ZSl7XG5cbiAgXHRcdFx0XHRfbGlnaHQgPSAnOyBsaWdodDp0cnVlJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cbiAgXHRcdFx0ZWxzZXtcbiAgXHRcdFx0XG4gIFx0XHRcdFx0X2xpZ2h0ID0gJyc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG5cbiAgICAgICAgaWYgKF90YXJnZXQgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJzsgdGFyZ2V0X3RvX2FjdGl2YXRlOiAnICsgX3RhcmdldFxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgIHZhciBjb2xsaWRlcl9lbnRpdHkgPSAnPGEtZW50aXR5IHRlbGVwb3J0PVwiYWN0aW9uOmxpZ2h0X3RvcmNoJyArIF9saWdodCArIF90YXJnZXQgKyAnXCIgY2xhc3M9XCJjb2xsaWRhYmxlXCIgZ2VvbWV0cnk9XCJcIiBtYXRlcmlhbD1cInRyYW5zcGFyZW50OiB0cnVlOyBvcGFjaXR5OiAwIFwiIHBvc2l0aW9uPVwiMCAwLjQ1IDBcIiBzY2FsZT1cIjAuMiAyLjMgMC4yXCIgPjwvYS1lbnRpdHk+J1xuXHRcdFx0dmFyIG9iamVjdCA9ICc8YS1vYmotbW9kZWwgc3JjPVwicHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmpcIiBvYmotbW9kZWw9XCJwdWJsaWMvbW9kZWxzL29iamVjdHMvZmlyZXRvcmNoLm9ialwiIHNjYWxlPVwiMC4wMiAwLjAyIDAuMDJcIiBtYXRlcmlhbD1cIlwiPjwvYS1vYmotbW9kZWw+J1xuXHRcdFx0dmFyIGxpZ2h0ID0gJzxhLWxpZ2h0IHR5cGU9XCJwb2ludFwiIGNvbG9yPVwicmdiKDI1NSwgMTY5LCAzNSlcIiBpbnRlbnNpdHk9XCIwXCIgZGlzdGFuY2U9XCIyMDBcIiBwb3NpdGlvbj1cIjAgMS41NDEgMFwiPjwvYS1saWdodD4nXG5cblx0XHRcdGVsLmlubmVySFRNTCA9IGNvbGxpZGVyX2VudGl0eSArIG9iamVjdCArIGxpZ2h0O1xuXG4gIFx0XHR9XG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmdlbmVyYXRlID0gVG9yY2g7XG4iLCJ2YXIgVGVsZXBvcnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGVsZXBvcnQuanMnKTtcbnZhciBUb3JjaCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90b3JjaC5qcycpO1xudmFyIEV5ZXMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvZXllcy5qcycpXG5cbndpbmRvdy5jb25zb2xlLmxvZygnbWFpbi5qcycpXG5UZWxlcG9ydC5sYXVuY2goKTtcdFxuVG9yY2guZ2VuZXJhdGUoKTtcbkV5ZXMub3Blbl9leWVzKCk7Il19
