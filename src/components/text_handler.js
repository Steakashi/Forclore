var TextHandler = function(){

  	"use strict";

  	AFRAME.registerComponent('text_handler', {
	  	schema: {
	      step: {type: 'int', default:1},
        text_list: {type: 'array', default: []}
	    },

  		init:function(){

        var text_list = load_text_list()

        console.log('init text');
        this.el.setAttribute('text', 'value', text_displayer(this.data.step));



        function load_text_list(){

          return [
            'Test de texte1',
            'Test de texte2'
          ]

        }

        function text_displayer(step){

          var text_to_return = ''
          switch(step){

            case 0:
              text_to_return = text_list[0];
              break;

            case 1:
              text_to_return = text_list[1];
              break;

            default:
              text_to_return = '';
              break;
          
          }

          return text_to_return

        }

  		}

   	}); 

};

exports.init = TextHandler;
