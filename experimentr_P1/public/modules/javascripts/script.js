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
    
    var levels = [1, 2, 3, 4, 5];
    
    var svg = null;
    var targetGroup = null;
    var legend = null;
	var nodes = null;
	var links = null;
	var link = null;
	var node = null;

    var decorators = {};

	var conditions = ['width_value', 'width_blur', 'width_grain', 'width_trans', 
						'sat_value', 'sat_blur', 'sat_grain', 'sat_trans',
						'hue_value', 'hue_blur', 'hue_grain', 'hue_trans'];

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
	var numDiff = 2;
	var trialPerDiff = 6;
	var trialPerTask = numDiff * trialPerDiff;
	var trialPerCon = trialPerTask * numTask;

	var subject = 'test';
	var condition = null;
	var difficulty = null;
	var task = null;
    var subResp = null;
    var vsCounter = 0;
    var cpCounter = {
    	'LM': 0,
    	'MH': 0,
    	'LH': 0
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
	
	for (var i = 0; i < 5; ++i) {
		strengthData.push({strength: i+1, certainty: 5});
		certaintyData.push({certainty: i+1, strength: 5});
	}

    decorators['width_value'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevelsA = [
			[5, 13],
			[5, 9]
		];
		var diffLevelsB = [
			[0.94, 0.5],
			[0.86, 0.5]
		];
		var widthMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var valueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
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
		var diffLevelsA = [
			[5, 13],
			[5, 9]
		];
		var diffLevelsB = [
			[8,6,4,2,0],
			[4,3,2,1,0]
		];
		var widthMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
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
		var diffLevelsA = [
			[5, 13],
			[5, 9]
		];
		var diffLevelsB = [
			[8, 0],
			[4, 0]
		];
		var widthMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
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
		var diffLevelsA = [
			[5, 13],
			[5, 9]
		];
		var diffLevelsB = [
			[0.04, 1],
			[0.2, 1],
		];
		var widthMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var opacityMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
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
		var diffLevelsA = [
			[0.04, 1],
			[0.2, 1]
		];
		var diffLevelsB = [
			[0.94, 0.5],
			[0.86, 0.5]
		];
		var satMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var valueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
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
		var diffLevelsA = [
			[0.04, 1],
			[0.2, 1]
		];
		var diffLevelsB = [
			[8,6,4,2,0],
			[4,3,2,1,0]
		];
		var satMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
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
		var diffLevelsA = [
			[0.04, 1],
			[0.2, 1]
		];
		var diffLevelsB = [
			[8, 0],
			[4, 0]
		];
		var satMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
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
		var diffLevelsA = [
			[216, 136],
			[216, 176]
		];
		var diffLevelsB = [
			[0.94, 0.5],
			[0.86, 0.5]
		];
		var hueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var valueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
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
		var diffLevelsA = [
			[216, 136],
			[216, 176]
		];
		var diffLevelsB = [
			[8,6,4,2,0],
			[4,3,2,1,0]
		];
		var hueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
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
		var diffLevelsA = [
			[216, 136],
			[216, 176]
		];
		var diffLevelsB = [
			[8, 0],
			[4, 0]
		];
		var hueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
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
		var diffLevelsA = [
			[216, 136],
			[216, 176]
		];
		var diffLevelsB = [
			[0.04, 1],
			[0.2, 1],
		];
		var hueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsA[difficulty]);
		var opacityMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevelsB[difficulty]);
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
		var diffLevels = [
			[5, 13],
			[5, 9]
		];
		var widthMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', function(d) {
				return widthMap(d);
			})
			.style('stroke', '#0066ff');
    };

    decorators['value'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
			[0.94, 0.5],
			[0.86, 0.5],
		];
		var valueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var value = valueMap(d);
				return d3.hsl(216, 1, value).toString();
			});
    };

    decorators['sat'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
			[0.04, 1],
			[0.2, 1],
		];
		var satMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var sat = satMap(d);
				return d3.hsl(216, sat, 0.5).toString();
			});
    };

    decorators['trans'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
			[0.04, 1],
			[0.2, 1],
		];
		var opacityMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', '#0066ff')
			.style('stroke-opacity', function(d) {
				return opacityMap(d);
			});
    };

    decorators['grain'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
			[8, 0],
			[4, 0]
		];
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
		var diffLevels = [
			[8,6,4,2,0],
			[4,3,2,1,0]
		];
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
		var diffLevels = [
			[216, 76],
			[216, 136],
		];
		var hueMap = d3.scale.linear().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				return d3.hsl(hueMap(d), 1, 0.5).toString();
			});
    };    


  	$(document).ready(function() {
  		appendTrialSVG('trial');
		setParameters();
		appendStartControl();  	
		appendBreakDiv();
	});
    

