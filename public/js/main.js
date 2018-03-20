(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
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
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null

      if (this.data.action == 'teleport'){

        var timer_blackscreen = 0;
        var player =  document.querySelector("#player");
        var black_screen = document.getElementById("black_screen");

        action_to_perform = teleport


      }
      else if (this.data.action == 'interact'){

        action_to_perform = interact

      }
            else if (this.data.action == 'light_torch'){

        action_to_perform = light_torch

      }

      if (this.data.light == true){

        create_light_animation_repeat(el.parentNode.querySelector('a-light'));

      }
      else{

        console.log(this.data);
        this.el.addEventListener('raycaster-intersected', function(){ raycaster_intersected(this.data) });
        this.el.addEventListener('raycaster-intersected-cleared', function(){  raycaster_intersected_cleared(this.data) }); 

      }

      action_to_perform();

      this.action_to_perform = function(){

        console.log(this.data);

      }

      function interaction_is_possible(data){



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
      
      function raycaster_intersected(data){


    /*    if ((isIntersecting != true) ||
           ((data.action == teleport) && (player.getAttribute('position') != data.target))){*/

        console.log(data);

        if (interaction_is_possible(data)){

          isIntersecting = true;
          loader.style.display = "block";
          
          requestAnimationFrame(function(timestamp){

            global_timer = setTimeout(function(){ action_to_perform(data) }, 1000);

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

      function interact(data){

        el.setAttribute('material', 'color', 'green');
        data.disable = true;
        raycaster_intersected_cleared();

      }

      function teleport(data){

        console.log('teleporting  ');

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
 
      function light_torch(data){

        interact(data);

        console.log('LIGHT TORCH');

        console.log(data.target_to_activate );

        if (data.target_to_activate != null) {

          console.log('---------------------');
          console.log('---------------------');
          console.log(data.target_to_activate);
          console.log('---------------------');
          console.log('---------------------');
          console.log(document.getElementById(data.target_to_activate))
          document.getElementById(data.target_to_activate).setAttribute('teleport', 'disable', false);
          document.getElementById(data.target_to_activate).object3D.teleport = 'disable:false';
          document.getElementById(data.target_to_activate).emit('doThing');
          document.getElementById(data.target_to_activate).flushToDOM();
                    console.log(document.getElementById(data.target_to_activate))


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

      function create_torch(){
        /*var torch = document.createElement('a-obj-model');
        torch.setAttribute('src', '../../public/models/objects/firetorch.obj');
        torch.setAttribute('obj-model', '../../public/models/objects/firetorch.obj');
        torch.setAttribute('scale', '0.02 0.02 0.02');

        el.parentNode

        src="public/models/objects/firetorch.obj" obj-model="public/models/objects/firetorch.obj" scale="0.02 0.02 0.02"*/
      }

    }, 

    doThing: function() {
      console.log('It is doing something !')
    },

    update: function(){

      console.log('UPDATING')
      console.log(this.data);

    },

    intersectHandler: function(){

      
    },

    intersectRemovalHandler: function(){



    },


    teleportCharacter: function(el, player){


    }

  }); 


              /*requestAnimationFrame(function(timestamp){

                

              }, 1000);*/
              /*
              var animator = document.createElement('a-animation');
              animator.setAttribute("attribute", "position");
              animator.setAttribute("from", "0, 0, 0");
              animator.setAttribute("to", "0 10 0");
              player.appendChild(animator);*/ 

};

exports.launch = Teleport;
},{}],2:[function(require,module,exports){
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

      console.log(_target);

      var collider_entity = '<a-entity teleport="action:light_torch' + _light + _target + '" class="collidable" geometry="" material="transparent: true; opacity: 0 " position="0 0.45 0" scale="0.2 2.3 0.2" ></a-entity>'
			var object = '<a-obj-model src="public/models/objects/firetorch.obj" obj-model="public/models/objects/firetorch.obj" scale="0.02 0.02 0.02" material=""></a-obj-model>'
			var light = '<a-light type="point" color="rgb(255, 169, 35)" intensity="0" distance="200" position="0 1.541 0"></a-light>'

			el.innerHTML = collider_entity + object + light;

  		}

   	}); 

};

exports.generate = Torch;
},{}],3:[function(require,module,exports){
var Teleport = require('./components/teleport.js');
var Torch = require('./components/torch.js');

window.console.log('main.js')
Teleport.launch();	
Torch.generate();
},{"./components/teleport.js":1,"./components/torch.js":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy90ZWxlcG9ydC5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsInZhciBUZWxlcG9ydD0gZnVuY3Rpb24oKXtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICBBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RlbGVwb3J0Jywge1xuICAgIGRlcGVuZGVuY2llczogWydyYXljYXN0ZXInXSxcbiAgICBzY2hlbWE6IHtcbiAgICAgIHRhcmdldDoge3R5cGU6ICd2ZWMzJ30sXG4gICAgICBhY3Rpb246IHt0eXBlOiAnc3RyaW5nJ30sXG4gICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJ30sXG4gICAgICBkaXNhYmxlOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgIHRhcmdldF90b19hY3RpdmF0ZToge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgICB2YXIgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgdmFyIGdsb2JhbF90aW1lciA9IDA7XG4gICAgICBcbiAgICAgIHZhciBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVsZXBvcnRfbG9hZGVyJyk7XG4gICAgICB2YXIgYWN0aW9uX3RvX3BlcmZvcm0gPSBudWxsXG5cbiAgICAgIGlmICh0aGlzLmRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcpe1xuXG4gICAgICAgIHZhciB0aW1lcl9ibGFja3NjcmVlbiA9IDA7XG4gICAgICAgIHZhciBwbGF5ZXIgPSAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJcIik7XG4gICAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrX3NjcmVlblwiKTtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IHRlbGVwb3J0XG5cblxuICAgICAgfVxuICAgICAgZWxzZSBpZiAodGhpcy5kYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGludGVyYWN0XG5cbiAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZGF0YS5hY3Rpb24gPT0gJ2xpZ2h0X3RvcmNoJyl7XG5cbiAgICAgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBsaWdodF90b3JjaFxuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmRhdGEubGlnaHQgPT0gdHJ1ZSl7XG5cbiAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQoZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0JykpO1xuXG4gICAgICB9XG4gICAgICBlbHNle1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YSk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkJywgZnVuY3Rpb24oKXsgcmF5Y2FzdGVyX2ludGVyc2VjdGVkKHRoaXMuZGF0YSkgfSk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkLWNsZWFyZWQnLCBmdW5jdGlvbigpeyAgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQodGhpcy5kYXRhKSB9KTsgXG5cbiAgICAgIH1cblxuICAgICAgYWN0aW9uX3RvX3BlcmZvcm0oKTtcblxuICAgICAgdGhpcy5hY3Rpb25fdG9fcGVyZm9ybSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdGlvbl9pc19wb3NzaWJsZShkYXRhKXtcblxuXG5cbiAgICAgICAgaWYgKGlzSW50ZXJzZWN0aW5nID09IGZhbHNlKXtcblxuICAgICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnICYmIChwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpICE9IGRhdGEudGFyZ2V0ICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSkpe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnIHx8IGRhdGEuYWN0aW9uID09IFwibGlnaHRfdG9yY2hcIikgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH0gXG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZChkYXRhKXtcblxuXG4gICAgLyogICAgaWYgKChpc0ludGVyc2VjdGluZyAhPSB0cnVlKSB8fFxuICAgICAgICAgICAoKGRhdGEuYWN0aW9uID09IHRlbGVwb3J0KSAmJiAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSAhPSBkYXRhLnRhcmdldCkpKXsqL1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgICAgIGlmIChpbnRlcmFjdGlvbl9pc19wb3NzaWJsZShkYXRhKSl7XG5cbiAgICAgICAgICBpc0ludGVyc2VjdGluZyA9IHRydWU7XG4gICAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICAgIGdsb2JhbF90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgYWN0aW9uX3RvX3BlcmZvcm0oZGF0YSkgfSwgMTAwMCk7XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKXtcblxuICAgICAgICBpZiAoZ2xvYmFsX3RpbWVyKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZ2xvYmFsX3RpbWVyKTtcbiAgICAgICAgICBnbG9iYWxfdGltZXI9MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdChkYXRhKXtcblxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ2dyZWVuJyk7XG4gICAgICAgIGRhdGEuZGlzYWJsZSA9IHRydWU7XG4gICAgICAgIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGVsZXBvcnQoZGF0YSl7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3RlbGVwb3J0aW5nICAnKTtcblxuICAgICAgICBzaG93X2JsYWNrX3NjcmVlbigpXG4gICAgICAgIHNldFRpbWVvdXQoaGlkZV9ibGFja19zY3JlZW4sIDEwMDApOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG93X2JsYWNrX3NjcmVlbigpe1xuXG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLndlYmtpdEFuaW1hdGlvbk5hbWUgPSAnYWRkX29wYWNpdHknO1xuICAgICAgICBibGFja19zY3JlZW4uc3R5bGUud2Via2l0QW5pbWF0aW9uRHVyYXRpb24gPSAnMXMnO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhpZGVfYmxhY2tfc2NyZWVuKCl7XG5cbiAgICAgICAgXG4gICAgICAgIHBsYXllci5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgZGF0YS50YXJnZXQgKTtcbiAgICAgICAgXG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS53ZWJraXRBbmltYXRpb25OYW1lID0gJ3JlbW92ZV9vcGFjaXR5JztcbiAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLndlYmtpdEFuaW1hdGlvbkR1cmF0aW9uID0gJzFzJztcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICBibGFja19zY3JlZW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICBibGFja19zY3JlZW4uc3R5bGUub3BhY2l0eSA9IDA7XG5cbiAgICAgICAgfSwgMTAwMClcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbih0YXJnZXQpe1xuXG4gICAgICAgIHZhciBsaWdodF9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdpbnRlbnNpdHknKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMS42XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZXNpbmdcIiwgXCJlYXNlSW5cIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQodGFyZ2V0KXtcblxuICAgICAgICB2YXIgbGlnaHRfYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnaW50ZW5zaXR5Jyk7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIzMDAwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjEuOFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMi41XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZGlyZWN0aW9uXCIsIFwiYWx0ZXJuYXRlXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZXNpbmdcIiwgXCJlYXNlSW5PdXRFbGFzdGljXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwicmVwZWF0XCIsIFwiaW5kZWZpbml0ZVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJmb3J3YXJkc1wiKTtcblxuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobGlnaHRfYW5pbWF0aW9uKTtcblxuICAgICAgfVxuIFxuICAgICAgZnVuY3Rpb24gbGlnaHRfdG9yY2goZGF0YSl7XG5cbiAgICAgICAgaW50ZXJhY3QoZGF0YSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0xJR0hUIFRPUkNIJyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUgKTtcblxuICAgICAgICBpZiAoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUgIT0gbnVsbCkge1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhLnRhcmdldF90b19hY3RpdmF0ZSk7XG4gICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkpXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUpLnNldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAnZGlzYWJsZScsIGZhbHNlKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkub2JqZWN0M0QudGVsZXBvcnQgPSAnZGlzYWJsZTpmYWxzZSc7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUpLmVtaXQoJ2RvVGhpbmcnKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkuZmx1c2hUb0RPTSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkpXG5cblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxpZ2h0X29iamVjdCA9IGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpO1xuICAgICAgICBcbiAgICAgICAgY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24obGlnaHRfb2JqZWN0KVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBsaWdodF9vYmplY3QucmVtb3ZlQ2hpbGQobGlnaHRfb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoJ2EtYW5pbWF0aW9uJykpO1xuICAgICAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQobGlnaHRfb2JqZWN0KVxuXG4gICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX3RvcmNoKCl7XG4gICAgICAgIC8qdmFyIHRvcmNoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1vYmotbW9kZWwnKTtcbiAgICAgICAgdG9yY2guc2V0QXR0cmlidXRlKCdzcmMnLCAnLi4vLi4vcHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmonKTtcbiAgICAgICAgdG9yY2guc2V0QXR0cmlidXRlKCdvYmotbW9kZWwnLCAnLi4vLi4vcHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmonKTtcbiAgICAgICAgdG9yY2guc2V0QXR0cmlidXRlKCdzY2FsZScsICcwLjAyIDAuMDIgMC4wMicpO1xuXG4gICAgICAgIGVsLnBhcmVudE5vZGVcblxuICAgICAgICBzcmM9XCJwdWJsaWMvbW9kZWxzL29iamVjdHMvZmlyZXRvcmNoLm9ialwiIG9iai1tb2RlbD1cInB1YmxpYy9tb2RlbHMvb2JqZWN0cy9maXJldG9yY2gub2JqXCIgc2NhbGU9XCIwLjAyIDAuMDIgMC4wMlwiKi9cbiAgICAgIH1cblxuICAgIH0sIFxuXG4gICAgZG9UaGluZzogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygnSXQgaXMgZG9pbmcgc29tZXRoaW5nICEnKVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdVUERBVElORycpXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGEpO1xuXG4gICAgfSxcblxuICAgIGludGVyc2VjdEhhbmRsZXI6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIFxuICAgIH0sXG5cbiAgICBpbnRlcnNlY3RSZW1vdmFsSGFuZGxlcjogZnVuY3Rpb24oKXtcblxuXG5cbiAgICB9LFxuXG5cbiAgICB0ZWxlcG9ydENoYXJhY3RlcjogZnVuY3Rpb24oZWwsIHBsYXllcil7XG5cblxuICAgIH1cblxuICB9KTsgXG5cblxuICAgICAgICAgICAgICAvKnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgfSwgMTAwMCk7Ki9cbiAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgdmFyIGFuaW1hdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcbiAgICAgICAgICAgICAgYW5pbWF0b3Iuc2V0QXR0cmlidXRlKFwiYXR0cmlidXRlXCIsIFwicG9zaXRpb25cIik7XG4gICAgICAgICAgICAgIGFuaW1hdG9yLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwLCAwLCAwXCIpO1xuICAgICAgICAgICAgICBhbmltYXRvci5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjAgMTAgMFwiKTtcbiAgICAgICAgICAgICAgcGxheWVyLmFwcGVuZENoaWxkKGFuaW1hdG9yKTsqLyBcblxufTtcblxuZXhwb3J0cy5sYXVuY2ggPSBUZWxlcG9ydDsiLCJ2YXIgVG9yY2g9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndG9yY2gnLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9LFxuICAgICAgICB0YXJnZXQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gIFx0XHRcdHZhciBlbCA9IHRoaXMuZWw7XG4gIFx0XHRcdHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXG4gIFx0XHRcdHZhciBfbGlnaHQgPSBkYXRhLmxpZ2h0O1xuICAgICAgICB2YXIgX3RhcmdldCA9IGRhdGEudGFyZ2V0O1xuXG4gIFx0XHRcdGlmIChfbGlnaHQgPT0gdHJ1ZSl7XG5cbiAgXHRcdFx0XHRfbGlnaHQgPSAnOyBsaWdodDp0cnVlJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cbiAgXHRcdFx0ZWxzZXtcbiAgXHRcdFx0XG4gIFx0XHRcdFx0X2xpZ2h0ID0gJyc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG5cbiAgICAgICAgaWYgKF90YXJnZXQgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJzsgdGFyZ2V0X3RvX2FjdGl2YXRlOiAnICsgX3RhcmdldFxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIF90YXJnZXQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKF90YXJnZXQpO1xuXG4gICAgICB2YXIgY29sbGlkZXJfZW50aXR5ID0gJzxhLWVudGl0eSB0ZWxlcG9ydD1cImFjdGlvbjpsaWdodF90b3JjaCcgKyBfbGlnaHQgKyBfdGFyZ2V0ICsgJ1wiIGNsYXNzPVwiY29sbGlkYWJsZVwiIGdlb21ldHJ5PVwiXCIgbWF0ZXJpYWw9XCJ0cmFuc3BhcmVudDogdHJ1ZTsgb3BhY2l0eTogMCBcIiBwb3NpdGlvbj1cIjAgMC40NSAwXCIgc2NhbGU9XCIwLjIgMi4zIDAuMlwiID48L2EtZW50aXR5Pidcblx0XHRcdHZhciBvYmplY3QgPSAnPGEtb2JqLW1vZGVsIHNyYz1cInB1YmxpYy9tb2RlbHMvb2JqZWN0cy9maXJldG9yY2gub2JqXCIgb2JqLW1vZGVsPVwicHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmpcIiBzY2FsZT1cIjAuMDIgMC4wMiAwLjAyXCIgbWF0ZXJpYWw9XCJcIj48L2Etb2JqLW1vZGVsPidcblx0XHRcdHZhciBsaWdodCA9ICc8YS1saWdodCB0eXBlPVwicG9pbnRcIiBjb2xvcj1cInJnYigyNTUsIDE2OSwgMzUpXCIgaW50ZW5zaXR5PVwiMFwiIGRpc3RhbmNlPVwiMjAwXCIgcG9zaXRpb249XCIwIDEuNTQxIDBcIj48L2EtbGlnaHQ+J1xuXG5cdFx0XHRlbC5pbm5lckhUTUwgPSBjb2xsaWRlcl9lbnRpdHkgKyBvYmplY3QgKyBsaWdodDtcblxuICBcdFx0fVxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5nZW5lcmF0ZSA9IFRvcmNoOyIsInZhciBUZWxlcG9ydCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZWxlcG9ydC5qcycpO1xudmFyIFRvcmNoID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RvcmNoLmpzJyk7XG5cbndpbmRvdy5jb25zb2xlLmxvZygnbWFpbi5qcycpXG5UZWxlcG9ydC5sYXVuY2goKTtcdFxuVG9yY2guZ2VuZXJhdGUoKTsiXX0=
