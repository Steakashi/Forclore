AFRAME.registerComponent('teleport', {
  dependencies: ['raycaster'],
  schema: {
    target: {type: 'vec3'},
    action: {type: 'string'}
  },

  init: function () {
    console.log('init')
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

    this.el.addEventListener('raycaster-intersected', raycaster_intersected);
    this.el.addEventListener('raycaster-intersected-cleared', raycaster_intersected_cleared); 

    function interaction_is_possible(){

      if (isIntersecting == false){

        if (data.action == 'teleport' && (player.getAttribute('position') != data.target)){

          return true

        }
        else if (data.action == 'interact' && deactivate_interaction == false){

          return true

        } 

      }

      return false

    }
    
    function raycaster_intersected(){

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