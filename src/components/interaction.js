var Interaction= function(){

  "use strict";

  AFRAME.registerComponent('interaction', {
    dependencies: ['raycaster'],
    schema: {
      target            : {type: 'vec3'},                   // Point location for teleport                                                                                                                                       
      action            : {type: 'string'},                 // Interaction type. Possible values : "teleport", "interact", "light_torch".                                                                                                                            
      light             : {type: 'boolean'},                // Create light animation if true                                                                                                                     
      target_to_activate: {type: 'string', default:null},   // List of teleport to activate if object is triggered. List of id separated by comma.                                                                                    
      event             : {type: 'string', default:null},   // Event to trigger if object is activated.                                                                                                                 
      disable           : {type: 'boolean', default:false}, // If true, block object interaction.                                                                                                                
      allowed           : {type: 'string', default:null},   // List of point from which the player can interact with the object. If null, interaction is possible from anywhere.                    
      step              : {type: 'int', default:0},         // If not empty, interaction will define the questbook to a specific step.                                                                                                                  
      message           : {type: 'string', default:null},   // Message to display when object is triggered.
      repeat            : {type: 'boolean', default:true},  // If false, action will not be triggered after first interaction.
      processing        : {type: 'boolean', default:false}  // Block multiple execution of script. Do not update this value !                                                                                                 
    },

    init: function () { 

      // Initialize important variables
      var el = this.el;
      var data = this.data

      var global_timer = 0;
      
      var loader = document.getElementById('teleport_loader');
      var action_to_perform = null;
      var player =  document.getElementById("player");
      var questbook = document.getElementById('questbook')

      var sphere_helper = '<a-sphere position="0 2 0" geometry="radius:0.1"></a-sphere>';
      var timer_black_screen = 0;
      var black_screen = document.getElementById("black_screen");

      action_to_perform = _detect_action_type(data.action)

      if (data.light == true){

        create_light_animation_repeat(el.parentNode.querySelector('a-light'));

      }
      else{

        this.el.addEventListener('raycaster-intersected', raycaster_intersected);
        this.el.addEventListener('raycaster-intersected-cleared', raycaster_intersected_cleared); 

      }

      /*
       * CHECKERS & HANDLERS
       */
      function _detect_action_type(action){

        if      (data.action == 'teleport'){    action_to_perform = teleport; }
        else if (data.action == 'interact'){    action_to_perform = interact; }
        else if (data.action == 'light_torch'){ action_to_perform = light_torch; }

        return action_to_perform

      }

      function _check_if_allowed(player_position){
        /**
         * Intermediate check function (called for teleport interaction type)
         * If allowed data is found, check if player can use teleporter by comparing player's position to all allowed tp's positions.
         * @param {vec3} [player_position] [Player position in space]
         */

        var value_to_return = false;

        if (data.allowed != null){
          var list_tp_allowed = data.allowed.split(',');

          list_tp_allowed.forEach(function(tp){
            if (player.getAttribute('position').x == document.getElementById(tp).getAttribute('teleport', 'target').target.x &&
                player.getAttribute('position').y == document.getElementById(tp).getAttribute('teleport', 'target').target.y &&
                player.getAttribute('position').z == document.getElementById(tp).getAttribute('teleport', 'target').target.z){
              
              value_to_return = true;

            }

          })

        }
        else{

          value_to_return = true;

        }
        
        return value_to_return

      }

      function _interaction_is_possible(){
        /**
         * Detect if interaction with current object is possible.
         * 1.   Check if general interaction is possible
         * 2.a. If interaction type is teleport and player position is different from object position, launch intermediate verification.
         * 2.b. If interaction type is different, juste check if interaction is enabled.
         */
        if (data.processing == false){
          var player_position = player.getAttribute('position')

          if (data.action == 'teleport' && 
            (player.getAttribute('position') != data.target && data.disable == false) &&
            _check_if_allowed()){

            return true

          }
          else if ((data.action == 'interact' || data.action == "light_torch") && data.disable == false){
            return true

          } 
        }
        return false

      }

      function _animation_mixin_handler(mixin_name, element){
        /**
         * Generate animation mixin for transitions and lights.
         * @param {string} [mixin_name] [Type of transition. Two values accepted : 
         *                               - "screen_hide" : progressively translate screen to black. 
         *                               - "screen_show" : progressively remove black screen.]
         */
        
        var animation = document.createElement('a-animation');
        animation.setAttribute("mixin", mixin_name);
        element.appendChild(animation);

      }

      function _event_handler(){

        if (data.event){ 

          var step = data.step.toString();
          el.emit('pass_step', step); 

        }

      }

      /*
       * RAYCASTING
       */
      
      function raycaster_intersected(){

        console.log('RAYCASTER INTERSECTED')

        if (_interaction_is_possible()){

          data.processing = true;

          loader.style.display = "block";
          
          requestAnimationFrame(function(timestamp){

            global_timer = setTimeout(function(){

              action_to_perform() 
              _event_handler();

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

        data.processing = false;

      }

      /*
       * ANIMATION HANDLERS
       */

      function hide_screen(){ _animation_mixin_handler('scene_hide', black_screen); }
      function show_screen(){ player.setAttribute('position', data.target ); _animation_mixin_handler('scene_show', black_screen); }
      function create_light_transition(target){ _animation_mixin_handler('create_light', target); }
      function create_light_animation_repeat(target){ _animation_mixin_handler('light_animation', target); }

      /*
       * CORE
       */
      function disable_future_interactions(){

        if (data.repeat == false){

          data.disable = true;
          raycaster_intersected_cleared();
        }

      }

      function activate_teleporters(){
        /**
         * Activate list of tps given by data.target_to_activate.
         */

        if (data.target_to_activate != null) {

          var list_tp_to_enable = data.target_to_activate.split(',');
          list_tp_to_enable.forEach(function(tp){

            document.getElementById(tp).setAttribute('teleport', 'disable', false);

          })

        }

      }

      function display_message(){

        console.log('DISPLAY MESSAGE');
        console.log(data.message);
        
        if (data.message != null){

          el.emit('display_text', data.message)
          loader.style.display = "none"

          setTimeout(function(){

            data.processing = false;

          }, 1000);

        } 
      }

      function teleport(){

        hide_screen();
        setTimeout(show_screen, 1000);
        display_message();

      }
 
      function interact(){
        disable_future_interactions();
        activate_teleporters();
        display_message();

      }

      function light_torch( ){

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

    }, 

    update: function(){

      this.init();

    }

  }); 

};

exports.init = Interaction;
