	experimentr.hideNext();
//  	experimentr.release();

	var config = {
		canvasWidth: 1050,
		canvasHeight: 700,
		targetWidth: 250,
		targetHeight: 100,
		legendWidth: 800,
		legendHeight: 100,
		graphWidth: 800,
		graphHeight: 600
	};
	
	var state = null;
	var hasResp = false;
	
    var levels = [1, 2, 3, 4, 5];
    
    var svg = null;
    var targetGroup = null;
    var legend = null;
	var nodes = null;
	var links = null;
	var link = null;
	var node = null;
	var groupLegendSvg = null;
	var groupLegend = null;
	
	var prepareStartTime = null;
	var prepareTime = null;

    var decorators = {};
    var hints = {};

	var conditions = ['sat_value'];				

	var tasks = [
			['vs', 'cp'], ['cp', 'vs'], ['vs', 'cp'], ['cp', 'vs'], 
			['vs', 'cp'], ['cp', 'vs'], ['vs', 'cp'], ['cp', 'vs'], 
			['vs', 'cp'], ['cp', 'vs'], ['vs', 'cp'], ['cp', 'vs']];

	var vsTemplate = [
		{type: 'Strength', param: 1}, 
		{type: 'Strength', param: 3}, 
		{type: 'Strength', param: 5},
		{type: 'Certainty', param: 1}, 
		{type: 'Certainty', param: 3}, 
		{type: 'Certainty', param: 5}
	];
	var cpTemplate = [
		{type: 'Strength', param: 'LM'}, 
		{type: 'Strength', param: 'MH'}, 
		{type: 'Strength', param: 'LH'},
		{type: 'Certainty', param: 'LM'}, 
		{type: 'Certainty', param: 'MH'}, 
		{type: 'Certainty', param: 'LH'}
	];
	
	var numTask = 2;
	var numDiff = 1;
	var trialPerDiff = 6;
	var trialPerTask = numDiff * trialPerDiff;
	var trialPerCon = trialPerTask * numTask;

	var subject = 'A8';
	var condition = null;
	var difficulty = null;
	var task = null;
    var subResp = null;
    var vsCounter = {
    	'S': {
	    	1: 16,
    		3: 16,
    		5: 16
    	},
    	'C': {
	    	1: 16,
    		3: 16,
    		5: 16
    	}
    };
    var cpCounter = {
    	'S': {
	    	'LM': 16,
    		'MH': 16,
    		'LH': 16
    	},
    	'C': {
	    	'LM': 16,
    		'MH': 16,
    		'LH': 16
    	}
    };
	var counter = 0
	var targetType = null;
	var targetParam = null;
	var candidates = null;
	var conId = null;
	var taskId = null;
	var blockId = null;
    var dataPath = null;
    var dataPathA = null;
    var dataPathB = null;
	var vsData = null;
	var cpDataA = null;
	var cpDataB = null;
		
	var trialTargets = [];
	var trialCandis = [];

	var strengthData = [];
	var certaintyData = [];
	
	var widthLevels = [
			[5, 7, 9, 11, 14], // [easy]
			[5, 6, 7, 9, 11] // [difficult]
	];
	var valueLevels = [
			[0.936943605, 0.8008065, 0.68445, 0.585, 0.5], //[easy]
			[0.84448008, 0.740772, 0.6498, 0.57, 0.5] // [difficult]
	];
	var satLevels = [
			[0.01, 0.18, 0.42, 0.68, 1], // [easy]
			[0.15, 0.3, 0.6, 0.8, 1] // [difficult]
	];
	var transLevels = [
			[0.1, 0.22, 0.4, 0.65, 1], // [easy]
			[0.25, 0.35, 0.53, 0.72, 1] // [difficult]
	];
	var grainLevels = [
			[8, 0], // [easy]
			[4, 0] // [difficult]
	];
	var blurLevels = [
			[8,6,4,2,0], // [easy]
			[4,3,2,1,0] // [difficult]
	];
	var hueLevels = [
			[216, 200, 188, 178, 170], // [easy]
			[216, 210, 204, 198, 192] // [difficult]
	];
	
	for (var i = 0; i < 5; ++i) {
		strengthData.push({strength: i+1, certainty: 5});
		certaintyData.push({certainty: i+1, strength: 5});
	}

    decorators['width_value'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = widthLevels;
		var diffLevelsB = valueLevels;
		var widthMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var valueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', function(d) {
				return widthMap(d.strength);
			})
			.style('stroke', function(d) {
				var value = valueMap(d.certainty);
				return d3.hsl(216, 1, value).toString();
			});
	};

    decorators['width_blur'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = widthLevels;
		var diffLevelsB = blurLevels;
		var widthMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var blurMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', function(d) {
				return widthMap(d.strength);
			})
			.style('stroke', '#0066ff')
			.style('filter', function(d) {
				return 'url(#blur' + blurMap(d.certainty) + ')';
			});	
	};

    decorators['width_grain'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = widthLevels;
		var diffLevelsB = grainLevels;
		var widthMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var dashMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', function(d) {
				return widthMap(d.strength);
			})
			.style('stroke', '#0066ff')
			.attr('stroke-dasharray', function(d) {
				var dashValue = dashMap(d.certainty); 
				return (dashValue + ", " + dashValue);				
			});
	};

    decorators['width_trans'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = widthLevels;
		var diffLevelsB = transLevels;
		var widthMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var opacityMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', function(d) {
				return widthMap(d.strength);
			})
			.style('stroke', '#0066ff')
			.style('stroke-opacity', function(d) {
				return opacityMap(d.certainty);
			});	
	};

    decorators['sat_value'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = satLevels;
		var diffLevelsB = valueLevels;
		var satMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var valueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var sat = satMap(d.strength);
				var value = valueMap(d.certainty);
				return d3.hsl(216, sat, value).toString();
			});
	};

    decorators['sat_blur'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = satLevels;
		var diffLevelsB = blurLevels;
		var satMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var blurMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var sat = satMap(d.strength);
				return d3.hsl(216, sat, 0.5).toString();
			})	
			.style('filter', function(d) {
				return 'url(#blur' + blurMap(d.certainty) + ')';
			});	
	};

    decorators['sat_grain'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = satLevels;
		var diffLevelsB = grainLevels;
		var satMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var dashMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var sat = satMap(d.strength);
				return d3.hsl(216, sat, 0.5).toString();
			})				
			.attr('stroke-dasharray', function(d) {
				var dashValue = dashMap(d.certainty); 
				return (dashValue + ", " + dashValue);				
			});
	};

    decorators['sat_trans'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = [
			[0.04, 1],
			[0.2, 1]
		];
		var diffLevelsB = [
			[0.04, 1],
			[0.2, 1],
		];
		var satMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var opacityMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var sat = satMap(d.strength);
				return d3.hsl(216, sat, 0.5).toString();
			})			
			.style('stroke-opacity', function(d) {
				return opacityMap(d.certainty);
			});	
	};

    decorators['hue_value'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = hueLevels;
		var diffLevelsB = valueLevels;
		var hueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var valueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var hue = hueMap(d.strength);
				var value = valueMap(d.certainty);
				return d3.hsl(hue, 1, value).toString();
			});
	};

    decorators['hue_blur'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = hueLevels;
		var diffLevelsB = blurLevels;
		var hueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var blurMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var hue = hueMap(d.strength);
				return d3.hsl(hue, 1, 0.5).toString();
			})	
			.style('filter', function(d) {
				return 'url(#blur' + blurMap(d.certainty) + ')';
			});	
	};

    decorators['hue_grain'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = hueLevels;
		var diffLevelsB = grainLevels;
		var hueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var dashMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var hue = hueMap(d.strength);
				return d3.hsl(hue, 1, 0.5).toString();
			})				
			.attr('stroke-dasharray', function(d) {
				var dashValue = dashMap(d.certainty); 
				return (dashValue + ", " + dashValue);				
			});
	};

    decorators['hue_trans'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = hueLevels;
		var diffLevelsB = transLevels;
		var hueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var opacityMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var hue = hueMap(d.strength);
				return d3.hsl(hue, 1, 0.5).toString();
			})			
			.style('stroke-opacity', function(d) {
				return opacityMap(d.certainty);
			});	
	};
    
    decorators['width'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = widthLevels;
		var widthMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', function(d) {
				return widthMap(d);
			})
			.style('stroke', '#0066ff');
    };

    decorators['value'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = valueLevels;
		var valueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var value = valueMap(d);
				return d3.hsl(216, 1, value).toString();
			});
    };

    decorators['sat'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = satLevels;
		var satMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var sat = satMap(d);
				return d3.hsl(216, sat, 0.5).toString();
			});
    };

    decorators['trans'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = transLevels;
		var opacityMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', '#0066ff')
			.style('stroke-opacity', function(d) {
				return opacityMap(d);
			});
    };

    decorators['grain'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = grainLevels;
		var dashMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', '#0066ff')
			.attr('stroke-dasharray', function(d) {
				var dashValue = dashMap(d); 
				return (dashValue + ", " + dashValue);				
			});
    };

    decorators['blur'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = blurLevels;
		var blurMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', '#0066ff')
			.style('filter', function(d) {
				return 'url(#blur' + blurMap(d) + ')';
			});
    };
    
    decorators['hue'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = hueLevels;
		var hueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				return d3.hsl(hueMap(d), 1, 0.5).toString();
			});
    };    
    
    hints['width'] = 'Edges with higher strength levels are wider.';
    hints['value'] = 'Edges with higher certainty levels are darker.';
    hints['sat'] = 'Edges with higher strength levels are more saturated (i.e. more intense, or more "colorful").';
    hints['trans'] = 'Edges with higher certainty levels are more opaque.';
    hints['grain'] = 'Edges with higher certainty levels have more dense texture.';
    hints['blur'] = 'Edges with higher certainty levels are less fuzzy.';
    hints['hue'] = 'Edges with higher strength levels are greener.';

  	$(document).ready(function() {
  		appendTrialSVG('trial');
		setParameters();
  		appendGroupLegend();
		appendStartControl();  	
		appendBreakDiv();
  		appendResponseDiv();
	});

    $(document).bind('keypress', function(e) {
    	if (e.which >= 49 && e.which <= 50) { 
    		hasResp = true;
    		userResp = parseInt(String.fromCharCode(e.which));
    		var display = '';
    		if (task === 'vs') {
    			display = (userResp === 1) ? 'Present' : 'Missing';
    			subResp = (userResp === 1) ? 1 : 0;
    		}
    		else {
    			display = (userResp === 1) ? 'Left' : 'Right';
    			subResp = (userResp === 1) ? 1 : 0;
    		}
	    	d3.select('#userResp').text(display);
    		showNextBtn();
    	}
    	if (e.which === 32) { // space
    		if (state === 'startControl') {
				hideStartControl();
				showTarget();				
    		}
    	}
    	if (e.which === 13) { // enter
    		if (state === 'target') {
    			prepareTime = (new Date() - prepareStartTime) / 1000;
  				showTrial();
  				hideShowTrialBtn();
  				var timeAlloc = 5.5 * 1000;
  				if (task === 'cp') {
  					timeAlloc = 3 * 1000;
  				}
  				setTimeout(timeUp, timeAlloc);
    		}
    		else if (state === 'response' && hasResp === true) {
    			startNewTrial();
    		}
    	}
    });
    

