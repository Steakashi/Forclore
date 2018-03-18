(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
var Teleport= function(){

  "use strict";

  AFRAME.registerComponent('teleport', {
    dependencies: ['raycaster'],
    schema: {
      target: {type: 'vec3'},
      action: {type: 'string'},
      light: {type: 'boolean'}
    },

    init: function () {
      console.log('init');
      console.log(this.el);
      console.log('---------')
      var el = this.el;
      var data = this.data;
      var isIntersecting = false;
      var deactivate_interaction = false;

      var global_timer = 0;
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null

      console.log(data.action);

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

      console.log('DATA PRINT');
      console.log(data.light);
      if (data.light == true){

        create_light_animation_repeat(el.parentNode.querySelector('a-light'));

      }
      else{

        this.el.addEventListener('raycaster-intersected', raycaster_intersected);
        this.el.addEventListener('raycaster-intersected-cleared', raycaster_intersected_cleared); 

      }

      function interaction_is_possible(){

        if (isIntersecting == false){

          if (data.action == 'teleport' && (player.getAttribute('position') != data.target)){

            return true

          }
          else if ((data.action == 'interact' || data.action == "light_torch") && deactivate_interaction == false){

            return true

          } 

        }

        return false

      }
      
      function raycaster_intersected(){

        console.log('interaction')

    /*    if ((isIntersecting != true) ||
           ((data.action == teleport) && (player.getAttribute('position') != data.target))){*/

        if (interaction_is_possible()){

          isIntersecting = true;
          loader.style.display = "block";
          
          requestAnimationFrame(function(timestamp){


            global_timer = setTimeout(action_to_perform, 1000);

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
        deactivate_interaction = true;
        raycaster_intersected_cleared();

      }

      function teleport(){

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
        light_animation.setAttribute("dur", "1400");
        light_animation.setAttribute("from", "0");
        light_animation.setAttribute("to", "1.2");
        light_animation.setAttribute("esing", "easeOut");

        target.appendChild(light_animation);

      }

      function create_light_animation_repeat(target){

        var light_animation = document.createElement('a-animation');

        light_animation.setAttribute('attribute', 'intensity');
        light_animation.setAttribute("dur", "2000");
        light_animation.setAttribute("from", "1");
        light_animation.setAttribute("to", "1.6");
        light_animation.setAttribute("direction", "alternate");
        light_animation.setAttribute("esing", "easeInOutElastic");
        light_animation.setAttribute("repeat", "indefinite");
        light_animation.setAttribute("fill", "forwards");

        target.appendChild(light_animation);

      }
 
      function light_torch(){

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
	      light: {type: 'boolean', default:''}
	    },

  		init:function(){

  			var el = this.el;
  			var data = this.data;

  			var _light = data.light;

  			console.log('DATA TORCh');
  			console.log(_light);

  			if (_light == true){

  				_light = '; light:true';
  			
  			}
  			else{
  			
  				_light = '';
  			
  			}


			var collider_entity = '<a-entity teleport="action:light_torch' + _light + '" class="collidable" geometry="" transparent="true" position="0 0.45 0" scale="0.2 2.3 0.2" ></a-entity>'
			var object = '<a-obj-model src="public/models/objects/firetorch.obj" obj-model="public/models/objects/firetorch.obj" scale="0.02 0.02 0.02" material=""></a-obj-model>'
			var light = '<a-light type="point" color="orange" intensity="0" distance="100" position="0 1.541 0"></a-light>'

			el.innerHTML = collider_entity + object + light;

			console.log(el);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy90ZWxlcG9ydC5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ2YXIgVGVsZXBvcnQ9IGZ1bmN0aW9uKCl7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZWxlcG9ydCcsIHtcbiAgICBkZXBlbmRlbmNpZXM6IFsncmF5Y2FzdGVyJ10sXG4gICAgc2NoZW1hOiB7XG4gICAgICB0YXJnZXQ6IHt0eXBlOiAndmVjMyd9LFxuICAgICAgYWN0aW9uOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbid9XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdpbml0Jyk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmVsKTtcbiAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0nKVxuICAgICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgICAgdmFyIGlzSW50ZXJzZWN0aW5nID0gZmFsc2U7XG4gICAgICB2YXIgZGVhY3RpdmF0ZV9pbnRlcmFjdGlvbiA9IGZhbHNlO1xuXG4gICAgICB2YXIgZ2xvYmFsX3RpbWVyID0gMDtcbiAgICAgIFxuICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZWxlcG9ydF9sb2FkZXInKTtcbiAgICAgIHZhciBhY3Rpb25fdG9fcGVyZm9ybSA9IG51bGxcblxuICAgICAgY29uc29sZS5sb2coZGF0YS5hY3Rpb24pO1xuXG4gICAgICBpZiAoZGF0YS5hY3Rpb24gPT0gJ3RlbGVwb3J0Jyl7XG5cbiAgICAgICAgdmFyIHRpbWVyX2JsYWNrc2NyZWVuID0gMDtcbiAgICAgICAgdmFyIHBsYXllciA9ICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllclwiKTtcbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxhY2tfc2NyZWVuXCIpO1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gdGVsZXBvcnRcblxuXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGludGVyYWN0XG5cbiAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdsaWdodF90b3JjaCcpe1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gbGlnaHRfdG9yY2hcblxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZygnREFUQSBQUklOVCcpO1xuICAgICAgY29uc29sZS5sb2coZGF0YS5saWdodCk7XG4gICAgICBpZiAoZGF0YS5saWdodCA9PSB0cnVlKXtcblxuICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKSk7XG5cbiAgICAgIH1cbiAgICAgIGVsc2V7XG5cbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWQpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZC1jbGVhcmVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQpOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpe1xuXG4gICAgICAgIGlmIChpc0ludGVyc2VjdGluZyA9PSBmYWxzZSl7XG5cbiAgICAgICAgICBpZiAoZGF0YS5hY3Rpb24gPT0gJ3RlbGVwb3J0JyAmJiAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSAhPSBkYXRhLnRhcmdldCkpe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnIHx8IGRhdGEuYWN0aW9uID09IFwibGlnaHRfdG9yY2hcIikgJiYgZGVhY3RpdmF0ZV9pbnRlcmFjdGlvbiA9PSBmYWxzZSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9IFxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiByYXljYXN0ZXJfaW50ZXJzZWN0ZWQoKXtcblxuICAgICAgICBjb25zb2xlLmxvZygnaW50ZXJhY3Rpb24nKVxuXG4gICAgLyogICAgaWYgKChpc0ludGVyc2VjdGluZyAhPSB0cnVlKSB8fFxuICAgICAgICAgICAoKGRhdGEuYWN0aW9uID09IHRlbGVwb3J0KSAmJiAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSAhPSBkYXRhLnRhcmdldCkpKXsqL1xuXG4gICAgICAgIGlmIChpbnRlcmFjdGlvbl9pc19wb3NzaWJsZSgpKXtcblxuICAgICAgICAgIGlzSW50ZXJzZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICBcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuXG4gICAgICAgICAgICBnbG9iYWxfdGltZXIgPSBzZXRUaW1lb3V0KGFjdGlvbl90b19wZXJmb3JtLCAxMDAwKTtcblxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByYXljYXN0ZXJfaW50ZXJzZWN0ZWRfY2xlYXJlZCgpe1xuXG4gICAgICAgIGlmIChnbG9iYWxfdGltZXIpe1xuICAgICAgICAgIGNsZWFyVGltZW91dChnbG9iYWxfdGltZXIpO1xuICAgICAgICAgIGdsb2JhbF90aW1lcj0wO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgICBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGludGVyYWN0KCl7XG5cbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsICdjb2xvcicsICdncmVlbicpO1xuICAgICAgICBkZWFjdGl2YXRlX2ludGVyYWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0ZWxlcG9ydCgpe1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCd0ZWxlcG9ydGluZyAgJyk7XG5cbiAgICAgICAgc2hvd19ibGFja19zY3JlZW4oKVxuICAgICAgICBzZXRUaW1lb3V0KGhpZGVfYmxhY2tfc2NyZWVuLCAxMDAwKTsgXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvd19ibGFja19zY3JlZW4oKXtcblxuICAgICAgICBibGFja19zY3JlZW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS53ZWJraXRBbmltYXRpb25OYW1lID0gJ2FkZF9vcGFjaXR5JztcbiAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLndlYmtpdEFuaW1hdGlvbkR1cmF0aW9uID0gJzFzJztcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoaWRlX2JsYWNrX3NjcmVlbigpe1xuXG4gICAgICAgIFxuICAgICAgICBwbGF5ZXIuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIGRhdGEudGFyZ2V0ICk7XG4gICAgICAgIFxuICAgICAgICBibGFja19zY3JlZW4uc3R5bGUud2Via2l0QW5pbWF0aW9uTmFtZSA9ICdyZW1vdmVfb3BhY2l0eSc7XG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS53ZWJraXRBbmltYXRpb25EdXJhdGlvbiA9ICcxcyc7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLm9wYWNpdHkgPSAwO1xuXG4gICAgICAgIH0sIDEwMDApXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24odGFyZ2V0KXtcblxuICAgICAgICB2YXIgbGlnaHRfYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnaW50ZW5zaXR5Jyk7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxNDAwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjEuMlwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVzaW5nXCIsIFwiZWFzZU91dFwiKTtcblxuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobGlnaHRfYW5pbWF0aW9uKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdCh0YXJnZXQpe1xuXG4gICAgICAgIHZhciBsaWdodF9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZScsICdpbnRlbnNpdHknKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjIwMDBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmcm9tXCIsIFwiMVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMS42XCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZGlyZWN0aW9uXCIsIFwiYWx0ZXJuYXRlXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZXNpbmdcIiwgXCJlYXNlSW5PdXRFbGFzdGljXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwicmVwZWF0XCIsIFwiaW5kZWZpbml0ZVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJmb3J3YXJkc1wiKTtcblxuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobGlnaHRfYW5pbWF0aW9uKTtcblxuICAgICAgfVxuIFxuICAgICAgZnVuY3Rpb24gbGlnaHRfdG9yY2goKXtcblxuICAgICAgICBpbnRlcmFjdCgpO1xuXG4gICAgICAgIHZhciBsaWdodF9vYmplY3QgPSBlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKTtcbiAgICAgICAgXG4gICAgICAgIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKGxpZ2h0X29iamVjdClcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgbGlnaHRfb2JqZWN0LnJlbW92ZUNoaWxkKGxpZ2h0X29iamVjdC5xdWVyeVNlbGVjdG9yKCdhLWFuaW1hdGlvbicpKTtcbiAgICAgICAgICAgIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KGxpZ2h0X29iamVjdClcblxuICAgICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV90b3JjaCgpe1xuICAgICAgICAvKnZhciB0b3JjaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Etb2JqLW1vZGVsJyk7XG4gICAgICAgIHRvcmNoLnNldEF0dHJpYnV0ZSgnc3JjJywgJy4uLy4uL3B1YmxpYy9tb2RlbHMvb2JqZWN0cy9maXJldG9yY2gub2JqJyk7XG4gICAgICAgIHRvcmNoLnNldEF0dHJpYnV0ZSgnb2JqLW1vZGVsJywgJy4uLy4uL3B1YmxpYy9tb2RlbHMvb2JqZWN0cy9maXJldG9yY2gub2JqJyk7XG4gICAgICAgIHRvcmNoLnNldEF0dHJpYnV0ZSgnc2NhbGUnLCAnMC4wMiAwLjAyIDAuMDInKTtcblxuICAgICAgICBlbC5wYXJlbnROb2RlXG5cbiAgICAgICAgc3JjPVwicHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmpcIiBvYmotbW9kZWw9XCJwdWJsaWMvbW9kZWxzL29iamVjdHMvZmlyZXRvcmNoLm9ialwiIHNjYWxlPVwiMC4wMiAwLjAyIDAuMDJcIiovXG4gICAgICB9XG5cbiAgICB9LCBcblxuICAgIGRvVGhpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coJ0l0IGlzIGRvaW5nIHNvbWV0aGluZyAhJylcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpe1xuICAgICAgXG4gICAgfSxcblxuICAgIGludGVyc2VjdEhhbmRsZXI6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIFxuICAgIH0sXG5cbiAgICBpbnRlcnNlY3RSZW1vdmFsSGFuZGxlcjogZnVuY3Rpb24oKXtcblxuXG5cbiAgICB9LFxuXG5cbiAgICB0ZWxlcG9ydENoYXJhY3RlcjogZnVuY3Rpb24oZWwsIHBsYXllcil7XG5cblxuICAgIH1cblxuICB9KTsgXG5cblxuICAgICAgICAgICAgICAvKnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgfSwgMTAwMCk7Ki9cbiAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgdmFyIGFuaW1hdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcbiAgICAgICAgICAgICAgYW5pbWF0b3Iuc2V0QXR0cmlidXRlKFwiYXR0cmlidXRlXCIsIFwicG9zaXRpb25cIik7XG4gICAgICAgICAgICAgIGFuaW1hdG9yLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwLCAwLCAwXCIpO1xuICAgICAgICAgICAgICBhbmltYXRvci5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjAgMTAgMFwiKTtcbiAgICAgICAgICAgICAgcGxheWVyLmFwcGVuZENoaWxkKGFuaW1hdG9yKTsqLyBcblxufTtcblxuZXhwb3J0cy5sYXVuY2ggPSBUZWxlcG9ydDsiLCJ2YXIgVG9yY2g9IGZ1bmN0aW9uKCl7XG5cbiAgXHRcInVzZSBzdHJpY3RcIjtcblxuICBcdEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndG9yY2gnLCB7XG5cdCAgXHRzY2hlbWE6IHtcblx0ICAgICAgbGlnaHQ6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6Jyd9XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgXHRcdFx0dmFyIGVsID0gdGhpcy5lbDtcbiAgXHRcdFx0dmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgXHRcdFx0dmFyIF9saWdodCA9IGRhdGEubGlnaHQ7XG5cbiAgXHRcdFx0Y29uc29sZS5sb2coJ0RBVEEgVE9SQ2gnKTtcbiAgXHRcdFx0Y29uc29sZS5sb2coX2xpZ2h0KTtcblxuICBcdFx0XHRpZiAoX2xpZ2h0ID09IHRydWUpe1xuXG4gIFx0XHRcdFx0X2xpZ2h0ID0gJzsgbGlnaHQ6dHJ1ZSc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG4gIFx0XHRcdGVsc2V7XG4gIFx0XHRcdFxuICBcdFx0XHRcdF9saWdodCA9ICcnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuXG5cblx0XHRcdHZhciBjb2xsaWRlcl9lbnRpdHkgPSAnPGEtZW50aXR5IHRlbGVwb3J0PVwiYWN0aW9uOmxpZ2h0X3RvcmNoJyArIF9saWdodCArICdcIiBjbGFzcz1cImNvbGxpZGFibGVcIiBnZW9tZXRyeT1cIlwiIHRyYW5zcGFyZW50PVwidHJ1ZVwiIHBvc2l0aW9uPVwiMCAwLjQ1IDBcIiBzY2FsZT1cIjAuMiAyLjMgMC4yXCIgPjwvYS1lbnRpdHk+J1xuXHRcdFx0dmFyIG9iamVjdCA9ICc8YS1vYmotbW9kZWwgc3JjPVwicHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmpcIiBvYmotbW9kZWw9XCJwdWJsaWMvbW9kZWxzL29iamVjdHMvZmlyZXRvcmNoLm9ialwiIHNjYWxlPVwiMC4wMiAwLjAyIDAuMDJcIiBtYXRlcmlhbD1cIlwiPjwvYS1vYmotbW9kZWw+J1xuXHRcdFx0dmFyIGxpZ2h0ID0gJzxhLWxpZ2h0IHR5cGU9XCJwb2ludFwiIGNvbG9yPVwib3JhbmdlXCIgaW50ZW5zaXR5PVwiMFwiIGRpc3RhbmNlPVwiMTAwXCIgcG9zaXRpb249XCIwIDEuNTQxIDBcIj48L2EtbGlnaHQ+J1xuXG5cdFx0XHRlbC5pbm5lckhUTUwgPSBjb2xsaWRlcl9lbnRpdHkgKyBvYmplY3QgKyBsaWdodDtcblxuXHRcdFx0Y29uc29sZS5sb2coZWwpO1xuXG4gIFx0XHR9XG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmdlbmVyYXRlID0gVG9yY2g7IiwidmFyIFRlbGVwb3J0ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RlbGVwb3J0LmpzJyk7XG52YXIgVG9yY2ggPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdG9yY2guanMnKTtcblxud2luZG93LmNvbnNvbGUubG9nKCdtYWluLmpzJylcblRlbGVwb3J0LmxhdW5jaCgpO1x0XG5Ub3JjaC5nZW5lcmF0ZSgpOyJdfQ==