/* UI modules creation functions */    

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
  			.append('button')
  			.attr('id', 'showTrialBtn')
  			.attr('class', 'hidden')
  			.text('Show trial')
  			.on('click', function(d) {
  				showTrial();
  				hideShowTrialBtn();
  				var timeAlloc = 15 * 1000;
  				if (task === 'cp') {
  					timeAlloc = 5 * 1000;
  				}
  				setTimeout(startNewTrial, timeAlloc);
  			});
  	}
  	
  	function appendStartControl() {
		d3.select('.main')
			.append('div')
			.attr('class', 'control-start')
			.classed('hidden', true)
			.append('button')
			.attr('id', 'startTrial');
		
		$('#startTrial').text('Start');
		$('#startTrial').click(function() {
			hideStartControl();
			showTarget();
		});
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
  			.text('Please take a 30 seconds break. The "Next" button will appear for you to continue when time is up.')
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
				showStartControl();
			});
  	}
  	
/* Control functions */	
  	
  	function startNewTrial() {
  		expData[subject+'-'+counter+'-subject']= subject;
  		expData[subject+'-'+counter+'-trial']= counter;
  		expData[subject+'-'+counter+'-task']= task;
  		expData[subject+'-'+counter+'-targetType']= targetType;
  		expData[subject+'-'+counter+'-targetParam']= targetParam;
  		expData[subject+'-'+counter+'-response']= subResp;
  		expData[subject+'-'+counter+'-difficulty']= difficulty;
  		expData[subject+'-'+counter+'-condition']= condition;
  		expData[subject+'-'+counter+'-blockPos']= blockId;
  		expData[subject+'-'+counter+'-dataPath']= (task === 'vs') ? dataPath : dataPathA;

  		experimentr.addData(expData);

  		removeTrial();
  		removeTarget();
  		hideBreakPage();
  		setParameters();
  	}
  	
  	function timeUp() {
  		removeTrial();
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
				setTimeout(showBreakNextBtn, 30 * 1000);
			}
			else {
				showStartControl();
			}
		});
  	}
  	
  	function setParameters() {
  		conId = Math.floor(counter / trialPerCon); // The position of the condition for the current trial, conId in [0,7]
  		taskId = Math.floor((counter - conId * trialPerCon) / trialPerTask);
  		difficulty = Math.floor((counter - conId * trialPerCon - taskId * trialPerTask) / trialPerDiff); // The position of the difficulty level for the current trial, diffId in [0,1]
  		blockId = counter - conId * trialPerCon - taskId * trialPerTask - difficulty * trialPerDiff;
  		
  		if (conId >= conditions.length) {
			experimentr.next();
  		}

  		condition = conditions[conId];
  		task = tasks[conId][taskId];
  		subResp = [];

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
	  		dataPath = 'modules/data/task_vs_' + vsCounter + '.json';
	  		loadData(dataPath, 'vs');
	  		vsCounter += 1;
	  	}
	  	else {
	  		dataPathA = 'modules/data/task_cp_' + targetType.substring(0, 1) + '_' + targetParam + '_' + cpCounter[targetParam] + '_a.json';
	  		dataPathB = 'modules/data/task_cp_' + targetType.substring(0, 1) + '_' + targetParam + '_' + cpCounter[targetParam] + '_b.json';
	  		loadData(dataPathA, 'cpa');
	  		loadData(dataPathB, 'cpb');
	  		cpCounter[targetParam] += 1;
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
		d3.select('.control-start').classed('hidden', false);
	}
	
	function hideStartControl() {
		d3.select('.control-start').classed('hidden', true);
	}

	function showBreakPage() {
		d3.select('.break').classed('hidden', false);
	}
	
	function hideBreakPage() {
		d3.select('.break').classed('hidden', true);
		d3.select('#breakNext').classed('hidden', true);
	}
	
	function hideShowTrialBtn() {
		d3.select('#showTrialBtn').classed('hidden', true);
	}

  	function showTrial() {
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
					})
					.on('click', function(d, i) {
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
					});
			
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
			.attr('transform', 'translate(25, 100)')
			.on('click', function(d) {
				var t = d3.select(this);
				var isSelected = t.classed('selected');
				d3.selectAll('rect').classed('selected', false);
				isSelected ? t.classed('selected', false) : t.classed('selected', true);
				isSelected ? subResp = 0 : subResp = 1;
			});
		svg.append('rect')
			.attr('class', 'cpFrame')
			.attr('width', 500)
			.attr('height', 450)	
			.style('fill', 'bisque')
			.attr('transform', 'translate(525, 100)')
			.on('click', function(d) {
				var t = d3.select(this);
				var isSelected = t.classed('selected');
				d3.selectAll('rect').classed('selected', false);
				isSelected ? t.classed('selected', false) : t.classed('selected', true);
				isSelected ? subResp = 0 : subResp = 2;			
			});
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
	