AFRAME.registerComponent('interaction', {
  dependencies: ['raycaster'],
  schema: {
    action: {type: string},
  },

  init: function () {
    console.log('init')
    var el = this.el;
    var data = this.data;
    var isIntersecting = false;

    var timer_teleport = 0;
    var timer_blackscreen = 0;
    var loader = document.getElementById('teleport_loader');
    var player =  document.querySelector("#player");

    this.el.addEventListener('raycaster-intersected', raycaster_intersected);
    this.el.addEventListener('raycaster-intersected-cleared', raycaster_intersected_cleared); 

    function raycaster_intersected(){

      if (isIntersecting == false && 
         (player.getAttribute('position') != data.target)) {

        isIntersecting = true
        loader.style.display = "block" 
        
        requestAnimationFrame(function(timestamp){

          timer_teleport = setTimeout(teleport, 1000);

        });

      }

    }

    function raycaster_intersected_cleared(){

      if (timer_teleport){
        clearTimeout(timer_teleport);
        timer_teleport=0;
      }

      loader.style.display = "none"
      isIntersecting = false;

    }

    function interact(){
      
    }

    function teleport(){

      show_black_screen()
      setTimeout(hide_black_screen, 1000); 

    }

    function show_black_screen(){

      black_screen.style.display = 'block';
      black_screen.style.webkitAnimationName = 'add_opacity';
      black_screen.style.webkitAnimationDuration = '1s';

    }

    function hide_black_screen(){

      el.setAttribute('material', 'color', 'green');
      player.setAttribute('position', data.target );
      
      black_screen.style.webkitAnimationName = 'remove_opacity';
      black_screen.style.webkitAnimationDuration = '1s';

      setTimeout(function(){

        black_screen.style.display = 'none';
        black_screen.style.opacity = 0;

      }, 1000)

    }

    function light_torch(){

      var light_animation = document.createElement('a-animation');
      light_animation.setAttribute({
        "attribute": "intensity",
        "dur": "1000",
        "from": "1.5",
        "to": "2.5"
      });
      console.log(el);
      console.log(el.parentNode);
      el.parentNode.querySelector('a-light').appendChild(light_animation);

    }

  }, 


}); 
/*
               dur="1000"
               fill="forwards"
               from="1.5"
               direction="alternate"
               esing="easeInOutElastic"
               to="2.5"
               repeat="indefinite">
*/
            /*requestAnimationFrame(function(timestamp){

              

            }, 1000);*/
            /*
            var animator = document.createElement('a-animation');
            animator.setAttribute("attribute", "position");
            animator.setAttribute("from", "0, 0, 0");
            animator.setAttribute("to", "0 10 0");
            player.appendChild(animator);*/ 