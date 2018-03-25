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