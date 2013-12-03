	experimentr.hideNext();
//  	experimentr.release();

	console.log('???');

	var config = {
		canvasWidth: 1050,
		canvasHeight: 600,
		candiWidth: 700,
		candiHeight: 250,
		targetWidth: 250,
		targetHeight: 250
	};
    var levels = [1, 2, 3, 4, 5];
    var svg = null;
    var targetGroup = null;
    var candiGroup = null;
    var decorators = {};

//	var conditions = ['value', 'saturation', 'transparency', 'grain', 'hue', 'blur', 'width'];
//	var conditions = ['saturation', 'transparency', 'grain', 'hue', 'blur', 'width', 'value'];
//	var conditions = ['transparency', 'grain', 'hue', 'blur', 'width', 'value', 'saturation'];
//	var conditions = ['grain', 'hue', 'blur', 'width', 'value', 'saturation', 'transparency'];
	var conditions = ['hue'];
	
	var numDiff = 3;
	var trialPerDiff = 15;
	var trialPerCon = trialPerDiff * numDiff;

	var subject = 'S13';
	var condition = null;
	var difficulty = null;
    var userResp = null;
	var counter = 0
	var targetValue = null;
	var candidates = null;
	var conId = null;
	var blockId = null;
	
	var trialTargets = [];
	var trialCandis = [];
    
    decorators['width'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
			[5, 7, 10, 14, 19],
			[5, 7, 9, 11, 14], // [easy]
			[5, 6, 7, 9, 11] // [difficult]
//			[5, 25],
//			[5, 21],
//			[5, 17],
//			[5, 13],
//			[5, 9]
		];
		var widthMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', function(d) {
				return widthMap(d);
			})
			.style('stroke', '#0066ff');
    };

    decorators['value'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
			[0.5, 0.585, 0.68445, 0.8008065, 0.936943605], //[easy]
			[0.5, 0.57, 0.6498, 0.740772, 0.84448008], // [difficult]
			[0.5, 0.555, 0.61605, 0.6838155, 0.759035205]
//			[0.94, 0.5],
//			[0.86, 0.5],
//			[0.78, 0.5],
//			[0.7, 0.5],
//			[0.62, 0.5]
		];
		var valueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var value = valueMap(d);
				return d3.hsl(216, 1, value).toString();
			});
    };

    decorators['saturation'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
			[0.01, 0.18, 0.42, 0.68, 1], // [easy]
			[0.15, 0.3, 0.6, 0.8, 1], // [difficult]
			[0.152587890625, 0.244140625, 0.390625, 0.625, 1],
//			[0.372529029846191, 0.476837158203125, 0.6103515625, 0.78125, 1],
//			[0.533650048233159, 0.624370556432796, 0.730513551026372, 0.854700854700855, 1]
/*			[0.04, 1],
			[0.2, 1],
			[0.36, 1],
			[0.52, 1],
			[0.68, 1] */
		];
		var satMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				var sat = satMap(d);
				return d3.hsl(216, sat, 0.5).toString();
			});
    };

    decorators['transparency'] = function(selection) {
		var minMax = {min: Math.min.apply(Math, levels), max: Math.max.apply(Math, levels)};
		var diffLevels = [
//			[0.1, 0.22, 0.4, 0.65, 1], // [easy]
			[0.25, 0.35, 0.53, 0.72, 1], // [difficult]
			[0.119730367213036, 0.203541624262162, 0.346020761245675, 0.588235294117647, 1],
//			[0.076733603947177, 0.145793847499636, 0.277008310249308, 0.526315789473684, 1],
//			[0.152587890625, 0.244140625, 0.390625, 0.625, 1],
//			[0.372529029846191, 0.476837158203125, 0.6103515625, 0.78125, 1],
//			[0.533650048233159, 0.624370556432796, 0.730513551026372, 0.854700854700855, 1]
/*			[0.04, 1],
			[0.2, 1],
			[0.36, 1],
			[0.52, 1],
			[0.68, 1] */
		];
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
		var diffLevels = [
//			[21, 1],
//			[17, 1],
			[12, 0],
			[8, 0], // [easy]
			[4, 0] // [difficult]
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
//			[20,15,10,5,0],
//			[16,12,8,4,0],
//			[12,9,6,3,0],
//			[8,6,4,2,0], // [easy]
			[4,3,2,1,0] // [difficult]
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
//			[216, 196.363636363636, 178.512396694215, 162.283996994741, 147.530906358855],
//			[216, 200, 188, 178, 170], // [easy]
			[216, 210, 204, 198, 192], // [difficult]
/*			[216, 36],
			[216, 76],
			[216, 136],
			[216, 176],
			[216, 196] */
		];
		var hueMap = d3.scale.quantize().domain([minMax.min, minMax.max]).range(diffLevels[difficulty]);
		selection
			.style('stroke-width', 9)
			.style('stroke', function(d) {
				return d3.hsl(hueMap(d), 1, 0.5).toString();
			});
    };    
        
    $(document).bind('keypress', function(e) {
    	console.log(e.which);
    	if (e.which >= 49 && e.which <= 53) { 
    		userResp = parseInt(String.fromCharCode(e.which));
	    	d3.select('#userResp').text(userResp);
    		showNextBtn();
    	}
    });

  	$(document).ready(function() {
  		console.log('document ready');
  		appendTrialSVG('trial');
  		console.log('1');
		appendStartControl();  	
  		console.log('2');
		appendResponseDiv();
  		console.log('3');
		appendBreakDiv();
  		console.log('4');
		setParameters();	
  		console.log('5');
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
  			.attr('transform', 'translate(' + (config.canvasWidth / 2 - config.targetWidth / 2 ) + ', ' + config.targetHeight / 2 + ')');

  		candiGroup = svg.append('svg:g')
  			.attr('width', config.candiWidth)
  			.attr('height', config.candiHeight)
  			.attr('id', 'candidates')
  			.attr('transform', 'translate(' + (config.canvasWidth / 2 - config.candiWidth / 2 ) + ', ' + (config.candiHeight / 4 + config.targetHeight) + ')');

  	}
  	
  	function appendStartControl() {
		d3.select('.main')
			.append('div')
			.attr('class', 'control-start')
			.append('button')
			.attr('id', 'startTrial');
		
		$('#startTrial').text('Start');
		$('#startTrial').click(function() {
			hideStartControl();
			showTrial();
			setTimeout(timeUp, 2 * 1000);
		});
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
  			.append('button')
  			.attr('id', 'nextBtn')
  			.text('Next')
  			.on('click', startNewTrial);
  	}
  	
  	function appendBreakDiv() {
  		var div = d3.select('.main')
  			.append('div')
  			.attr('class', 'break')
  			.classed('hidden', true);
  		div.append('div')
  			.style('text-align', 'center')
  			.style('position', 'relative')
  			.style('top', '200px')
  			.append('p')
  			.text('Please take a 30 seconds break. The "Next" button will appear when time is up')
  			.style('font-size', '36px');
  		setTimeout(function() {
			d3.select('.break').append('div')
				.style('text-align', 'right')
				.style('position', 'absolute')
				.style('width', '1000px')
				.style('top', '550px')
				.append('button')
				.attr('id', 'nextBtn')
				.text('Next')
				.on('click', startNewTrial);
  		}, 30 * 1000);
  	}
  	
/* Control functions */	
  	
  	function startNewTrial() {
  		expData[subject+'-'+counter+'-subject']= subject;
  		expData[subject+'-'+counter+'-trial']= counter;
  		expData[subject+'-'+counter+'-answer']= targetValue;
  		expData[subject+'-'+counter+'-response']= candidates[userResp-1];
  		expData[subject+'-'+counter+'-difficulty']= difficulty;
  		expData[subject+'-'+counter+'-condition']= condition;
  		expData[subject+'-'+counter+'-blockPos']= blockId;

  		hideResponse();
  		hideBreakPage();
  		setParameters();
  		if (difficulty === 0 && blockId === 0) {
  			showBreakPage();
  		}
  		else {
	  		showStartControl();
	  	}
  		experimentr.addData(expData);
  	}
  	
  	function timeUp() {
  		removeTrial();
  		showResponse();
  	}
  	
  	function setParameters() {
  		conId = Math.floor(counter / trialPerCon); // The position of the condition for the current trial, conId in [0,7]
  		difficulty = Math.floor((counter - conId * trialPerCon) / trialPerDiff); // The position of the difficulty level for the current trial, diffId in [0,3]
  		blockId = counter - conId * trialPerCon - difficulty * trialPerDiff;
  		if (blockId === 0) {
  			setBlockParameters();
  		}
  		condition = conditions[conId];
  		targetValue = trialTargets[blockId];
  		candidates = trialCandis[blockId];
  		counter += 1;
  	}
  	
  	function setBlockParameters() {
  		trialTargets = [];
  		for (var i = 0; i < trialPerDiff; ++i) {
  			console.log(i);
  			trialTargets.push(Math.floor(i / 3) + 1);
  			candi = createShuffledArray(levels);
  			for (var j = 0; j < trialCandis.length; ++j) {
  				if (checkArrayEquality(candi, trialCandis[j])) {
  					candi = createShuffledArray(levels);
  					j = 0;
  				}
  			}
  			trialCandis.push(candi);
  		}
  		trialTargets = createShuffledArray(trialTargets);
  		console.log('setblock');
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
	}

  	function showTrial() {
  		
  		targetGroup.append('svg:text')
  			.text('Target')
  			.attr('font-size', '36px')
  			.attr('transform', 'translate(0, 18)');
  			
  		targetGroup.selectAll('line')
  			.data([targetValue])
  			.enter()
  			.append('svg:line')
  			.attr('x2', 80)
  			.attr('transform', 'translate(150, 0)')
  			.attr('class', 'stimulus');
  			  			
  		var candidate = candiGroup.selectAll('g')
  			.data(candidates)
  			.enter()
  			.append('g')
  			.attr('transform', function(d, i) {
  				return 'translate(' + (i * 150) + ', ' + config.candiHeight / 6 + ')'
  			});
  			
  		candidate.append('svg:line')
	  		.attr('x2', 80)
  			.attr('class', 'stimulus');
  			
  		candidate.append('svg:text')
  			.text(function(d, i) {
  				return i+1;
  			})
  			.attr('font-size', '24px')
  			.attr('transform', 'translate(36, 45)');
  			
  		decorators[condition](svg.selectAll('.stimulus'));
  	}
  	
  	function removeTrial() {
  		targetGroup.selectAll('text').remove();
  		targetGroup.selectAll('line').remove();	
  	  	candiGroup.selectAll('g').remove();	
  	}
  	
  	function showResponse() {
  		d3.select('body').select('.response').classed('hidden', false);
  		d3.select('#userResp').text('');
  		d3.select('.response #nextBtn').classed('hidden', true);
  	}
  	
  	function hideResponse() {
  		d3.select('body').select('.response').classed('hidden', true);
  	}