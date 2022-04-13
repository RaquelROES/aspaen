# aspaen
/*
*   Javascript principal con la estructura básica del estilo
*/

(function (blink) {
	'use strict';
	var aspaenStyle = function () {
        blink.theme.styles["pearson_generic"].apply(this, arguments);
    };
	aspaenStyle.prototype = {
		parent: blink.theme.styles["pearson_generic"].prototype,
		bodyClassName: 'content_type_clase_aspaen',
		extraPlugins: ['image2'],
		ckEditorStyles: {
			name: 'aspaen',
			styles: [
				{ name: 'Título 1', element: 'h4', attributes: { 'class': 'bck-title1'} },
				{ name: 'Título 2', element: 'h4', attributes: { 'class': 'bck-title2'} },
				{ name: 'Título 3', element: 'h4', attributes: { 'class': 'bck-title3'} },

				{ name: 'Énfasis', element: 'span', attributes: { 'class': 'bck-enfasis' }},
				{ name: 'Énfasis2', element: 'span', attributes: { 'class': 'bck-enfasis2' }},

				{ name: 'Lista ordenada1', element: 'ol', attributes: { 'class': 'bck-ol1' } },
				{ name: 'Lista ordenada2', element: 'ol', attributes: { 'class': 'bck-ol2' } },
				{ name: 'Lista ordenada3', element: 'ol', attributes: { 'class': 'bck-ol3' } },
				//{ name: 'Lista desordenada', element: 'ul', attributes: { 'class': '' } },
				{ name: 'Caja actividad', type: 'widget', widget: 'blink_box', attributes: { 'class': 'box-1' } },

				{ name: 'Tabla sin bordes', element: 'table', type: 'bck-stack-class', attributes: { 'class': 'bck-table-no-border'} },
				{ name: 'Celda encabezado', element: 'td', attributes: { 'class': 'bck-td-a' } },
			]
		},
        slidesTitle: {},
        init: function (scope) {  
			var that = scope || this;
			this.parent.init.call(this.parent, that);
        },
		removeFinalSlide: function () {
			this.parent.removeFinalSlide.call(this.parent, this);
		},
		configEditor: function (editor) {
			editor.dtd.$removeEmpty['span'] = false;
		},
        getEditorStyles: function () {
			return this.ckEditorStyles;
		}, 
		addActivityTitle: function () {
			if (!blink.courseInfo || !blink.courseInfo.unit) return;
			$('.libro-left').find('.title').html(function () { 
				return $(this).html().trim() + ' > ' + blink.courseInfo.unit;
			});
		},
	};



	
	aspaenStyle.prototype = _.extend({}, new blink.theme.styles["pearson_generic"](), aspaenStyle.prototype);

    blink.theme.styles['aspaen'] = aspaenStyle;


})(blink);



$(function () {
	loadJSON(function (json) {
	})
});
/**
 * loadJSON Ejecuta una llamada asíncrona dependiendo del entorno para obtener el cursoJSON
 * @param  	function 	callback 	Función de callback del ajax.
 * @return 	boolean		False en caso de que no haya callback.
 */
function loadJSON(callback) {
	if (!callback && typeof callback === 'undefined') {
		return false;
	}

	if (!blink.isApp) { //online
		blink.getCourse(window.idcurso).done(callback);
	} else { //local
		var url = window.location.href.replace("curso2", "curso_json");

		if (offline) {
			if (url.indexOf("curso_json") > -1) {
				url = removeParams(['idtema', 'idalumno'], url);
			}
		}

		$.ajax({
			url: url,
			dataType: 'json',
			beforeSend: function (xhr) {
				if (xhr.overrideMimeType) xhr.overrideMimeType("application/json");
			},
			success: callback
		});
	}
}

// ████░██▄░▄██░████░████░████▄░██▄░██░░▄███▄░░██░░
// ██▄░░░▀███▀░░░██░░██▄░░██░██░███▄██░██▀░▀██░██░░
// ██▀░░░▄███▄░░░██░░██▀░░████▀░██▀███░███████░██░░
// ████░██▀░▀██░░██░░████░██░██░██░░██░██░░░██░████


var pearsonheApp = window.pearsonheApp || {};

pearsonheApp.courseData = '';
pearsonheApp.tags = {
    home : 'home_pearsongeneric',
    unithead : 'unit_head_pearsongeneric'
}

pearsonheApp.text = {
    menu : 'Menu'
}

