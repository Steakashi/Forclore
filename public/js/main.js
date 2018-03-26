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
          var timer = window.setInterval(function(){
        
            var rotation = document.getElementById('player').getAttribute('rotation');
            offset_y_axis += (Math.abs(rotation.y - previous_offset_y_axis) / 200);
            console.log(offset_y_axis);
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

        var timer_blackscreen = 0;
        var player =  document.querySelector("#player");
        var black_screen = document.getElementById("blackscreen");

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

        var blackscreen_animation = document.createElement('a-animation');

        blackscreen_animation.setAttribute('attribute', 'opacity');
        blackscreen_animation.setAttribute("dur", "1000");
        blackscreen_animation.setAttribute("from", "0");
        blackscreen_animation.setAttribute("to", "1");
        blackscreen_animation.setAttribute("easing", "linear");

        black_screen.appendChild(blackscreen_animation);

      }

      function hide_black_screen(){
        
        player.setAttribute('position', data.target );
        
        var blackscreen_animation = document.createElement('a-animation');

        blackscreen_animation.setAttribute('attribute', 'opacity');
        blackscreen_animation.setAttribute("dur", "1000");
        blackscreen_animation.setAttribute("from", "1");
        blackscreen_animation.setAttribute("to", "0");
        blackscreen_animation.setAttribute("easing", "linear");

        black_screen.appendChild(blackscreen_animation);

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
        light_animation.setAttribute("easing", "easeInOutElastic");
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
			//var object = '<a-gltf-model src="public/models/objects/torch.gltf" gltf-model="public/models/objects/torch.gltf" material=""></a-gltf-model>'
      var object = '<a-entity gltf-model="src: url(../models/objects/torch.gltf);" ></a-entity>'
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
//Eyes.open_eyes();
},{"./components/eyes.js":1,"./components/teleport.js":2,"./components/torch.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9leWVzLmpzIiwic3JjL2NvbXBvbmVudHMvdGVsZXBvcnQuanMiLCJzcmMvY29tcG9uZW50cy90b3JjaC5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ2YXIgRXllcz0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdleWVzJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgICAgdGFyZ2V0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgb2Zmc2V0X3lfYXhpcyA9IDA7XG4gICAgICAgIHZhciBwcmV2aW91c19vZmZzZXRfeV9heGlzID0gMDtcbiAgICAgICAgdmFyIGRlY3JlYXNpbmcgPSAwLjAxXG4gICAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrc2NyZWVuXCIpO1xuICAgICAgICAvL2JsYWNrX3NjcmVlbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsgXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG4gICAgICAgICAgdmFyIHRpbWVyID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcicpLmdldEF0dHJpYnV0ZSgncm90YXRpb24nKTtcbiAgICAgICAgICAgIG9mZnNldF95X2F4aXMgKz0gKE1hdGguYWJzKHJvdGF0aW9uLnkgLSBwcmV2aW91c19vZmZzZXRfeV9heGlzKSAvIDIwMCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvZmZzZXRfeV9heGlzKTtcbiAgICAgICAgICAgIHByZXZpb3VzX29mZnNldF95X2F4aXMgPSByb3RhdGlvbi55O1xuXG4gICAgICAgICAgICBpZihvZmZzZXRfeV9heGlzID4gMSl7XG5cbiAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGltZXIpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvZmZzZXRfeV9heGlzID4gMCl7XG5cbiAgICAgICAgICAgICAgb2Zmc2V0X3lfYXhpcyAtPSBkZWNyZWFzaW5nO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgIG9mZnNldF95X2F4aXMgPSAwXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmxhY2tfc2NyZWVuLnNldEF0dHJpYnV0ZSgnb3BhY2l0eScsIDEgLSBvZmZzZXRfeV9heGlzKTtcblxuICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5vcGVuX2V5ZXMgPSBFeWVzOyIsInZhciBUZWxlcG9ydD0gZnVuY3Rpb24oKXtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICBBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RlbGVwb3J0Jywge1xuICAgIGRlcGVuZGVuY2llczogWydyYXljYXN0ZXInXSxcbiAgICBzY2hlbWE6IHtcbiAgICAgIHRhcmdldDoge3R5cGU6ICd2ZWMzJ30sXG4gICAgICBhY3Rpb246IHt0eXBlOiAnc3RyaW5nJ30sXG4gICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJ30sXG4gICAgICBkaXNhYmxlOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgIHRhcmdldF90b19hY3RpdmF0ZToge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgICB2YXIgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgdmFyIGdsb2JhbF90aW1lciA9IDA7XG5cbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhXG4gICAgICB0aGlzLmRhdGFfdGVzdCA9IHRoaXMuZGF0YVxuICAgICAgXG4gICAgICB2YXIgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbGVwb3J0X2xvYWRlcicpO1xuICAgICAgdmFyIGFjdGlvbl90b19wZXJmb3JtID0gbnVsbDtcblxuICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcpe1xuXG4gICAgICAgIHZhciB0aW1lcl9ibGFja3NjcmVlbiA9IDA7XG4gICAgICAgIHZhciBwbGF5ZXIgPSAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJcIik7XG4gICAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrc2NyZWVuXCIpO1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gdGVsZXBvcnRcblxuXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGludGVyYWN0XG5cbiAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdsaWdodF90b3JjaCcpe1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gbGlnaHRfdG9yY2hcblxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5saWdodCA9PSB0cnVlKXtcblxuICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKSk7XG5cbiAgICAgIH1cbiAgICAgIGVsc2V7XG5cbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWQpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZC1jbGVhcmVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQpOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpe1xuXG5cblxuICAgICAgICBpZiAoaXNJbnRlcnNlY3RpbmcgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcgJiYgKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgIT0gZGF0YS50YXJnZXQgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoKGRhdGEuYWN0aW9uID09ICdpbnRlcmFjdCcgfHwgZGF0YS5hY3Rpb24gPT0gXCJsaWdodF90b3JjaFwiKSAmJiBkYXRhLmRpc2FibGUgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfSBcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkKCl7XG5cbiAgICAgICAgaWYgKGludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCkpe1xuXG4gICAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSB0cnVlO1xuICAgICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgIFxuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgICBnbG9iYWxfdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGFjdGlvbl90b19wZXJmb3JtKCkgfSwgMTAwMCk7XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKXtcblxuICAgICAgICBpZiAoZ2xvYmFsX3RpbWVyKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZ2xvYmFsX3RpbWVyKTtcbiAgICAgICAgICBnbG9iYWxfdGltZXI9MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdCgpe1xuXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnZ3JlZW4nKTtcbiAgICAgICAgZGF0YS5kaXNhYmxlID0gdHJ1ZTtcbiAgICAgICAgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0ZWxlcG9ydCgpe1xuXG4gICAgICAgIHNob3dfYmxhY2tfc2NyZWVuKClcbiAgICAgICAgc2V0VGltZW91dChoaWRlX2JsYWNrX3NjcmVlbiwgMTAwMCk7IFxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNob3dfYmxhY2tfc2NyZWVuKCl7XG5cbiAgICAgICAgdmFyIGJsYWNrc2NyZWVuX2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ29wYWNpdHknKTtcbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMFwiKTtcbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMVwiKTtcbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImxpbmVhclwiKTtcblxuICAgICAgICBibGFja19zY3JlZW4uYXBwZW5kQ2hpbGQoYmxhY2tzY3JlZW5fYW5pbWF0aW9uKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoaWRlX2JsYWNrX3NjcmVlbigpe1xuICAgICAgICBcbiAgICAgICAgcGxheWVyLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBkYXRhLnRhcmdldCApO1xuICAgICAgICBcbiAgICAgICAgdmFyIGJsYWNrc2NyZWVuX2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ29wYWNpdHknKTtcbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMVwiKTtcbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMFwiKTtcbiAgICAgICAgYmxhY2tzY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImxpbmVhclwiKTtcblxuICAgICAgICBibGFja19zY3JlZW4uYXBwZW5kQ2hpbGQoYmxhY2tzY3JlZW5fYW5pbWF0aW9uKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbih0YXJnZXQpe1xuXG4gICAgICAgIHZhciBsaWdodF9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdpbnRlbnNpdHknKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMS42XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZWFzaW5nXCIsIFwibGluZWFyXCIpO1xuXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaWdodF9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMzAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIxLjhcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjIuNVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImRpcmVjdGlvblwiLCBcImFsdGVybmF0ZVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImVhc2VJbk91dEVsYXN0aWNcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJyZXBlYXRcIiwgXCJpbmRlZmluaXRlXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcImZvcndhcmRzXCIpO1xuXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaWdodF9hbmltYXRpb24pO1xuXG4gICAgICB9XG4gXG4gICAgICBmdW5jdGlvbiBsaWdodF90b3JjaCggKXtcblxuICAgICAgICBpbnRlcmFjdChkYXRhKTtcblxuICAgICAgICBpZiAoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUgIT0gbnVsbCkge1xuXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUpLnNldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAnZGlzYWJsZScsIGZhbHNlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxpZ2h0X29iamVjdCA9IGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpO1xuICAgICAgICBcbiAgICAgICAgY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24obGlnaHRfb2JqZWN0KVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBsaWdodF9vYmplY3QucmVtb3ZlQ2hpbGQobGlnaHRfb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoJ2EtYW5pbWF0aW9uJykpO1xuICAgICAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQobGlnaHRfb2JqZWN0KVxuXG4gICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgIH0sIFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpe1xuXG4gICAgICB0aGlzLmluaXQoKTtcblxuICAgIH0sXG5cblxuICAgIGludGVyc2VjdEhhbmRsZXI6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIFxuICAgIH0sXG5cbiAgICBpbnRlcnNlY3RSZW1vdmFsSGFuZGxlcjogZnVuY3Rpb24oKXtcblxuXG5cbiAgICB9LFxuXG5cbiAgICB0ZWxlcG9ydENoYXJhY3RlcjogZnVuY3Rpb24oZWwsIHBsYXllcil7XG5cblxuICAgIH1cblxuICB9KTsgXG5cbn07XG5cbmV4cG9ydHMubGF1bmNoID0gVGVsZXBvcnQ7IiwidmFyIFRvcmNoPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RvcmNoJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgICAgdGFyZ2V0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICBcdFx0XHR2YXIgZWwgPSB0aGlzLmVsO1xuICBcdFx0XHR2YXIgZGF0YSA9IHRoaXMuZGF0YTtcblxuICBcdFx0XHR2YXIgX2xpZ2h0ID0gZGF0YS5saWdodDtcbiAgICAgICAgdmFyIF90YXJnZXQgPSBkYXRhLnRhcmdldDtcblxuICBcdFx0XHRpZiAoX2xpZ2h0ID09IHRydWUpe1xuXG4gIFx0XHRcdFx0X2xpZ2h0ID0gJzsgbGlnaHQ6dHJ1ZSc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG4gIFx0XHRcdGVsc2V7XG4gIFx0XHRcdFxuICBcdFx0XHRcdF9saWdodCA9ICcnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuXG4gICAgICAgIGlmIChfdGFyZ2V0ICE9IG51bGwpe1xuXG4gICAgICAgICAgX3RhcmdldCA9ICc7IHRhcmdldF90b19hY3RpdmF0ZTogJyArIF90YXJnZXRcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICB2YXIgY29sbGlkZXJfZW50aXR5ID0gJzxhLWVudGl0eSB0ZWxlcG9ydD1cImFjdGlvbjpsaWdodF90b3JjaCcgKyBfbGlnaHQgKyBfdGFyZ2V0ICsgJ1wiIGNsYXNzPVwiY29sbGlkYWJsZVwiIGdlb21ldHJ5PVwiXCIgbWF0ZXJpYWw9XCJ0cmFuc3BhcmVudDogdHJ1ZTsgb3BhY2l0eTogMCBcIiBwb3NpdGlvbj1cIjAgMC40NSAwXCIgc2NhbGU9XCIwLjIgMi4zIDAuMlwiID48L2EtZW50aXR5Pidcblx0XHRcdC8vdmFyIG9iamVjdCA9ICc8YS1nbHRmLW1vZGVsIHNyYz1cInB1YmxpYy9tb2RlbHMvb2JqZWN0cy90b3JjaC5nbHRmXCIgZ2x0Zi1tb2RlbD1cInB1YmxpYy9tb2RlbHMvb2JqZWN0cy90b3JjaC5nbHRmXCIgbWF0ZXJpYWw9XCJcIj48L2EtZ2x0Zi1tb2RlbD4nXG4gICAgICB2YXIgb2JqZWN0ID0gJzxhLWVudGl0eSBnbHRmLW1vZGVsPVwic3JjOiB1cmwoLi4vbW9kZWxzL29iamVjdHMvdG9yY2guZ2x0Zik7XCIgPjwvYS1lbnRpdHk+J1xuXHRcdFx0dmFyIGxpZ2h0ID0gJzxhLWxpZ2h0IHR5cGU9XCJwb2ludFwiIGNvbG9yPVwicmdiKDI1NSwgMTY5LCAzNSlcIiBpbnRlbnNpdHk9XCIwXCIgZGlzdGFuY2U9XCIyMDBcIiBwb3NpdGlvbj1cIjAgMS41NDEgMFwiPjwvYS1saWdodD4nXG5cblx0XHRcdGVsLmlubmVySFRNTCA9IGNvbGxpZGVyX2VudGl0eSArIG9iamVjdCArIGxpZ2h0O1xuXG4gIFx0XHR9XG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmdlbmVyYXRlID0gVG9yY2g7XG4iLCJ2YXIgVGVsZXBvcnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGVsZXBvcnQuanMnKTtcbnZhciBUb3JjaCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90b3JjaC5qcycpO1xudmFyIEV5ZXMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvZXllcy5qcycpXG5cbndpbmRvdy5jb25zb2xlLmxvZygnbWFpbi5qcycpXG5UZWxlcG9ydC5sYXVuY2goKTtcdFxuVG9yY2guZ2VuZXJhdGUoKTtcbi8vRXllcy5vcGVuX2V5ZXMoKTsiXX0=