/* UI modules creation functions */    


	function appendGroupLegend() {

		groupLegend = svg.append('g')
			.attr('width', config.legendWidth)
			.attr('height', config.legendHeight)
			.attr("transform", "translate(190, 200)");

  		var div = d3.select('.main')
  			.append('div')
  			.attr('class', 'groupLegend')
  			.classed('hidden', true);
  			
  		var hintDiv = div.append('div')
  			.attr('id', 'hintDiv')
  			.style('text-align', 'left')
  			.style('position', 'relative')
  			.style('top', '350px')
  			.style('left', '200px')
  			.style('width', '650px')
  			
  		hintDiv.append('p')
  			.text('Hints:')
  			.style('font-size', '24px')
  			.style('line-height', '30px');

		d3.select('.groupLegend').append('div')
			.attr('id', 'groupLegendNext')
//			.attr('class', 'hidden')
			.style('text-align', 'right')
			.style('position', 'absolute')
			.style('width', '1000px')
			.style('top', '550px')
			.append('button')
			.attr('id', 'showStartControlBtn')
			.text('Next')
			.on('click', function(d) {
				removeGroupLegend();
				showStartControl();
			});
	}

  	function appendTrialSVG(svgName) {

		svg = d3.select(".main")
			.append('svg:svg')
			.attr("width", config.canvasWidth)
			.attr("height", config.canvasHeight)
			.attr('id', svgName);
				
		svg.append('rect')
			.attr('width', config.canvasWidth)
			.attr('height', config.canvasHeight)	
			.style('fill', 'bisque');

		var svgDefs = svg.append("g");

		for (var i = 0; i < 21; ++i) {
		   svgDefs.append("defs")
			  .append("filter")
				.attr("id", "blur" + i)
			  .append("feGaussianBlur")
				.attr("stdDeviation", i);    
		}

  		targetGroup = svg.append('svg:g')
  			.attr('width', config.targetWidth)
  			.attr('height', config.targetHeight)
  			.attr('id', 'target')
  			.attr('transform', 'translate(' + (config.canvasWidth / 2 - config.targetWidth / 2 - 70) + ', ' + config.targetHeight / 2 + ')');

		legend = svg.append('g')
			.attr('width', config.legendWidth)
			.attr('height', config.legendHeight)
			.attr("transform", "translate(190, 600)");

  		var div = d3.select('.main')
			.append('div')
  			.style('text-align', 'right')
  			.style('position', 'absolute')
  			.style('width', '1000px')
  			.style('top', '650px')
  			.append('p')
  			.text('Press Enter to show trial')
  			.attr('class', 'hidden')
  			.attr('id', 'showTrialBtn');

/*  			.append('button')
  			.attr('id', 'showTrialBtn')
  			.attr('class', 'hidden')
  			.text('Show trial')
  			.on('click', function(d) {
  				showTrial();
  				hideShowTrialBtn();
  				var timeAlloc = 1 * 1000;
  				if (task === 'cp') {
  					timeAlloc = 1 * 1000;
  				}
  				setTimeout(timeUp, timeAlloc);
  			}); */
  	}

  	function appendResponseDiv() {
  		var div = d3.select('.main')
  			.append('div')
  			.attr('class', 'response')
  			.classed('hidden', true);
  		div.append('div')
  			.style('text-align', 'center')
  			.style('position', 'relative')
  			.style('top', '150px')
  			.append('p')
  			.text('Response')
  			.style('font-size', '36px');
  		div.append('div')
  			.style('text-align', 'center')
  			.style('position', 'relative')
  			.style('top', '250px')
  			.append('p')
  			.attr('id', 'userResp')
  			.style('font-size', '64px');
  		div.append('div')
  			.style('text-align', 'right')
  			.style('position', 'absolute')
  			.style('width', '1000px')
  			.style('top', '550px')
  			.append('p')
  			.text('Press Enter to continue')
  			.attr('id', 'nextBtn');
//  			.append('button')
//  			.attr('id', 'nextBtn')
//  			.text('Next')
//  			.on('click', startNewTrial);
  	}
  	
  	function appendStartControl() {
		var div = d3.select('.main')
			.append('div')
			.attr('class', 'control-start')
			.classed('hidden', true);
//			.append('button')
//			.attr('id', 'startTrial');
  		div.append('div')
  			.style('text-align', 'center')
  			.style('position', 'relative')
  			.style('top', '300px')
  			.append('p')
  			.text('Press Space to start')
  			.style('font-size', '36px');		
		
/*		$('#startTrial').text('Start');
		$('#startTrial').click(function() {
			hideStartControl();
			showTarget();
		}); */
  	}
  	
  	function appendBreakDiv() {
  		var div = d3.select('.main')
  			.append('div')
  			.attr('class', 'break')
  			.classed('hidden', true);
  		div.append('div')
  			.style('text-align', 'left')
  			.style('position', 'relative')
  			.style('top', '250px')
  			.style('left', '200px')
  			.style('width', '650px')
  			.append('p')
  			.text('Please take a 15 seconds break. The "Next" button will appear for you to continue when time is up.')
  			.style('font-size', '36px')
  			.style('line-height', '60px');
		d3.select('.break').append('div')
			.attr('id', 'breakNext')
			.attr('class', 'hidden')
			.style('text-align', 'right')
			.style('position', 'absolute')
			.style('width', '1000px')
			.style('top', '550px')
			.append('button')
			.attr('id', 'nextBtn')
			.text('Next')
			.on('click', function(d) {
				hideBreakPage();
				showGroupLegend();
//				showStartControl();
			});
  	}
  	