pearsonheApp.getCourseData = function() {

    loadJSON(function(json) {
        pearsonheApp.courseData = json;
        pearsonheApp.init();
    });

}
pearsonheApp.getActualUnitActivities = function() {
		var curso = blink.getCourse(idcurso),
			that = this,
			units,
			unitSubunits,
			actualActivity,
			unitActivities = [];


		curso.done(function () {

			units = curso.responseJSON.units;
			if(blink.courseInfo)
			$.each(units, function () {
				if (this.id && this.id == blink.courseInfo.IDUnit) {
					unitSubunits = this.subunits.concat(this.resources);
				}
			});

			actualActivity = _.find(unitSubunits, function(subunit) {
				return subunit.id == idclase;
			});

			if (typeof actualActivity !== "undefined" && actualActivity.level == '6') {
				unitActivities.push(actualActivity);
			} else {
				unitActivities = _.filter(unitSubunits, function(subunit) {
					return subunit.type == 'actividad' && subunit.level !== '6';
				});
			}

			that.subunits = unitActivities;
			pearsonheApp.customBookIndex(curso.responseJSON);
		}).done(function(){
			blink.events.trigger('course_loaded');
		});
}

pearsonheApp.customBookIndex = function(data) {

    if (data !== undefined){
        pearsonheApp.courseData = data;
    } else {
        data = pearsonheApp.courseData;
    }


    var newBookIndexHeader = '<div class="pearsonhe-bookindex-header"><h2 class="pearsonhe-title-1">'+pearsonheApp.text.menu+'</h2></div>';
	var headerExists = $('#book-index #wrapper .pearsonhe-bookindex-header').length;

	if (!headerExists) $('#book-index #wrapper').prepend(newBookIndexHeader);

	$.each(data.units, function(i, unit) {
		var unitId = unit.id,
				unitTags = unit.tags,
				unitTagsArray = (typeof unitTags !== 'undefined') ? unitTags.toLowerCase().split(" ") : [];

		var $listUnitsItem = $('#list-units li[data-id="'+unitId+'"]');

		if (unitTagsArray.length) {
			if (unitTagsArray.indexOf(pearsonheApp.tags.home) >= 0 ) {
				//$listUnitsItem.hide();
			}

			if (unitTagsArray.indexOf(pearsonheApp.tags.unithead) >= 0 ) {
				$listUnitsItem.addClass('pearsonhe-toc-unithead');
				if ($listUnitsItem.prevAll('li').first().hasClass('pearsonhe-toc-unithead')) {
					$listUnitsItem.prevAll('li').first().addClass('pearsonhe-toc-unithead_empty');
				}
				if (!$listUnitsItem.nextAll('li').length) {
					$listUnitsItem.addClass('pearsonhe-toc-unithead_empty');
				}
			}
		}
	});

	$('#list-units li.pearsonhe-toc-unithead.disabled').each(function(i,e) {
		if ($(e).nextAll('li').first().hasClass('pearsonhe-toc-unithead') || !$(e).nextAll('li').length) {
			$(e).addClass('pearsonhe-toc-unithead_empty');
		} else {
			$(e).removeClass('disabled locked').addClass('pearsonhe-toc-disabled');
		}
	});

	if (!$('#list-units li.pearsonhe-toc-unithead').length) {
		$('#list-units li').addClass('pearsonhe-toc-subunit-active pearsonhe-toc-subunit-woparent');
	}
	if ($('#list-units li.pearsonhe-toc-unithead').first().prevAll('li:not(.pearsonhe-toc-home)').length) {
		$('#list-units li.pearsonhe-toc-unithead').first().prevAll('li:not(.pearsonhe-toc-home)').addClass('pearsonhe-toc-subunit-active pearsonhe-toc-subunit-woparent');
	}

	var $currentParent = $('#book-index .current-parent');
	if (!$currentParent.hasClass('pearsonhe-toc-unithead')) {
		$currentParent
			.addClass('pearsonhe-toc-subunit-active')
			.prevUntil('.pearsonhe-toc-unithead', 'li')
				.addClass('pearsonhe-toc-subunit-active')
				.end()
			.nextUntil('.pearsonhe-toc-unithead', 'li')
				.addClass('pearsonhe-toc-subunit-active');
	} else {
		$currentParent.addClass('pearsonhe-toc-active').nextUntil('.pearsonhe-toc-unithead', 'li').addClass('pearsonhe-toc-subunit-active');
	}

}

