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
      console.log('init');
      console.log(this.el);
      console.log('---------')
      var el = this.el;
      var data = this.data;
      var isIntersecting = false;

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


    /*    if ((isIntersecting != true) ||
           ((data.action == teleport) && (player.getAttribute('position') != data.target))){*/

        console.log(data.disable);

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
        data.disable = true;
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
 
      function light_torch(){

        interact();

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

  			console.log('DATA TORCh');
  			console.log(_light);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy90ZWxlcG9ydC5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwidmFyIFRlbGVwb3J0PSBmdW5jdGlvbigpe1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIEFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndGVsZXBvcnQnLCB7XG4gICAgZGVwZW5kZW5jaWVzOiBbJ3JheWNhc3RlciddLFxuICAgIHNjaGVtYToge1xuICAgICAgdGFyZ2V0OiB7dHlwZTogJ3ZlYzMnfSxcbiAgICAgIGFjdGlvbjoge3R5cGU6ICdzdHJpbmcnfSxcbiAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nfSxcbiAgICAgIGRpc2FibGU6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6ZmFsc2V9LFxuICAgICAgdGFyZ2V0X3RvX2FjdGl2YXRlOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH1cbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ2luaXQnKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZWwpO1xuICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLScpXG4gICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICB2YXIgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgdmFyIGdsb2JhbF90aW1lciA9IDA7XG4gICAgICBcbiAgICAgIHZhciBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVsZXBvcnRfbG9hZGVyJyk7XG4gICAgICB2YXIgYWN0aW9uX3RvX3BlcmZvcm0gPSBudWxsXG5cbiAgICAgIGNvbnNvbGUubG9nKGRhdGEuYWN0aW9uKTtcblxuICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcpe1xuXG4gICAgICAgIHZhciB0aW1lcl9ibGFja3NjcmVlbiA9IDA7XG4gICAgICAgIHZhciBwbGF5ZXIgPSAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJcIik7XG4gICAgICAgIHZhciBibGFja19zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsYWNrX3NjcmVlblwiKTtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IHRlbGVwb3J0XG5cblxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0Jyl7XG5cbiAgICAgICAgYWN0aW9uX3RvX3BlcmZvcm0gPSBpbnRlcmFjdFxuXG4gICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnbGlnaHRfdG9yY2gnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGxpZ2h0X3RvcmNoXG5cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJ0RBVEEgUFJJTlQnKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEubGlnaHQpO1xuICAgICAgaWYgKGRhdGEubGlnaHQgPT0gdHJ1ZSl7XG5cbiAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQoZWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCdhLWxpZ2h0JykpO1xuXG4gICAgICB9XG4gICAgICBlbHNle1xuXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncmF5Y2FzdGVyLWludGVyc2VjdGVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkKTtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQtY2xlYXJlZCcsIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKTsgXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKXtcblxuXG5cbiAgICAgICAgaWYgKGlzSW50ZXJzZWN0aW5nID09IGZhbHNlKXtcblxuICAgICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnICYmIChwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpICE9IGRhdGEudGFyZ2V0ICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSkpe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnIHx8IGRhdGEuYWN0aW9uID09IFwibGlnaHRfdG9yY2hcIikgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH0gXG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCgpe1xuXG5cbiAgICAvKiAgICBpZiAoKGlzSW50ZXJzZWN0aW5nICE9IHRydWUpIHx8XG4gICAgICAgICAgICgoZGF0YS5hY3Rpb24gPT0gdGVsZXBvcnQpICYmIChwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpICE9IGRhdGEudGFyZ2V0KSkpeyovXG5cbiAgICAgICAgY29uc29sZS5sb2coZGF0YS5kaXNhYmxlKTtcblxuICAgICAgICBpZiAoaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKSl7XG5cbiAgICAgICAgICBpc0ludGVyc2VjdGluZyA9IHRydWU7XG4gICAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cblxuICAgICAgICAgICAgZ2xvYmFsX3RpbWVyID0gc2V0VGltZW91dChhY3Rpb25fdG9fcGVyZm9ybSwgMTAwMCk7XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKXtcblxuICAgICAgICBpZiAoZ2xvYmFsX3RpbWVyKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZ2xvYmFsX3RpbWVyKTtcbiAgICAgICAgICBnbG9iYWxfdGltZXI9MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnRlcmFjdCgpe1xuXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnZ3JlZW4nKTtcbiAgICAgICAgZGF0YS5kaXNhYmxlID0gdHJ1ZTtcbiAgICAgICAgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKTtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0ZWxlcG9ydCgpe1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCd0ZWxlcG9ydGluZyAgJyk7XG5cbiAgICAgICAgc2hvd19ibGFja19zY3JlZW4oKVxuICAgICAgICBzZXRUaW1lb3V0KGhpZGVfYmxhY2tfc2NyZWVuLCAxMDAwKTsgXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvd19ibGFja19zY3JlZW4oKXtcblxuICAgICAgICBibGFja19zY3JlZW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS53ZWJraXRBbmltYXRpb25OYW1lID0gJ2FkZF9vcGFjaXR5JztcbiAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLndlYmtpdEFuaW1hdGlvbkR1cmF0aW9uID0gJzFzJztcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoaWRlX2JsYWNrX3NjcmVlbigpe1xuXG4gICAgICAgIFxuICAgICAgICBwbGF5ZXIuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIGRhdGEudGFyZ2V0ICk7XG4gICAgICAgIFxuICAgICAgICBibGFja19zY3JlZW4uc3R5bGUud2Via2l0QW5pbWF0aW9uTmFtZSA9ICdyZW1vdmVfb3BhY2l0eSc7XG4gICAgICAgIGJsYWNrX3NjcmVlbi5zdHlsZS53ZWJraXRBbmltYXRpb25EdXJhdGlvbiA9ICcxcyc7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgYmxhY2tfc2NyZWVuLnN0eWxlLm9wYWNpdHkgPSAwO1xuXG4gICAgICAgIH0sIDEwMDApXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24odGFyZ2V0KXtcblxuICAgICAgICB2YXIgbGlnaHRfYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnaW50ZW5zaXR5Jyk7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjEuNlwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVzaW5nXCIsIFwiZWFzZUluXCIpO1xuXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaWdodF9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMzAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIxLjhcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJ0b1wiLCBcIjIuNVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImRpcmVjdGlvblwiLCBcImFsdGVybmF0ZVwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVzaW5nXCIsIFwiZWFzZUluT3V0RWxhc3RpY1wiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInJlcGVhdFwiLCBcImluZGVmaW5pdGVcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwiZm9yd2FyZHNcIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cbiBcbiAgICAgIGZ1bmN0aW9uIGxpZ2h0X3RvcmNoKCl7XG5cbiAgICAgICAgaW50ZXJhY3QoKTtcblxuICAgICAgICBpZiAoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUgIT0gbnVsbCkge1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhLnRhcmdldF90b19hY3RpdmF0ZSk7XG4gICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkpXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUpLnNldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAnZGlzYWJsZScsIGZhbHNlKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkub2JqZWN0M0QudGVsZXBvcnQgPSAnZGlzYWJsZTpmYWxzZSc7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUpLmVtaXQoJ2RvVGhpbmcnKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkuZmx1c2hUb0RPTSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhLnRhcmdldF90b19hY3RpdmF0ZSkpXG5cblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxpZ2h0X29iamVjdCA9IGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpO1xuICAgICAgICBcbiAgICAgICAgY3JlYXRlX2xpZ2h0X3RyYW5zaXRpb24obGlnaHRfb2JqZWN0KVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApe1xuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBsaWdodF9vYmplY3QucmVtb3ZlQ2hpbGQobGlnaHRfb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoJ2EtYW5pbWF0aW9uJykpO1xuICAgICAgICAgICAgY3JlYXRlX2xpZ2h0X2FuaW1hdGlvbl9yZXBlYXQobGlnaHRfb2JqZWN0KVxuXG4gICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlX3RvcmNoKCl7XG4gICAgICAgIC8qdmFyIHRvcmNoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1vYmotbW9kZWwnKTtcbiAgICAgICAgdG9yY2guc2V0QXR0cmlidXRlKCdzcmMnLCAnLi4vLi4vcHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmonKTtcbiAgICAgICAgdG9yY2guc2V0QXR0cmlidXRlKCdvYmotbW9kZWwnLCAnLi4vLi4vcHVibGljL21vZGVscy9vYmplY3RzL2ZpcmV0b3JjaC5vYmonKTtcbiAgICAgICAgdG9yY2guc2V0QXR0cmlidXRlKCdzY2FsZScsICcwLjAyIDAuMDIgMC4wMicpO1xuXG4gICAgICAgIGVsLnBhcmVudE5vZGVcblxuICAgICAgICBzcmM9XCJwdWJsaWMvbW9kZWxzL29iamVjdHMvZmlyZXRvcmNoLm9ialwiIG9iai1tb2RlbD1cInB1YmxpYy9tb2RlbHMvb2JqZWN0cy9maXJldG9yY2gub2JqXCIgc2NhbGU9XCIwLjAyIDAuMDIgMC4wMlwiKi9cbiAgICAgIH1cblxuICAgIH0sIFxuXG4gICAgZG9UaGluZzogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygnSXQgaXMgZG9pbmcgc29tZXRoaW5nICEnKVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICBcbiAgICB9LFxuXG4gICAgaW50ZXJzZWN0SGFuZGxlcjogZnVuY3Rpb24oKXtcblxuICAgICAgXG4gICAgfSxcblxuICAgIGludGVyc2VjdFJlbW92YWxIYW5kbGVyOiBmdW5jdGlvbigpe1xuXG5cblxuICAgIH0sXG5cblxuICAgIHRlbGVwb3J0Q2hhcmFjdGVyOiBmdW5jdGlvbihlbCwgcGxheWVyKXtcblxuXG4gICAgfVxuXG4gIH0pOyBcblxuXG4gICAgICAgICAgICAgIC8qcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICB9LCAxMDAwKTsqL1xuICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICB2YXIgYW5pbWF0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuICAgICAgICAgICAgICBhbmltYXRvci5zZXRBdHRyaWJ1dGUoXCJhdHRyaWJ1dGVcIiwgXCJwb3NpdGlvblwiKTtcbiAgICAgICAgICAgICAgYW5pbWF0b3Iuc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjAsIDAsIDBcIik7XG4gICAgICAgICAgICAgIGFuaW1hdG9yLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMCAxMCAwXCIpO1xuICAgICAgICAgICAgICBwbGF5ZXIuYXBwZW5kQ2hpbGQoYW5pbWF0b3IpOyovIFxuXG59O1xuXG5leHBvcnRzLmxhdW5jaCA9IFRlbGVwb3J0OyIsInZhciBUb3JjaD0gZnVuY3Rpb24oKXtcblxuICBcdFwidXNlIHN0cmljdFwiO1xuXG4gIFx0QUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0b3JjaCcsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDpmYWxzZX0sXG4gICAgICAgIHRhcmdldDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9XG5cdCAgICB9LFxuXG4gIFx0XHRpbml0OmZ1bmN0aW9uKCl7XG5cbiAgXHRcdFx0dmFyIGVsID0gdGhpcy5lbDtcbiAgXHRcdFx0dmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgXHRcdFx0dmFyIF9saWdodCA9IGRhdGEubGlnaHQ7XG4gICAgICAgIHZhciBfdGFyZ2V0ID0gZGF0YS50YXJnZXQ7XG5cbiAgXHRcdFx0Y29uc29sZS5sb2coJ0RBVEEgVE9SQ2gnKTtcbiAgXHRcdFx0Y29uc29sZS5sb2coX2xpZ2h0KTtcblxuICBcdFx0XHRpZiAoX2xpZ2h0ID09IHRydWUpe1xuXG4gIFx0XHRcdFx0X2xpZ2h0ID0gJzsgbGlnaHQ6dHJ1ZSc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG4gIFx0XHRcdGVsc2V7XG4gIFx0XHRcdFxuICBcdFx0XHRcdF9saWdodCA9ICcnO1xuICBcdFx0XHRcbiAgXHRcdFx0fVxuXG4gICAgICAgIGlmIChfdGFyZ2V0ICE9IG51bGwpe1xuXG4gICAgICAgICAgX3RhcmdldCA9ICc7IHRhcmdldF90b19hY3RpdmF0ZTogJyArIF90YXJnZXRcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhfdGFyZ2V0KTtcblxuICAgICAgdmFyIGNvbGxpZGVyX2VudGl0eSA9ICc8YS1lbnRpdHkgdGVsZXBvcnQ9XCJhY3Rpb246bGlnaHRfdG9yY2gnICsgX2xpZ2h0ICsgX3RhcmdldCArICdcIiBjbGFzcz1cImNvbGxpZGFibGVcIiBnZW9tZXRyeT1cIlwiIG1hdGVyaWFsPVwidHJhbnNwYXJlbnQ6IHRydWU7IG9wYWNpdHk6IDAgXCIgcG9zaXRpb249XCIwIDAuNDUgMFwiIHNjYWxlPVwiMC4yIDIuMyAwLjJcIiA+PC9hLWVudGl0eT4nXG5cdFx0XHR2YXIgb2JqZWN0ID0gJzxhLW9iai1tb2RlbCBzcmM9XCJwdWJsaWMvbW9kZWxzL29iamVjdHMvZmlyZXRvcmNoLm9ialwiIG9iai1tb2RlbD1cInB1YmxpYy9tb2RlbHMvb2JqZWN0cy9maXJldG9yY2gub2JqXCIgc2NhbGU9XCIwLjAyIDAuMDIgMC4wMlwiIG1hdGVyaWFsPVwiXCI+PC9hLW9iai1tb2RlbD4nXG5cdFx0XHR2YXIgbGlnaHQgPSAnPGEtbGlnaHQgdHlwZT1cInBvaW50XCIgY29sb3I9XCJyZ2IoMjU1LCAxNjksIDM1KVwiIGludGVuc2l0eT1cIjBcIiBkaXN0YW5jZT1cIjIwMFwiIHBvc2l0aW9uPVwiMCAxLjU0MSAwXCI+PC9hLWxpZ2h0PidcblxuXHRcdFx0ZWwuaW5uZXJIVE1MID0gY29sbGlkZXJfZW50aXR5ICsgb2JqZWN0ICsgbGlnaHQ7XG5cblx0XHRcdGNvbnNvbGUubG9nKGVsKTtcblxuICBcdFx0fVxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5nZW5lcmF0ZSA9IFRvcmNoOyIsInZhciBUZWxlcG9ydCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZWxlcG9ydC5qcycpO1xudmFyIFRvcmNoID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3RvcmNoLmpzJyk7XG5cbndpbmRvdy5jb25zb2xlLmxvZygnbWFpbi5qcycpXG5UZWxlcG9ydC5sYXVuY2goKTtcdFxuVG9yY2guZ2VuZXJhdGUoKTsiXX0=