/* Control functions */	
  	
  	function startNewTrial() {
  		expData[subject+'-practice-'+counter+'-subject']= subject;
  		expData[subject+'-practice-'+counter+'-trial']= counter;
  		expData[subject+'-practice-'+counter+'-task']= task;
  		expData[subject+'-practice-'+counter+'-targetType']= targetType;
  		expData[subject+'-practice-'+counter+'-targetParam']= targetParam;
  		expData[subject+'-practice-'+counter+'-response']= subResp;
  		expData[subject+'-practice-'+counter+'-difficulty']= difficulty;
  		expData[subject+'-practice-'+counter+'-conId'] = conId;
  		expData[subject+'-practice-'+counter+'-condition']= condition;
  		expData[subject+'-practice-'+counter+'-blockPos']= blockId;
  		expData[subject+'-practice-'+counter+'-dataPath']= (task === 'vs') ? dataPath : dataPathA;
  		expData[subject+'-practice-'+counter+'-prepareTime']= prepareTime;	

  		experimentr.addData(expData);
  		
  		hasResp = false;

		hideResponse();
  		hideBreakPage();
  		setParameters();
  	}
  	
  	function timeUp() {
  		removeTrial();
  		removeTarget();
  		showResponse();
  	}
  	
  	function loadData(path, target) {
		d3.json(path, function(error, json) {
			if (error) return console.warn(error);
			switch (target) {
				case 'vs': 
					vsData = json;
					break;
				case 'cpa':
					cpDataA = json;
					break;
				case 'cpb':
					cpDataB = json;
					break;
			}
			
			if (taskId === 0 && difficulty === 0 && blockId === 0 && counter !== 1) {
				showBreakPage();
				setTimeout(showBreakNextBtn, 15 * 1000);
			}
			else if (taskId === 0 && difficulty === 0 && blockId === 0 && counter === 1) {
				showGroupLegend();
			}
			else {
				showStartControl();
			}
		});
  	}
  	
  	function setParameters() {
  		conId = Math.floor(counter / trialPerCon); // The position of the condition for the current trial, conId in [0,11]
  		taskId = Math.floor((counter - conId * trialPerCon) / trialPerTask);
  		difficulty = Math.floor((counter - conId * trialPerCon - taskId * trialPerTask) / trialPerDiff); // The position of the difficulty level for the current trial, diffId in [0,1]
  		blockId = counter - conId * trialPerCon - taskId * trialPerTask - difficulty * trialPerDiff;
  		
  		if (conId >= conditions.length) {
			experimentr.next();
  		}

  		condition = conditions[conId];
  		task = tasks[conId][taskId];

  		if (blockId === 0) {
  			setBlockParameters();
  		}
  		targetType = trialTargets[blockId].type;
  		targetParam = trialTargets[blockId].param;

  		counter += 1;

		console.log('condition ' + conId + ' ' + condition);
		console.log('task ' + taskId + ' ' + task);
		console.log('difficulty ' + difficulty);
		console.log('blockId ' + blockId);
		console.log(trialTargets);
		
  		if (task === 'vs') {
  			var targetId = targetType.substring(0, 1);
	  		dataPath = 'modules/data/task_vs_' + targetId + '_' + targetParam + '_' + vsCounter[targetId][targetParam] + '.json';
	  		loadData(dataPath, 'vs');
	  		vsCounter[targetId][targetParam] += 1;
	  	}
	  	else {
  			var targetId = targetType.substring(0, 1);
	  		dataPathA = 'modules/data/task_cp_' + targetId + '_' + targetParam + '_' + cpCounter[targetId][targetParam] + '_a.json';
	  		dataPathB = 'modules/data/task_cp_' + targetId + '_' + targetParam + '_' + cpCounter[targetId][targetParam] + '_b.json';
	  		loadData(dataPathA, 'cpa');
	  		loadData(dataPathB, 'cpb');
	  		cpCounter[targetId][targetParam] += 1;
	  		console.log(dataPathA);
	  		console.log(dataPathB);
	  	}
  	}
  	
  	function setBlockParameters() {
//  		trialTargets = [];
//  		for (var i = 0; i < trialPerDiff; ++i) {
//  			trialTargets.push((i % 6) + 1);
//  		}
		if (task === 'vs') {
	  		trialTargets = createShuffledArray(vsTemplate);
	  	}
	  	else {
	  		trialTargets = createShuffledArray(cpTemplate);
	  	}
  	}
  	
  	function createShuffledArray(inArray) {
  		var array = inArray.slice(0);
		var i = array.length;
		var j = null;
		var temp = null;
		if ( i == 0 ) return;
		while ( --i ) {
			j = Math.floor( Math.random() * ( i + 1 ) );
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
  	}
  	
  	function checkArrayEquality(a, b) {
  		return a.length == b.length && a.every( function(a_i, i) { 
				 	return a_i == b[i] 
				 });
  	}

/* UI elements update functions */  	

	function showNextBtn() {
  		d3.select('.response #nextBtn').classed('hidden', false);
	}
	
	function showBreakNextBtn() {
		d3.select('#breakNext').classed('hidden', false);
	}

	function showStartControl() {
		state = 'startControl';
		d3.select('.control-start').classed('hidden', false);
	}
	
	function hideStartControl() {
		d3.select('.control-start').classed('hidden', true);
	}

	function showBreakPage() {
		state = 'break';
		d3.select('.break').classed('hidden', false);
	}
	
	function hideBreakPage() {
		d3.select('.break').classed('hidden', true);
		d3.select('#breakNext').classed('hidden', true);
	}

  	function showResponse() {
  		state = 'response';
  		d3.select('body').select('.response').classed('hidden', false);
  		d3.select('#userResp').text('');
  		d3.select('.response #nextBtn').classed('hidden', true);
  	}
  	
  	function hideResponse() {
  		d3.select('body').select('.response').classed('hidden', true);
  	}
	
	function hideShowTrialBtn() {
		d3.select('#showTrialBtn').classed('hidden', true);
	}
	
	function showGroupLegend() {	
		state = 'groupLegend';

  		d3.select('.groupLegend').classed('hidden', false);
		
		groupLegend.selectAll('g.strength')
//			.data(levels)
			.data(strengthData)
			.enter()
			.append('g')
			.attr('transform', function(d, i) {
				return 'translate(' + (i * 100 + 150) +', 30)';
			})
			.attr('class', 'strength')
			.append('line')
			.attr('x1', 0)
			.attr('x2', 50)
			.attr('y1', 2)
			.attr('y2', 2);

		groupLegend.selectAll('g.certainty')
//			.data(levels)
			.data(certaintyData)
			.enter()
			.append('g')
			.attr('transform', function(d, i) {
				return 'translate(' + (i * 100 + 150) +', 60)';
			})
			.attr('class', 'certainty')
			.append('line')
			.attr('x1', 0)
			.attr('x2', 50)
			.attr('y1', 2)
			.attr('y2', 2);
				
		/* Appending titles */
		groupLegend.append('text')
			.attr('font-size', '20px')
			.attr('transform', 'translate(20, 0)')
			.text('Legend');
		groupLegend.append('text')
			.attr('font-size', '14px')
			.attr('transform', 'translate(20, 38)')
			.text('Strength');
		groupLegend.append('text')
			.attr('font-size', '14px')
			.attr('transform', 'translate(20, 68)')
			.text('Certainty');		

		/* Appending labels for legends */
		groupLegend.selectAll('g.strength')
			.append('text')
			.attr("transform", "translate(55, 7) rotate(0)")
			.text(function(d) { return d.strength; });			
		groupLegend.selectAll('g.certainty')
			.append('text')
			.attr("transform", "translate(55, 7) rotate(0)")
			.text(function(d) { return d.certainty; });
  		  		
  		var cons = condition.split('_');
  		decorators[condition](groupLegend.selectAll('g.strength > line'));
  		decorators[condition](groupLegend.selectAll('g.certainty > line'));
//  		decorators[cons[0]](legend.selectAll('g.strength > line'));
//  		decorators[cons[1]](legend.selectAll('g.certainty > line'));	

  		d3.select('#hintDiv')
  			.append('p')
  			.text(hints[cons[0]])
  			.style('font-size', '20px')
  			.style('line-height', '30px');
  
  		d3.select('#hintDiv')
  			.append('p')
  			.text(hints[cons[1]])
  			.style('font-size', '20px')
  			.style('line-height', '30px');
  	}
	
	function removeGroupLegend() {
		groupLegend.selectAll('g').remove();
		groupLegend.selectAll('line').remove();
		groupLegend.selectAll('text').remove();
  		d3.select('.groupLegend').classed('hidden', true);
	}

  	function showTrial() {
  		state = 'trial';
  		if (task === 'vs') {
	  		createGraph(250, vsData);
	  	}
	  	else {
	  		appendCPFrame();
	  		createGraph(25, cpDataA);	  	
	  		createGraph(550, cpDataB);
	  	}
  		decorators[condition](svg.selectAll('.link'));
  	}
  	
  	function removeTrial() {
  		svg.selectAll('.graph').remove();
  		svg.selectAll('.cpFrame').remove();
  	}
  	
  	function showTarget() {
  		state = 'target';
  		
  		prepareStartTime = new Date();
  	
		targetGroup.append('svg:text')
			.text(function(d) {
				var result = (task === 'vs') ? '[VS] ' : '[CP] ';
				result += 'Target: ';
				result += targetType;
				if (task === 'vs') { result += (' = ' + targetParam); }
				return result;
			})
			.attr('font-size', '36px')
			.attr('transform', 'translate(0, 18)');  			

		// Config legend svg
		/* Appending per-element containers */
		legend.selectAll('g.strength')
//			.data(levels)
			.data(strengthData)
			.enter()
			.append('g')
			.attr('transform', function(d, i) {
				return 'translate(' + (i * 100 + 150) +', 30)';
			})
			.attr('class', 'strength')
			.append('line')
			.attr('x1', 0)
			.attr('x2', 50)
			.attr('y1', 2)
			.attr('y2', 2);

		legend.selectAll('g.certainty')
//			.data(levels)
			.data(certaintyData)
			.enter()
			.append('g')
			.attr('transform', function(d, i) {
				return 'translate(' + (i * 100 + 150) +', 60)';
			})
			.attr('class', 'certainty')
			.append('line')
			.attr('x1', 0)
			.attr('x2', 50)
			.attr('y1', 2)
			.attr('y2', 2);
				
		/* Appending titles */
		legend.append('text')
			.attr('font-size', '20px')
			.attr('transform', 'translate(20, 0)')
			.text('Legend');
		legend.append('text')
			.attr('font-size', '14px')
			.attr('transform', 'translate(20, 38)')
			.text('Strength');
		legend.append('text')
			.attr('font-size', '14px')
			.attr('transform', 'translate(20, 68)')
			.text('Certainty');		

		/* Appending labels for legends */
		legend.selectAll('g.strength')
			.append('text')
			.attr("transform", "translate(55, 7) rotate(0)")
			.text(function(d) { return d.strength; });			
		legend.selectAll('g.certainty')
			.append('text')
			.attr("transform", "translate(55, 7) rotate(0)")
			.text(function(d) { return d.certainty; });
  		
  		d3.select('#showTrialBtn').classed('hidden', false);
  		
  		var cons = condition.split('_');
  		decorators[condition](legend.selectAll('g.strength > line'));
  		decorators[condition](legend.selectAll('g.certainty > line'));
//  		decorators[cons[0]](legend.selectAll('g.strength > line'));
//  		decorators[cons[1]](legend.selectAll('g.certainty > line'));
  		
  		d3.select('#showTrialBtn').classed('hidden', false);
  		
  	};

  	function removeTarget() {
  		targetGroup.selectAll('text').remove();
  		legend.selectAll('g').remove();
  		legend.selectAll('text').remove();
  		legend.selectAll('line').remove();
  		d3.select('#showTrialBtn').classed('hidden', true);
  	}  	

	/* SVG functions */

	function createGraph(x, graphData) {

		var graphVis = svg.append('svg:g')
			.attr('class', 'graph')
//  			.attr('width', config.graphWidth)
//  			.attr('height', config.graphHeight)
  			.attr('width', 500)
  			.attr('height', 400)
  			.attr('id', 'graph')
  			.attr('transform', 'translate(' + x + ', 100)');
  			
		nodes = graphData.nodes;
		links = graphData.links;
	
		var force = d3.layout.force()
			  .size([500, 400])
			  .nodes(nodes)
			  .links(links)
			  .gravity(0.8)
			  .linkDistance(50)
			  .charge(-3000)
			  .linkStrength(0.5);
			  
		var path = graphVis.append("svg:g").selectAll("path")
			  .data(force.links())
			  .enter().append("svg:path")
				.attr("marker-end", function(d) { return "Hi"; });

    	force.start();
    	for (var i = 0; i < 1000; ++i) {
    		force.tick();
    	}
    	force.stop();
    	
		link = graphVis.selectAll("line.link").data(links).enter().append("svg:line")
					.attr("class", "link")
					.attr('title', function(d) { 
						return '<p>strength:' + d.strength + '</p>'; 
					});
/*					.on('click', function(d, i) {
						if (task === 'cp') { return; }
						var selectedValue = 0;
						if (targetType === 'Strength') { selectedValue = d.strength; }
						else { selectedValue = d.certainty; } 
						var t = d3.select(this);
						if (t.classed('selected')) {
							t.classed('selected', false);
							d3.select('#node-' + d.source.id).classed('selected', false);
							d3.select('#node-' + d.target.id).classed('selected', false);
							subResp.splice($.inArray(selectedValue, subResp), 11);
						}
						else {
							t.classed('selected', true);
							d3.select('#node-' + d.source.id).classed('selected', true);
							d3.select('#node-' + d.target.id).classed('selected', true);
							subResp.push(selectedValue);
						}
					}); */
			
		node = graphVis.selectAll("g.node")
					.data(force.nodes())
					.enter()
					.append("svg:g")
					.attr("class", "node");
					
		node.append("svg:circle")
			.attr("r", 10)
			.attr('id', function(d) {
				return 'node-' + d.id;
			})
			.attr("class", "node");

    	node.call(updateNode);
    	link.call(updateLink);
	}
	
	function appendCPFrame() {
		svg.append('rect')
			.attr('class', 'cpFrame')
			.attr('width', 500)
			.attr('height', 450)	
			.style('fill', 'bisque')
			.attr('transform', 'translate(25, 100)');
/*			.on('click', function(d) {
				var t = d3.select(this);
				var isSelected = t.classed('selected');
				d3.selectAll('rect').classed('selected', false);
				isSelected ? t.classed('selected', false) : t.classed('selected', true);
				isSelected ? subResp = 0 : subResp = 1;
			}); */
		svg.append('rect')
			.attr('class', 'cpFrame')
			.attr('width', 500)
			.attr('height', 450)	
			.style('fill', 'bisque')
			.attr('transform', 'translate(525, 100)');
/*			.on('click', function(d) {
				var t = d3.select(this);
				var isSelected = t.classed('selected');
				d3.selectAll('rect').classed('selected', false);
				isSelected ? t.classed('selected', false) : t.classed('selected', true);
				isSelected ? subResp = 0 : subResp = 2;			
			}); */
	}

	function updateLink() {
		this.attr("x1", function(d) {
			return d.source.x;
		}).attr("y1", function(d) {
			return d.source.y;
		}).attr("x2", function(d) {
			return d.target.x;
		}).attr("y2", function(d) {
			return d.target.y;
		});

	}

	function updateNode() {
		this.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	}


/*	experimentr.hideNext();
  	experimentr.release();
  	var subResp = [];

	var labelDistance = 0;
	
	var svg = null;

  	function convertToPercent(value) {
  		var minMax = getAttrMinMax(graphData.links, 'str_std');
  		var percentMap = d3.scale.linear().domain([minMax.min, minMax.max]).range([0.1, 1]);
  		return percentMap(value);
  	}
  	
  	function dataReady() {
  	
		svg = d3.select(".main").select("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);
				
		svg.append('rect')
			.attr('width', width)
			.attr('height', height)	
			.style('fill', 'bisque');

		d3.select('.main')
			.append('div')
			.attr('class', 'control-start')
			.append('button')
			.attr('id', 'startTrial');

		createLegends();
		
		$('#startTrial').text('Start');
		$('#startTrial').click(function() {
			d3.selectAll('.hidden')
				.classed('hidden', false);
			d3.select('.control-start')
				.classed('hidden', true);
			mainFunc();
//			setTimeout(timeUp, 3 * 1000);
		});
  	};
  	
  	function timeUp() {
  		d3.select('.main')
  			.select('svg')
  			.classed('hidden', true);
  		d3.select('.target')
  			.classed('hidden', true);

		expData[window.trialId] = subResp;
  		experimentr.showNext();
  		experimentr.release();
  	};
		d3.json(window.dataPath, function(error, json) {
		  if (error) return console.warn(error);
		  graphData = json;
		  dataReady();
		});
	*/
	