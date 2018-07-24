var Teleport= function(){

  "use strict";

  AFRAME.registerComponent('teleport', {
    dependencies: ['raycaster'],
    schema: {
      target            : {type: 'vec3'},                   // Point location for teleport                                                                                                                                       
      action            : {type: 'string'},                 // Interaction type. Possible values : "teleport", "interact", "light_torch".                                                                                                                            
      light             : {type: 'boolean'},                // Create light animation if true                                                                                                                     
      target_to_activate: {type: 'string', default:null},   // List of teleport to activate if object triggered. List of id separated by comma.                                                                                    
      event             : {type: 'string', default:null},   // Event to trigger if object activated.                                                                                                                 
      disable           : {type: 'boolean', default:false}, // If true, block object interaction.                                                                                                                
      allowed           : {type:'string', default:null},    // List of point from which the player can interact with the object. If null, interaction is possible from anywhere.                    
      step              : {type: 'int', default:0},         // If not empty, interaction will define the questbook to a specific step.                                                                                                                  
      message           : {type: 'string', default:null}    // Message to display when object triggered.                                                                                                                    

    },

    init: function () { 

      var el = this.el;
      var data = this.data
      var isIntersecting = false;

      var global_timer = 0;
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null;
      var player =  document.getElementById("player");
      var questbook = document.getElementById('questbook')

      var sphere_helper = '<a-sphere position="0 2 0" geometry="radius:0.1"></a-sphere>';
      var timer_black_screen = 0;
      var black_screen = document.getElementById("black_screen");

      action_to_perform = detect_action_type(data.action)

      if (data.light == true){

        create_light_animation_repeat(el.parentNode.querySelector('a-light'));

      }
      else{

        this.el.addEventListener('raycaster-intersected', raycaster_intersected);
        this.el.addEventListener('raycaster-intersected-cleared', raycaster_intersected_cleared); 

      }

      function detect_action_type(action){

        if      (data.action == 'teleport'){    action_to_perform = teleport; }
        else if (data.action == 'interact'){    action_to_perform = interact; }
        else if (data.action == 'light_torch'){ action_to_perform = light_torch; }

        return action_to_perform

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