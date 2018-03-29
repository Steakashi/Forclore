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
