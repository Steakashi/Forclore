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
      step: {type: 'int', default:0},
      message: {type: 'string', default:null}

    },

    init: function () {
      var el = this.el;
      var isIntersecting = false;

      var global_timer = 0;

      var data = this.data
      this.data_test = this.data
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null;
      var player =  document.getElementById("player");
      var questbook = document.getElementById('questbook')

      if (data.action == 'teleport'){

        var sphere_helper = '<a-sphere position="0 2 0" geometry="radius:0.1"></a-sphere>';
        var timer_black_screen = 0;
        var black_screen = document.getElementById("black_screen");

        action_to_perform = teleport;
        //el.innerHTML = sphere_helper;


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

      function check_if_allowed(player_position){

        var value_to_return = false;

        if (data.allowed != null){
          var list_tp_allowed = data.allowed.split(',');
          console.log(player.getAttribute('position'));

          list_tp_allowed.forEach(function(tp){
            console.log(document.getElementById(tp).getAttribute('teleport', 'target').target);
            console.log(document.getElementById(tp).getAttribute('teleport', 'target').target.x);
            console.log(player.getAttribute('position').x);
            console.log(document.getElementById(tp).getAttribute('teleport', 'target').target.x == player.getAttribute('position').x)
            console.log(document.getElementById(tp).getAttribute('teleport', 'target').target.y);
            console.log(player.getAttribute('position').y);
            console.log(document.getElementById(tp).getAttribute('teleport', 'target').target.y == player.getAttribute('position').y)
            console.log(document.getElementById(tp).getAttribute('teleport', 'target').target.z);
            console.log(player.getAttribute('position').z);
            console.log(document.getElementById(tp).getAttribute('teleport', 'target').target.z == player.getAttribute('position').z)


            if (player.getAttribute('position').x == document.getElementById(tp).getAttribute('teleport', 'target').target.x &&
                player.getAttribute('position').y == document.getElementById(tp).getAttribute('teleport', 'target').target.y &&
                player.getAttribute('position').z == document.getElementById(tp).getAttribute('teleport', 'target').target.z){
              
              value_to_return = true;
              console.log('GOOD CONDITION');

            }

          })

        }
        else{

          value_to_return = true;

        }

        console.log(value_to_return);
        
        return value_to_return

      }

      function interaction_is_possible(){

        if (isIntersecting == false){

          console.log('isintersecing : false');
          console.log(el);


          var player_position = player.getAttribute('position')

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

        activate();
        data.disable = true;
        raycaster_intersected_cleared();

        if (data.message != null){

          el.emit('display_text', data.message)
          loader.style.display = "none"

          setTimeout(function(){

            isIntersecting = false;

          }, 10000);

        } 

      }

      function teleport(){

        show_black_screen();
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
        light_animation.setAttribute("to", "1");
        light_animation.setAttribute("easing", "linear");

        target.appendChild(light_animation);

      }

      function create_light_animation_repeat(target){

        var light_animation = document.createElement('a-animation');

        light_animation.setAttribute('attribute', 'intensity');
        light_animation.setAttribute("dur", "2000");
        light_animation.setAttribute("from", ".8");
        light_animation.setAttribute("to", "1.2");
        light_animation.setAttribute("direction", "alternate");
        light_animation.setAttribute("easing", "ease-in-out-elastic");
        light_animation.setAttribute("repeat", "indefinite");
        light_animation.setAttribute("fill", "forwards");

        target.appendChild(light_animation);

      }

      function activate(){

        if (data.target_to_activate != null) {

          var list_tp_to_enable = data.target_to_activate.split(',');

          list_tp_to_enable.forEach(function(tp){

            document.getElementById(tp).setAttribute('teleport', 'disable', false);

          })

        }

      }
 
      function light_torch( ){

        data.disable = true;
        raycaster_intersected_cleared();
        activate();

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
  			var light = '<a-light type="point" color="rgb(255, 189, 105)" intensity="0" distance="40" position="-0.032 2.022 -0.16"></a-light>'

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9xdWVzdGJvb2suanMiLCJzcmMvY29tcG9uZW50cy90ZWxlcG9ydC5qcyIsInNyYy9jb21wb25lbnRzL3RleHRfaGFuZGxlci5qcyIsInNyYy9jb21wb25lbnRzL3RvcmNoLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ2YXIgUXVlc3Rib29rPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3F1ZXN0Ym9vaycsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICAgc3RlcDoge3N0ZXA6J2ludCcsIGRlZmF1bHQ6MH1cblx0ICAgIH0sXG5cbiAgXHRcdGluaXQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgY29uc29sZS5sb2coJ1FVRVNUQk9PSycpO1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcblxuICAgICAgICB2YXIgdGV4dF9kaXNwbGF5ZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zb2xlLmxvZygncXVlc3Rib29rIGxhdW5jaGVkJyk7XG4gICAgICAgIHZhciB0ZXh0X2hhbmRsZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGV4dF9oYW5kbGVyJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHRfaGFuZGxlcik7XG5cbiAgICAgICAgZWwuc2NlbmVFbC5hZGRFdmVudExpc3RlbmVyKCdwYXNzX3N0ZXAnLCBwYXNzX3N0ZXApO1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhc3Nfc3RlcChzdGVwX3N0cmluZyl7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnUEFTUyBTVEVQJyk7XG4gICAgICAgICAgY29uc29sZS5sb2codGV4dF9kaXNwbGF5ZWQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nXG5cbiAgICAgICAgICBpZiAodGV4dF9kaXNwbGF5ZWQgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgICB0ZXh0X2Rpc3BsYXllZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Yoc3RlcF9zdHJpbmcpICE9ICdzdHJpbmcnKXtcblxuICAgICAgICAgICAgICB2YXIgc3RlcCA9IHBhcnNlSW50KHN0ZXBfc3RyaW5nLmRldGFpbCk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgdmFyIHN0ZXAgPSBzdGVwX3N0cmluZztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RlcCA9PSAwKXtcblxuICAgICAgICAgICAgICB2YXIgbmV3X3N0ZXAgPSBlbC5nZXRBdHRyaWJ1dGUoJ3F1ZXN0Ym9vaycsICdzdGVwJykuc3RlcCArIDFcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICB2YXIgbmV3X3N0ZXAgPSBzdGVwXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2cobmV3X3N0ZXApXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3F1ZXN0Ym9vaycsICdzdGVwJywgbmV3X3N0ZXApO1xuICAgICAgICAgICAgdmFyIHRleHQgPSBsb2FkX3RleHQobmV3X3N0ZXApO1xuXG4gICAgICAgICAgICBpZiAodGV4dCAhPSAnISFFTkQnKXtcblxuICAgICAgICAgICAgICBlbC5lbWl0KCdkaXNwbGF5X3RleHQnLCB0ZXh0KTtcblxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICB0ZXh0X2Rpc3BsYXllZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHBhc3Nfc3RlcCgnMCcpOyAgXG5cbiAgICAgICAgICAgICAgfSwgNjAwMCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZF90ZXh0KHN0ZXApe1xuXG4gICAgICAgICAgc3dpdGNoKHN0ZXApe1xuXG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIHJldHVybiAndGVzdCc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIHJldHVybiAndGVzdDInO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICchIUVORCc7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9LFxuXG4gICAgXG4gICAgICB0ZXN0X2Z1bmN0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZygndGVzdCBzdWNjZXNzZnVsbCAhJyk7XG4gICAgICB9LFxuXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKG9sZERhdGEpe1xuXG4gICAgICB9XG5cblxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5pbml0ID0gUXVlc3Rib29rOyIsInZhciBUZWxlcG9ydD0gZnVuY3Rpb24oKXtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICBBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RlbGVwb3J0Jywge1xuICAgIGRlcGVuZGVuY2llczogWydyYXljYXN0ZXInXSxcbiAgICBzY2hlbWE6IHtcbiAgICAgIHRhcmdldDoge3R5cGU6ICd2ZWMzJ30sXG4gICAgICBhY3Rpb246IHt0eXBlOiAnc3RyaW5nJ30sXG4gICAgICBsaWdodDoge3R5cGU6ICdib29sZWFuJ30sXG4gICAgICB0YXJnZXRfdG9fYWN0aXZhdGU6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDpudWxsfSxcbiAgICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICBkaXNhYmxlOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgIGFsbG93ZWQ6IHt0eXBlOidzdHJpbmcnLCBkZWZhdWx0Om51bGx9LFxuICAgICAgc3RlcDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OjB9LFxuICAgICAgbWVzc2FnZToge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0Om51bGx9XG5cbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICAgIHZhciBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICB2YXIgZ2xvYmFsX3RpbWVyID0gMDtcblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcbiAgICAgIHRoaXMuZGF0YV90ZXN0ID0gdGhpcy5kYXRhXG4gICAgICBcbiAgICAgIHZhciBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVsZXBvcnRfbG9hZGVyJyk7XG4gICAgICB2YXIgYWN0aW9uX3RvX3BlcmZvcm0gPSBudWxsO1xuICAgICAgdmFyIHBsYXllciA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYXllclwiKTtcbiAgICAgIHZhciBxdWVzdGJvb2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVlc3Rib29rJylcblxuICAgICAgaWYgKGRhdGEuYWN0aW9uID09ICd0ZWxlcG9ydCcpe1xuXG4gICAgICAgIHZhciBzcGhlcmVfaGVscGVyID0gJzxhLXNwaGVyZSBwb3NpdGlvbj1cIjAgMiAwXCIgZ2VvbWV0cnk9XCJyYWRpdXM6MC4xXCI+PC9hLXNwaGVyZT4nO1xuICAgICAgICB2YXIgdGltZXJfYmxhY2tfc2NyZWVuID0gMDtcbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxhY2tfc2NyZWVuXCIpO1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gdGVsZXBvcnQ7XG4gICAgICAgIC8vZWwuaW5uZXJIVE1MID0gc3BoZXJlX2hlbHBlcjtcblxuXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChkYXRhLmFjdGlvbiA9PSAnaW50ZXJhY3QnKXtcblxuICAgICAgICBhY3Rpb25fdG9fcGVyZm9ybSA9IGludGVyYWN0XG5cbiAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGRhdGEuYWN0aW9uID09ICdsaWdodF90b3JjaCcpe1xuXG4gICAgICAgIGFjdGlvbl90b19wZXJmb3JtID0gbGlnaHRfdG9yY2hcblxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5saWdodCA9PSB0cnVlKXtcblxuICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChlbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ2EtbGlnaHQnKSk7XG5cbiAgICAgIH1cbiAgICAgIGVsc2V7XG5cbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdyYXljYXN0ZXItaW50ZXJzZWN0ZWQnLCByYXljYXN0ZXJfaW50ZXJzZWN0ZWQpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3JheWNhc3Rlci1pbnRlcnNlY3RlZC1jbGVhcmVkJywgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQpOyBcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjaGVja19pZl9hbGxvd2VkKHBsYXllcl9wb3NpdGlvbil7XG5cbiAgICAgICAgdmFyIHZhbHVlX3RvX3JldHVybiA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChkYXRhLmFsbG93ZWQgIT0gbnVsbCl7XG4gICAgICAgICAgdmFyIGxpc3RfdHBfYWxsb3dlZCA9IGRhdGEuYWxsb3dlZC5zcGxpdCgnLCcpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykpO1xuXG4gICAgICAgICAgbGlzdF90cF9hbGxvd2VkLmZvckVhY2goZnVuY3Rpb24odHApe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHApLmdldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAndGFyZ2V0JykudGFyZ2V0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC54KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykueCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0cCkuZ2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICd0YXJnZXQnKS50YXJnZXQueCA9PSBwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLngpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0cCkuZ2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICd0YXJnZXQnKS50YXJnZXQueSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXIuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLnkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHApLmdldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAndGFyZ2V0JykudGFyZ2V0LnkgPT0gcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS55KVxuICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHApLmdldEF0dHJpYnV0ZSgndGVsZXBvcnQnLCAndGFyZ2V0JykudGFyZ2V0LnopO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS56KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC56ID09IHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykueilcblxuXG4gICAgICAgICAgICBpZiAocGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS54ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC54ICYmXG4gICAgICAgICAgICAgICAgcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS55ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC55ICYmXG4gICAgICAgICAgICAgICAgcGxheWVyLmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS56ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRwKS5nZXRBdHRyaWJ1dGUoJ3RlbGVwb3J0JywgJ3RhcmdldCcpLnRhcmdldC56KXtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHZhbHVlX3RvX3JldHVybiA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdHT09EIENPTkRJVElPTicpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgIHZhbHVlX3RvX3JldHVybiA9IHRydWU7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKHZhbHVlX3RvX3JldHVybik7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdmFsdWVfdG9fcmV0dXJuXG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW50ZXJhY3Rpb25faXNfcG9zc2libGUoKXtcblxuICAgICAgICBpZiAoaXNJbnRlcnNlY3RpbmcgPT0gZmFsc2Upe1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ2lzaW50ZXJzZWNpbmcgOiBmYWxzZScpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVsKTtcblxuXG4gICAgICAgICAgdmFyIHBsYXllcl9wb3NpdGlvbiA9IHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJylcblxuICAgICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PSAndGVsZXBvcnQnICYmIFxuICAgICAgICAgICAgKHBsYXllci5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgIT0gZGF0YS50YXJnZXQgJiYgZGF0YS5kaXNhYmxlID09IGZhbHNlKSAmJlxuICAgICAgICAgICAgY2hlY2tfaWZfYWxsb3dlZCgpKXtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICgoZGF0YS5hY3Rpb24gPT0gJ2ludGVyYWN0JyB8fCBkYXRhLmFjdGlvbiA9PSBcImxpZ2h0X3RvcmNoXCIpICYmIGRhdGEuZGlzYWJsZSA9PSBmYWxzZSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgICB9IFxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBldmVudF9oYW5kbGVyKCl7XG5cbiAgICAgICAgaWYgKGRhdGEuZXZlbnQpeyBcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdldmVudCBoYW5kbGVyIGZyb20gdGVsZXBvcnQnKTtcbiAgICAgICAgICAvL3F1ZXN0Ym9vay5zZXRBdHRyaWJ1dGUoJ3F1ZXN0Ym9vaycsICdzdGVwJywgMTAwKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhxdWVzdGJvb2spO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEuc3RlcCk7XG4gICAgICAgICAgdmFyIHN0ZXAgPSBkYXRhLnN0ZXAudG9TdHJpbmcoKTtcbiAgICAgICAgICBlbC5lbWl0KCdwYXNzX3N0ZXAnLCBzdGVwKTsgXG5cbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIHJheWNhc3Rlcl9pbnRlcnNlY3RlZCgpe1xuXG5cbiAgICAgICAgaWYgKGludGVyYWN0aW9uX2lzX3Bvc3NpYmxlKCkpe1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ2ludGVyYWN0aW9uIGlzIHBvc3NpYmxlICEnKTtcblxuICAgICAgICAgIGlzSW50ZXJzZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICBcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKXtcblxuICAgICAgICAgICAgZ2xvYmFsX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgIGFjdGlvbl90b19wZXJmb3JtKCkgXG4gICAgICAgICAgICAgIGV2ZW50X2hhbmRsZXIoKTtcblxuICAgICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKXtcblxuICAgICAgICBpZiAoZ2xvYmFsX3RpbWVyKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZ2xvYmFsX3RpbWVyKTtcbiAgICAgICAgICBnbG9iYWxfdGltZXI9MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcblxuICAgICAgICBpc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGludGVyYWN0KCl7XG5cbiAgICAgICAgYWN0aXZhdGUoKTtcbiAgICAgICAgZGF0YS5kaXNhYmxlID0gdHJ1ZTtcbiAgICAgICAgcmF5Y2FzdGVyX2ludGVyc2VjdGVkX2NsZWFyZWQoKTtcblxuICAgICAgICBpZiAoZGF0YS5tZXNzYWdlICE9IG51bGwpe1xuXG4gICAgICAgICAgZWwuZW1pdCgnZGlzcGxheV90ZXh0JywgZGF0YS5tZXNzYWdlKVxuICAgICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgaXNJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblxuICAgICAgICAgIH0sIDEwMDAwKTtcblxuICAgICAgICB9IFxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRlbGVwb3J0KCl7XG5cbiAgICAgICAgc2hvd19ibGFja19zY3JlZW4oKTtcbiAgICAgICAgc2V0VGltZW91dChoaWRlX2JsYWNrX3NjcmVlbiwgMTAwMCk7IFxuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNob3dfYmxhY2tfc2NyZWVuKCl7XG5cbiAgICAgICAgdmFyIGJsYWNrX3NjcmVlbl9hbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWFuaW1hdGlvbicpO1xuXG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAnb3BhY2l0eScpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImR1clwiLCBcIjEwMDBcIik7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZnJvbVwiLCBcIjBcIik7XG4gICAgICAgIGJsYWNrX3NjcmVlbl9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwidG9cIiwgXCIxXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImxpbmVhclwiKTtcblxuICAgICAgICBibGFja19zY3JlZW4uYXBwZW5kQ2hpbGQoYmxhY2tfc2NyZWVuX2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGlkZV9ibGFja19zY3JlZW4oKXtcbiAgICAgICAgXG4gICAgICAgIHBsYXllci5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgZGF0YS50YXJnZXQgKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBibGFja19zY3JlZW5fYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYS1hbmltYXRpb24nKTtcblxuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ29wYWNpdHknKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkdXJcIiwgXCIxMDAwXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIxXCIpO1xuICAgICAgICBibGFja19zY3JlZW5fYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMFwiKTtcbiAgICAgICAgYmxhY2tfc2NyZWVuX2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJlYXNpbmdcIiwgXCJsaW5lYXJcIik7XG5cbiAgICAgICAgYmxhY2tfc2NyZWVuLmFwcGVuZENoaWxkKGJsYWNrX3NjcmVlbl9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF90cmFuc2l0aW9uKHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMTAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwidG9cIiwgXCIxXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZWFzaW5nXCIsIFwibGluZWFyXCIpO1xuXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaWdodF9hbmltYXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZV9saWdodF9hbmltYXRpb25fcmVwZWF0KHRhcmdldCl7XG5cbiAgICAgICAgdmFyIGxpZ2h0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG5cbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlJywgJ2ludGVuc2l0eScpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIFwiMjAwMFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIuOFwiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMS4yXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZGlyZWN0aW9uXCIsIFwiYWx0ZXJuYXRlXCIpO1xuICAgICAgICBsaWdodF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZWFzaW5nXCIsIFwiZWFzZS1pbi1vdXQtZWxhc3RpY1wiKTtcbiAgICAgICAgbGlnaHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInJlcGVhdFwiLCBcImluZGVmaW5pdGVcIik7XG4gICAgICAgIGxpZ2h0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwiZm9yd2FyZHNcIik7XG5cbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGxpZ2h0X2FuaW1hdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKXtcblxuICAgICAgICBpZiAoZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUgIT0gbnVsbCkge1xuXG4gICAgICAgICAgdmFyIGxpc3RfdHBfdG9fZW5hYmxlID0gZGF0YS50YXJnZXRfdG9fYWN0aXZhdGUuc3BsaXQoJywnKTtcblxuICAgICAgICAgIGxpc3RfdHBfdG9fZW5hYmxlLmZvckVhY2goZnVuY3Rpb24odHApe1xuXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0cCkuc2V0QXR0cmlidXRlKCd0ZWxlcG9ydCcsICdkaXNhYmxlJywgZmFsc2UpO1xuXG4gICAgICAgICAgfSlcblxuICAgICAgICB9XG5cbiAgICAgIH1cbiBcbiAgICAgIGZ1bmN0aW9uIGxpZ2h0X3RvcmNoKCApe1xuXG4gICAgICAgIGRhdGEuZGlzYWJsZSA9IHRydWU7XG4gICAgICAgIHJheWNhc3Rlcl9pbnRlcnNlY3RlZF9jbGVhcmVkKCk7XG4gICAgICAgIGFjdGl2YXRlKCk7XG5cbiAgICAgICAgdmFyIGxpZ2h0X29iamVjdCA9IGVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignYS1saWdodCcpO1xuICAgICAgICBjcmVhdGVfbGlnaHRfdHJhbnNpdGlvbihsaWdodF9vYmplY3QpXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIGxpZ2h0X29iamVjdC5yZW1vdmVDaGlsZChsaWdodF9vYmplY3QucXVlcnlTZWxlY3RvcignYS1hbmltYXRpb24nKSk7XG4gICAgICAgICAgICBjcmVhdGVfbGlnaHRfYW5pbWF0aW9uX3JlcGVhdChsaWdodF9vYmplY3QpXG5cbiAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICB9KTtcblxuICAgICAgfVxuXG4gICAgfSwgXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCl7XG5cbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgfSxcblxuXG4gICAgaW50ZXJzZWN0SGFuZGxlcjogZnVuY3Rpb24oKXtcblxuICAgICAgXG4gICAgfSxcblxuICAgIGludGVyc2VjdFJlbW92YWxIYW5kbGVyOiBmdW5jdGlvbigpe1xuXG5cblxuICAgIH0sXG5cblxuICAgIHRlbGVwb3J0Q2hhcmFjdGVyOiBmdW5jdGlvbihlbCwgcGxheWVyKXtcblxuXG4gICAgfVxuXG4gIH0pOyBcblxufTtcblxuZXhwb3J0cy5sYXVuY2ggPSBUZWxlcG9ydDsiLCJ2YXIgVGV4dEhhbmRsZXIgPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RleHRfaGFuZGxlcicsIHtcblx0ICBcdHNjaGVtYToge1xuXHQgICAgICBzdGVwOiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6MH0sXG4gICAgICAgIHRleHRfbGlzdDoge3R5cGU6ICdhcnJheScsIGRlZmF1bHQ6IFtdfVxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBlbCA9IHRoaXMuZWwgICAgICAgIFxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdpbml0IHRleHQnKTtcbiAgICAgICAgLy90aGlzLmVsLnNldEF0dHJpYnV0ZSgndGV4dCcsICd2YWx1ZScsIHRoaXMudGV4dF9kaXNwbGF5ZXIodGhpcy5kYXRhLnN0ZXApKTtcbiAgICAgICAgLy9cbiAgICAgICAgXG4gICAgICAgIGVsLnNjZW5lRWwuYWRkRXZlbnRMaXN0ZW5lcignZGlzcGxheV90ZXh0JywgZGlzcGxheV90ZXh0KTtcblxuICAgICAgICBmdW5jdGlvbiBkaXNwbGF5X3RleHQodGV4dCl7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnQVJHX1RFU1QnKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcblxuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgndGV4dCcsICd2YWx1ZScsIHRleHQuZGV0YWlsKTtcblxuICAgICAgICAgIHZhciB0ZXh0X2FuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtYW5pbWF0aW9uJyk7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGUnLCAndGV4dC5vcGFjaXR5Jyk7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwiZHVyXCIsIDMwMDApO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImZyb21cIiwgXCIwXCIpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcInRvXCIsIFwiMVwiKTtcbiAgICAgICAgICB0ZXh0X2FuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoXCJkaXJlY3Rpb25cIiwgXCJhbHRlcm5hdGVcIik7XG4gICAgICAgICAgdGV4dF9hbmltYXRpb24uc2V0QXR0cmlidXRlKFwicmVwZWF0XCIsIDEpO1xuICAgICAgICAgIHRleHRfYW5pbWF0aW9uLnNldEF0dHJpYnV0ZShcImVhc2luZ1wiLCBcImVhc2Utb3V0LWV4cG9cIik7XG5cbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZCh0ZXh0X2FuaW1hdGlvbik7XG5cbiAgICAgICAgfVxuXG4gIFx0XHR9LFxuXG4gICAgICB0ZXh0X2Rpc3BsYXllcjogZnVuY3Rpb24oc3RlcCl7XG5cbiAgICAgICAgdmFyIHRleHRfdG9fcmV0dXJuID0gJydcbiAgICAgICAgc3dpdGNoKHN0ZXApe1xuXG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSB0aGlzLnRleHRfbGlzdFswXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSB0aGlzLnRleHRfbGlzdFsxXTtcbiAgICAgICAgICAgIGJyZWFrOyAgXG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGV4dF90b19yZXR1cm4gPSAnJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0ZXh0X3RvX3JldHVyblxuXG4gICAgICB9LFxuXG4gICBcdH0pOyBcblxufTtcblxuZXhwb3J0cy5pbml0ID0gVGV4dEhhbmRsZXI7XG4iLCJ2YXIgVG9yY2ggPSBmdW5jdGlvbigpe1xuXG4gIFx0XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgXHRBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RvcmNoJywge1xuXHQgIFx0c2NoZW1hOiB7XG5cdCAgICAgIGxpZ2h0OiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OmZhbHNlfSxcbiAgICAgICAgdGFyZ2V0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6bnVsbH0sXG4gICAgICAgIHN0ZXA6IHt0eXBlOiAnaW50JywgZGVmYXVsdDogMH1cblxuXHQgICAgfSxcblxuICBcdFx0aW5pdDpmdW5jdGlvbigpe1xuXG4gIFx0XHRcdHZhciBlbCA9IHRoaXMuZWw7XG4gIFx0XHRcdHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXG4gIFx0XHRcdHZhciBfbGlnaHQgPSBkYXRhLmxpZ2h0O1xuICAgICAgICB2YXIgX3RhcmdldCA9IGRhdGEudGFyZ2V0O1xuICAgICAgICB2YXIgX2V2ZW50ID0gZGF0YS5ldmVudDtcbiAgICAgICAgdmFyIF9zdGVwID0gZGF0YS5zdGVwO1xuXG4gIFx0XHRcdGlmIChfbGlnaHQgPT0gdHJ1ZSl7XG5cbiAgXHRcdFx0XHRfbGlnaHQgPSAnOyBsaWdodDp0cnVlJztcbiAgXHRcdFx0XG4gIFx0XHRcdH1cbiAgXHRcdFx0ZWxzZXtcbiAgXHRcdFx0XG4gIFx0XHRcdFx0X2xpZ2h0ID0gJyc7XG4gIFx0XHRcdFxuICBcdFx0XHR9XG5cbiAgICAgICAgaWYgKF90YXJnZXQgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJzsgdGFyZ2V0X3RvX2FjdGl2YXRlOiAnICsgX3RhcmdldDtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfdGFyZ2V0ID0gJyc7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfZXZlbnQgIT0gbnVsbCl7XG5cbiAgICAgICAgICBfZXZlbnQgPSAnOyBldmVudDogJyArIF9ldmVudDtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICBfZXZlbnQgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9zdGVwICE9IG51bGwpe1xuXG4gICAgICAgICAgX3N0ZXAgPSAnOyBzdGVwOiAnICsgX3N0ZXA7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgX3N0ZXAgPSAnJztcblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbGxpZGVyX2VudGl0eSA9ICc8YS1lbnRpdHkgdGVsZXBvcnQ9XCJhY3Rpb246bGlnaHRfdG9yY2gnICsgX2xpZ2h0ICsgX3RhcmdldCArIF9ldmVudCArIF9zdGVwICsgJ1wiIGNsYXNzPVwiY29sbGlkYWJsZVwiIGdlb21ldHJ5PVwiXCIgbWF0ZXJpYWw9XCJ0cmFuc3BhcmVudDogdHJ1ZTsgb3BhY2l0eTogMCBcIiBwb3NpdGlvbj1cIjAgMS4xMiAwXCIgc2NhbGU9XCIxIDIuNSAxXCIgPjwvYS1lbnRpdHk+J1xuICBcdFx0XHR2YXIgb2JqZWN0ID0gJzxhLWdsdGYtbW9kZWwgc3JjPVwiI3RvcmNoX21vZGVsXCI+PC9hLWdsdGYtbW9kZWw+J1xuICAgICAgICAvL3ZhciBvYmplY3QgPSAnPGEtZW50aXR5IGdsdGYtbW9kZWw9XCJzcmM6IHVybCguLi9tb2RlbHMvb2JqZWN0cy90b3JjaC5nbHRmKTtcIiA+PC9hLWVudGl0eT4nXG4gIFx0XHRcdHZhciBsaWdodCA9ICc8YS1saWdodCB0eXBlPVwicG9pbnRcIiBjb2xvcj1cInJnYigyNTUsIDE4OSwgMTA1KVwiIGludGVuc2l0eT1cIjBcIiBkaXN0YW5jZT1cIjQwXCIgcG9zaXRpb249XCItMC4wMzIgMi4wMjIgLTAuMTZcIj48L2EtbGlnaHQ+J1xuXG4gIFx0XHRcdGVsLmlubmVySFRNTCA9IGNvbGxpZGVyX2VudGl0eSArIG9iamVjdCArIGxpZ2h0O1xuXG4gICAgXHR9XG5cbiAgIFx0fSk7IFxuXG59O1xuXG5leHBvcnRzLmdlbmVyYXRlID0gVG9yY2g7XG4iLCJ2YXIgVGVsZXBvcnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGVsZXBvcnQuanMnKTtcbnZhciBUb3JjaCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90b3JjaC5qcycpO1xuLy92YXIgRXllcyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9leWVzLmpzJyk7XG52YXIgVGV4dEhhbmRsZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGV4dF9oYW5kbGVyLmpzJyk7XG52YXIgUXVlc3Rib29rID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3F1ZXN0Ym9vay5qcycpO1xuXG53aW5kb3cuY29uc29sZS5sb2coJ21haW4uanMnKVxuVGVsZXBvcnQubGF1bmNoKCk7XHRcblRvcmNoLmdlbmVyYXRlKCk7XG4vL0V5ZXMub3Blbl9leWVzKCk7XG5UZXh0SGFuZGxlci5pbml0KCk7XG5RdWVzdGJvb2suaW5pdCgpOyJdfQ==