pearsonheApp.getTocInfo = function() {

    var data = pearsonheApp.courseData;

    $.each(data.units, function(i, unit) {
		// debugger;
        var unitTitle = unit.title,
            unitDescription = unit.description,
            unitId = unit.id,
			unitTags = unit.tags;

			var unitTagsArray = (typeof unitTags !== 'undefined') ? unitTags.toLowerCase().split(" ") : [];

			var newHeader = '<div class="pearson-header"><h2 class="pearsonhe-title-1">'+unitTitle+'</h2><div class="pearsonhe-description">'+unitDescription+'</div></div>';

        var $currentUnit = $('#indice .unit-content[data-id="'+unitId+'"]');
        $currentUnit.find('.content').prepend(newHeader);

        var $currentListUnit = $('#list-units li[data-id="'+unitId+'"]');

        if (unitTagsArray.length) {
		
            if (unitTagsArray.indexOf(pearsonheApp.tags.home) >= 0 ) {
                $currentUnit.addClass('pearsonhe-toc-home pearsonhe-toc-home-content');
                $currentListUnit.addClass('pearsonhe-toc-home');
            }

            if (unitTagsArray.indexOf(pearsonheApp.tags.unithead) >= 0 ) {
                $currentListUnit.addClass('pearsonhe-toc-unithead');
                if ($currentListUnit.prevAll('li').first().hasClass('pearsonhe-toc-unithead')) {
                    $currentListUnit.prevAll('li').first().addClass('pearsonhe-toc-unithead_empty');
                }
                if (!$currentListUnit.nextAll('li').length) {
                    $currentListUnit.addClass('pearsonhe-toc-unithead_empty');
                }
			}
			
		}else{
		//	$currentListUnit.hide();			
		}
			
			

        

        $.each(unit.subunits, function(i, subunit) {

			var subunitId = subunit.id,
					subunitTag = subunit.tags;

			var subunitTagsArray = (typeof subunitTag !== 'undefined') ? subunitTag.toLowerCase().split(" ") : ['self'];

			var $subunitIdItem = $('#indice .unit-content .item[data-id="'+subunitId+'"]');

			if (subunitTagsArray.length) {
				$subunitIdItem.addClass('pearsonhe-icon');

				$.each(subunitTagsArray, function(i, tag) {
					$subunitIdItem.addClass('pearsonhe-icon-'+tag);
				});
			}

        });
    });

    var $current = $('#list-units .litema.active');
    $current.addClass('pearsonhe-toc-active').nextUntil('.pearsonhe-toc-unithead', 'li').addClass('pearsonhe-toc-subunit-active');

    if (!$current.hasClass('pearsonhe-toc-unithead')){
        $current.addClass('pearsonhe-toc-subunit-active').prevUntil('.pearsonhe-toc-unithead', 'li').addClass('pearsonhe-toc-subunit-active').prevAll('.pearsonhe-toc-unithead').first().addClass('pearsonhe-toc-unithead-ancestor');
    } else {
        $current.addClass('pearsonhe-toc-unithead-ancestor');
    }

    if (!$('#list-units li.pearsonhe-toc-unithead').length) {
        $('#list-units li').addClass('pearsonhe-toc-subunit-active pearsonhe-toc-subunit-woparent');
    }
    if ($('#list-units li.pearsonhe-toc-unithead').first().prevAll('li:not(.pearsonhe-toc-home)').length) {
        $('#list-units li.pearsonhe-toc-unithead').first().prevAll('li:not(.pearsonhe-toc-home)').addClass('pearsonhe-toc-subunit-active pearsonhe-toc-subunit-woparent');
    }
}


// INIT

pearsonheApp.init = function() {

    pearsonheApp.getTocInfo();

}


$(document).ready(function() {

	// Libros Digitales
	if (window.bpdf)
		bpdf.pines.getTypes = function() { return [-1,1,2,3,4,7,8,10,11,12,14,15] };

	blink.specialicons = {
		"10": {
			cl: 'open-gradable',
			bg: 'actividad'
		},
		"11": {
			cl: 'closed-gradable',
			bg: 'actividad'
		},
		"12": {
			cl: 'open-non-gradable',
			bg: 'actividad'
		},
		"14": {
			cl: 'answer-key',
			bg: 'actividad'
		},
		"15": {
			cl: 'teacher-tip',
			bg: 'actividad'
		}
	}

    pearsonheApp.getCourseData();
	pearsonheApp.getActualUnitActivities();
	if(!blink.user.esAlumno()){
		$("body").addClass("not-student");
	}

    $('body').on('click', '#list-units .js-indice-tema', function() {

        if (!$(this).hasClass('pearsonhe-toc-unithead')) {
            $(this).prevAll('li.pearsonhe-toc-unithead').first().addClass('pearsonhe-toc-unithead-ancestor');
        } else {
            var $sublevels = $(this).nextUntil('.pearsonhe-toc-unithead', 'li');
            if ($(this).hasClass('pearsonhe-toc-active')) {
                if ($sublevels.first().hasClass('pearsonhe-toc-subunit-active')) {
                    $(this).removeClass('pearsonhe-toc-unithead-ancestor');
                } else {
                    $(this).addClass('pearsonhe-toc-unithead-ancestor');
                }
                $sublevels.toggleClass('pearsonhe-toc-subunit-active');} else {
                $(this).addClass('pearsonhe-toc-unithead-ancestor');
                $sublevels.addClass('pearsonhe-toc-subunit-active');
            }
        }
        if ($(this).hasClass('pearsonhe-toc-disabled')) {
            $('#book-index .col-main').addClass('pearsonhe-hidden');
        } else {
            $('#book-index .col-main').removeClass('pearsonhe-hidden');

        }
        $(this).siblings('li').removeClass('pearsonhe-toc-active').end().addClass('pearsonhe-toc-active');
    });

	
});
Slide.prototype.resetAnswersBeforeShowPartialSolution = true;

