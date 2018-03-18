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