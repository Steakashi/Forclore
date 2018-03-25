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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9leWVzLmpzIiwic3JjL2NvbXBvbmVudHMvdGVsZXBvcnQuanMiLCJzcmMvY29tcG9uZW50cy90b3JjaC5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwidmFyIEV5ZXM9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZXllcycsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICAgIHRhcmdldDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIG9mZnNldF95X2F4aXMgPSAwO1xuICAgICAgICB2YXIgcHJldmlvdXNfb2Zmc2V0X3lfYXhpcyA9IDA7XG4gICAgICAgIHZhciBkZWNyZWFzaW5nID0gMC4wMVxuICAgICAgICB2YXIgYmxhY2tfc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibGFja3NjcmVlblwiKTtcbiAgICAgICAgLy9ibGFja19zY3JlZW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7IFxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuICAgICAgICAgIHZhciB0aW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgICAgIHZhciByb3RhdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXInKS5nZXRBdHRyaWJ1dGUoJ3JvdGF0aW9uJyk7XG4gICAgICAgICAgICBvZmZzZXRfeV9heGlzICs9IChNYXRoLmFicyhyb3RhdGlvbi55IC0gcHJldmlvdXNfb2Zmc2V0X3lfYXhpcykgLyAyMDApO1xuICAgICAgICAgICAgY29uc29sZS5sb2cob2Zmc2V0X3lfYXhpcyk7XG4gICAgICAgICAgICBwcmV2aW91c19vZmZzZXRfeV9heGlzID0gcm90YXRpb24ueTtcblxuICAgICAgICAgICAgaWYob2Zmc2V0X3lfYXhpcyA+IDEpe1xuXG4gICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRpbWVyKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2Zmc2V0X3lfYXhpcyA+IDApe1xuXG4gICAgICAgICAgICAgIG9mZnNldF95X2F4aXMgLT0gZGVjcmVhc2luZztcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICBvZmZzZXRfeV9heGlzID0gMFxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJsYWNrX3NjcmVlbi5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAxIC0gb2Zmc2V0X3lfYXhpcyk7XG5cbiAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMub3Blbl9leWVzID0gRXllczsiLCJ2YXIgVGVsZXBvcnQ9IGZ1bmN0aW9uKCl7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZWxlcG9ydCcsIHtcbiAgICBkZXBlbmRlbmNpZXM6IFsncmF5Y2FzdGVyJ10sXG4gICAgc2NoZW1hOiB7XG4gICAgICB0YXJnZXQ6IHt0eXBlOiAndmVjMyd9LFxuICAgICAgYWN0aW9uOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbid9LFxuICAgICAgZGlzYWJsZToge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICB0YXJnZXRfdG9fYWN0aXZhdGU6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfVxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgdmFyIGlzSW50ZXJzZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgIHZhciBnbG9iYWxfdGltZXIgPSAwO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVxuICAgICAgdGhpcy5kYXRhX3Rlc3QgPSB0aGlzLmRhdGFcbiAgICAgIFxuICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZWxlcG9ydF9sb2FkZXInKTtcbiAgICAgIHZhciBhY3Rpb25fdG9fcGVyZm9ybSA9IG51bGw7XG5cbiAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnKXtcblxuICAgICAgICB2YXIgdGltZXJfYmxhY2tzY3JlZW4gPSAwO1xuICAgICAgICB2YXIgcGxheWVyID0gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyXCIpO1xuICAgICAgICB2YXIgYmxhY2tfc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibGFja3NjcmVlblwiKTtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IHRlbGVwb3J0XG5cblxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0Jyl7XG5cbiAgICAgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBpbnRlcmFjdFxuXG4gICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnbGlnaHRfdG9yY2gnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGxpZ2h0X3RvcmNoXG5cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEubGlnaHQgPT0gdHJ1ZSl7XG5cbiAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQoZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0JykpO1xuXG4gICAgICB9XG4gICAgICBlbHNle1xuXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkKTtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQtY2xlYXJlZCcsIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKTsgXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKXtcblxuXG5cbiAgICAgICAgaWYgKGlzSW50ZXJzZWN0aW5nID09IGZhbHNlKXtcblxuICAgICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnICYmIChwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpICE9IGRhdGEudGFyZ2V0ICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSkpe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnIHx8IGRhdGEuYWN0aW9uID09IFwibGlnaHRfdG9yY2hcIikgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH0gXG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCgpe1xuXG4gICAgICAgIGlmIChpbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpKXtcblxuICAgICAgICAgIGlzSW50ZXJzZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICBcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgICAgZ2xvYmFsX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBhY3Rpb25fdG9fcGVyZm9ybSgpIH0sIDEwMDApO1xuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCl7XG5cbiAgICAgICAgaWYgKGdsb2JhbF90aW1lcil7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGdsb2JhbF90aW1lcik7XG4gICAgICAgICAgZ2xvYmFsX3RpbWVyPTA7XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgICAgIGlzSW50ZXJzZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW50ZXJhY3QoKXtcblxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ2dyZWVuJyk7XG4gICAgICAgIGRhdGEuZGlzYWJsZSA9IHRydWU7XG4gICAgICAgIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGVsZXBvcnQoKXtcblxuICAgICAgICBzaG93X2JsYWNrX3NjcmVlbigpXG4gICAgICAgIHNldFRpbWVvdXQoaGlkZV9ibGFja19zY3JlZW4sIDEwMDApOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG93X2JsYWNrX3NjcmVlbigpe1xuXG4gICAgICAgIHZhciBibGFja3NjcmVlbl9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdvcGFjaXR5Jyk7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBibGFja3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjFcIik7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgYmxhY2tfc2NyZWVuLmFwcGVuZENoaWxkKGJsYWNrc2NyZWVuX2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGlkZV9ibGFja19zY3JlZW4oKXtcbiAgICAgICAgXG4gICAgICAgIHBsYXllci5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgZGF0YS50YXJnZXQgKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBibGFja3NjcmVlbl9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdvcGFjaXR5Jyk7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBibGFja3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjFcIik7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjBcIik7XG4gICAgICAgIGJsYWNrc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgYmxhY2tfc2NyZWVuLmFwcGVuZENoaWxkKGJsYWNrc2NyZWVuX2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24odGFyZ2V0KXtcblxuICAgICAgICB2YXIgbGlnaHRfYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnaW50ZW5zaXR5Jyk7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjEuNlwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImxpbmVhclwiKTtcblxuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobGlnaHRfYW5pbWF0aW9uKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdCh0YXJnZXQpe1xuXG4gICAgICAgIHZhciBsaWdodF9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdpbnRlbnNpdHknKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjMwMDBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMS44XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwidG9cIiwgXCIyLjVcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkaXJlY3Rpb25cIiwgXCJhbHRlcm5hdGVcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJlYXNlSW5PdXRFbGFzdGljXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwicmVwZWF0XCIsIFwiaW5kZWZpbml0ZVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJmb3J3YXJkc1wiKTtcblxuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobGlnaHRfYW5pbWF0aW9uKTtcblxuICAgICAgfVxuIFxuICAgICAgZnVuY3Rpb24gbGlnaHRfdG9yY2goICl7XG5cbiAgICAgICAgaW50ZXJhY3QoZGF0YSk7XG5cbiAgICAgICAgaWYgKGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlICE9IG51bGwpIHtcblxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRhdGEudGFyZ2V0X3RvX2FjdGl2YXRlKS5zZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ2Rpc2FibGUnLCBmYWxzZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsaWdodF9vYmplY3QgPSBlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKTtcbiAgICAgICAgXG4gICAgICAgIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKGxpZ2h0X29iamVjdClcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgbGlnaHRfb2JqZWN0LnJlbW92ZUNoaWxkKGxpZ2h0X29iamVjdC5xdWVyeVNlbGVjdG9yKCdhLWFuaW1hdGlvbicpKTtcbiAgICAgICAgICAgIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KGxpZ2h0X29iamVjdClcblxuICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cbiAgICB9LCBcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKXtcblxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB9LFxuXG5cbiAgICBpbnRlcnNlY3RIYW5kbGVyOiBmdW5jdGlvbigpe1xuXG4gICAgICBcbiAgICB9LFxuXG4gICAgaW50ZXJzZWN0UmVtb3ZhbEhhbmRsZXI6IGZ1bmN0aW9uKCl7XG5cblxuXG4gICAgfSxcblxuXG4gICAgdGVsZXBvcnRDaGFyYWN0ZXI6IGZ1bmN0aW9uKGVsLCBwbGF5ZXIpe1xuXG5cbiAgICB9XG5cbiAgfSk7IFxuXG59O1xuXG5leHBvcnRzLmxhdW5jaCA9IFRlbGVwb3J0OyIsInZhciBUb3JjaD0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0b3JjaCcsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICAgIHRhcmdldDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgXHRcdFx0dmFyIGVsID0gdGhpcy5lbDtcbiAgXHRcdFx0dmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgXHRcdFx0dmFyIF9saWdodCA9IGRhdGEubGlnaHQ7XG4gICAgICAgIHZhciBfdGFyZ2V0ID0gZGF0YS50YXJnZXQ7XG5cbiAgXHRcdFx0aWYgKF9saWdodCA9PSB0cnVlKXtcblxuICBcdFx0XHRcdF9saWdodCA9ICc7IGxpZ2h0OnRydWUnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuICBcdFx0XHRlbHNle1xuICBcdFx0XHRcbiAgXHRcdFx0XHRfbGlnaHQgPSAnJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cblxuICAgICAgICBpZiAoX3RhcmdldCAhPSBudWxsKXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnOyB0YXJnZXRfdG9fYWN0aXZhdGU6ICcgKyBfdGFyZ2V0XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgX3RhcmdldCA9ICcnO1xuXG4gICAgICAgIH1cblxuICAgICAgdmFyIGNvbGxpZGVyX2VudGl0eSA9ICc8YS1lbnRpdHkgdGVsZXBvcnQ9XCJhY3Rpb246bGlnaHRfdG9yY2gnICsgX2xpZ2h0ICsgX3RhcmdldCArICdcIiBjbGFzcz1cImNvbGxpZGFibGVcIiBnZW9tZXRyeT1cIlwiIG1hdGVyaWFsPVwidHJhbnNwYXJlbnQ6IHRydWU7IG9wYWNpdHk6IDAgXCIgcG9zaXRpb249XCIwIDAuNDUgMFwiIHNjYWxlPVwiMC4yIDIuMyAwLjJcIiA+PC9hLWVudGl0eT4nXG5cdFx0XHR2YXIgb2JqZWN0ID0gJzxhLW9iai1tb2RlbCBzcmM9XCJwdWJsaWMvbW9kZWxzL29iamVjdHMvZmlyZXRvcmNoLm9ialwiIG9iai1tb2RlbD1cInB1YmxpYy9tb2RlbHMvb2JqZWN0cy9maXJldG9yY2gub2JqXCIgc2NhbGU9XCIwLjAyIDAuMDIgMC4wMlwiIG1hdGVyaWFsPVwiXCI+PC9hLW9iai1tb2RlbD4nXG5cdFx0XHR2YXIgbGlnaHQgPSAnPGEtbGlnaHQgdHlwZT1cInBvaW50XCIgY29sb3I9XCJyZ2IoMjU1LCAxNjksIDM1KVwiIGludGVuc2l0eT1cIjBcIiBkaXN0YW5jZT1cIjIwMFwiIHBvc2l0aW9uPVwiMCAxLjU0MSAwXCI+PC9hLWxpZ2h0PidcblxuXHRcdFx0ZWwuaW5uZXJIVE1MID0gY29sbGlkZXJfZW50aXR5ICsgb2JqZWN0ICsgbGlnaHQ7XG5cbiAgXHRcdH1cblxuICAgXHR9KTsgXG5cbn07XG5cbmV4cG9ydHMuZ2VuZXJhdGUgPSBUb3JjaDtcbiIsInZhciBUZWxlcG9ydCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZWxlcG9ydC5qcycpO1xudmFyIFRvcmNoID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RvcmNoLmpzJyk7XG52YXIgRXllcyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9leWVzLmpzJylcblxud2luZG93LmNvbnNvbGUubG9nKCdtYWluLmpzJylcblRlbGVwb3J0LmxhdW5jaCgpO1x0XG5Ub3JjaC5nZW5lcmF0ZSgpO1xuRXllcy5vcGVuX2V5ZXMoKTsiXX0=
