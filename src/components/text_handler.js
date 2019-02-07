var TextHandler = function(){

  	"use strict";

  	AFRAME.registerComponent('text_handler', {
	  	schema: {
	      step: {type: 'int', default:0},
        text_list: {type: 'array', default: []}
	    },

  		init:function(){

        var el = this.el        
        el.sceneEl.addEventListener('display_text', display_text);

        function display_text(text){

          var animation_found = document.getElementById('text_animation_id');
          if (animation_found){
            animation_found.parentNode.removeChild(animation_found)
          }

          el.setAttribute('text', 'value', text.detail);
          var animation = document.createElement('a-animation');
          animation.setAttribute("mixin", 'text_animation');
          animation.setAttribute("id", 'text_animation_id');
          el.appendChild(animation);

        }

  		},

   	}); 

};

exports.init = TextHandler;