Slide_multiplechoice.prototype.showNextSolution = function(){
	var id = -1;
	var $isLastElem = true;
	for (var i=0; i<this.numElementos; i++) {
		if (this.useExamples && this.exampleIndex == i) continue;
		var $elemsNoSol = $("[id*="+this.prefijo+"v" + i + "]." + this.solutionStyleClass);
		if (id == -1) {
			if (this.isSolution(i)) {
				if($elemsNoSol.length==0){
			 		id = i;
					this.solutionPartialShown = true;
			 		this.showElemSolution(id);
			 	}
			 }
		} else {
	 		//si es la ultima solucion cambiamos estados a que todas las soluciones se estan viendo.
		 	if($elemsNoSol.length==0) {
		 		$isLastElem = false;
			 	break;
		 	}
		}
	}
	if($isLastElem){
		switchSolution(this.prefijo);
	}
	this.setReviewButtons();
};

Slide.prototype.reviewButtons.principal["btn-next"] = {
	"btnTextDef" : textweb('aspaen_nextAnswer'),
	isVisible: function (slide, status) {
		return slide.tienePistas || (slide.esJuegoAutoevaluable && !slide.isDone()) || null;
	},
	isActive: function(slide, status) {
		return !slide.solutionShown || slide.esJuegoAutoevaluable || null;
	},
	"statusOptions" : {
		"conIntentos" 		: { "visible" : true, 	"active"	: true 	},
		"conTodoRelleno" 	: { "visible" : true, 	"active"	: true 	},
		"sinIntentos" 		: { "visible" : true, 	"active"	: true 	},
		"sinRespuesta" 		: { "visible" : true, 	"active"	: true 	},
		"solucion" 			: { "visible" : true, 	"active"	: false	},
		"pistaMostrada"		: { "visible" : true, 	"active"	: false	},
		"juegoRelleno"		: { "visible" : true, 	"active"	: true 	},
		"juegoSinIntentos" 	: { "visible" : true, 	"active"	: true 	},
		"solucionJuego" 	: { "visible" : true, 	"active"	: false },
		"juegoCorreccion" 	: { "visible" : false, 	"active"	: false	},
		"juegoRevision" 	: { "visible" : false, 	"active"	: false }
	}
};

Slide.prototype.reviewButtons.principal["btn-solution"] = {
	"btnTextDef" : textweb('aspaen_solution'),
	isVisible: function(slide, status) {
		return slide.tienePistas || slide.esJuegoAutoevaluable || null;
	},
	isActive: function(slide, status) {
		return slide.tienePistas || slide.esJuegoAutoevaluable || null;
	},
	"statusOptions" : {
		"conIntentos" 		: { "visible" : true, 	"active"	: true 	},
		"conTodoRelleno" 	: { "visible" : true, 	"active"	: true 	},
		"sinIntentos" 		: { "visible" : true, 	"active"	: true 	},
		"sinRespuesta" 		: { "visible" : true, 	"active"	: true 	},
		"solucion" 			: { "visible" : true, 	"active"	: true  },
		"pistaMostrada"		: { "visible" : true, 	"active"	: true	},
		"correccion" 		: { "visible" : true, 	"active"	: true 	},
		"revision" 			: { "visible" : true, 	"active"	: true 	},
		"juegoRelleno"		: { "visible" : true, 	"active"	: true 	},
		"juegoSinIntentos" 	: { "visible" : true, 	"active"	: true 	},
		"solucionJuego" 	: { "visible" : true, 	"active"	: true  },
		"juegoCorreccion" 	: { "visible" : true, 	"active"	: true 	},
		"juegoRevision" 	: { "visible" : true, 	"active"	: true 	}
	}
};
