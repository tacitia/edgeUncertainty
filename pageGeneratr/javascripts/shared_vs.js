//	experimentr.hideNext();

    var margin = {top: 0, right: 0, bottom: 0, left: 0};
	var width = 800;
    var height = 600;
    var legendW = 250;
    var legendH = 600;

	var labelDistance = 0;

	var nodes = null;
	var links = null;

	var link = null;
	var node = null;

	var updateLink = function() {
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

	var updateNode = function() {
		this.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	}
	
  	function getAttrMinMax(arr, index) {
  		var min = Number.MAX_VALUE;
  		var max = Number.MIN_VALUE;
  	
	  	for (var i = 0; i < arr.length; ++i) {
  			var obj = arr[i];
  			if (obj[index] < min) {
  				min = obj[index];
  			}
  			if (obj[index] > max) {
  				max = obj[index];
  			}
  		}
  		var result = {min: min, max: max};
  		return result;
  	}

  	function getExamplesForAttr(arr, index, num) {
  		var minMax = getAttrMinMax(arr, index);
  		var min = minMax.min;
  		var max = minMax.max;
  		var delta = (max - min) / (num - 1);
  		var results = [];
  		for (var i = 0; i < num; ++i) {
  			results.push(min + i * delta);
  		}
  		return results;
  	}
  	
  	function checkNodeConnectivity(d) {
			for (var i = 0; i < links.length; ++i) {
				if (links[i].source === d || links[i].target === d) {
					return true;
				}
			}
			return false;
	}

  	function convertToPercent(value) {
  		var minMax = getAttrMinMax(data.links, 'str_std');
  		var percentMap = d3.scale.linear().domain([minMax.min, minMax.max]).range([0.1, 1]);
  		return percentMap(value);
  	}
  	
  	function dataReady() {
		d3.select('.main')
			.append('div')
			.attr('class', 'control-start')
			.append('button')
			.attr('id', 'startTrial');
		
		$('#startTrial').text('Start');
		$('#startTrial').click(function() {
			d3.selectAll('.hidden')
				.classed('hidden', false);
			d3.select('.control-start')
				.classed('hidden', true);
			mainFunc();
//			setTimeout(timeUp, 5 * 1000);
		});
  	};
  	
  	function startStopWatch() {
  	};
  	
  	function timeUp() {
  		d3.select('.main')
  			.select('svg')
  			.classed('hidden', true);
  		d3.select('.target')
  			.classed('hidden', true);
  		
  		experimentr.showNext();
  		experimentr.release();
  	};
  	
  	function mainFunc() {
  	
		var svg = d3.select(".main").select("svg")
			.attr("width", width + margin.left + margin.right + legendW)
			.attr("height", height + margin.top + margin.bottom);
				
		svg.append('rect')
			.attr('width', width + legendW)
			.attr('height', height)	
			.style('fill', 'bisque');

		var main = svg.append("g");

		for (var i = 0; i < 5; ++i) {
		   main.append("defs")
			  .append("filter")
				.attr("id", "blur" + i)
			  .append("feGaussianBlur")
				.attr("stdDeviation", i);    
		}

		nodes = data.nodes;
		links = data.links;
	
	
		var force = d3.layout.force()
			  .size([width, height])
			  .nodes(nodes)
			  .links(links)
			  .gravity(0.8)
			  .linkDistance(100)
			  .charge(-4000)
			  .linkStrength(0.5);
			  
		var path = main.append("svg:g").selectAll("path")
			  .data(force.links())
			  .enter().append("svg:path")
				.attr("marker-end", function(d) { return "Hi"; });

    	force.start();
    	for (var i = 0; i < 1000; ++i) {
    		force.tick();
    	}
    	force.stop();
    	
		link = main.selectAll("line.link").data(links).enter().append("svg:line")
					.attr("class", "link")
					.attr('title', function(d) { 
						return '<p>strength:' + d.strength + '</p>'; 
					})
					.on('click', function(d) {
						var t = d3.select(this);
						t.classed('selected') ? t.classed('selected', false) : t.classed('selected', true);
					});
				
		window.setLinkStyles();
	
		node = main.selectAll("g.node")
					.data(force.nodes())
					.enter()
					.append("svg:g")
					.attr("class", "node");
					
		node.filter(checkNodeConnectivity)
			.append("svg:circle")
			.attr("r", 10)
			.attr("class", "node");

    	node.call(updateNode);
    	link.call(updateLink);
    	
		/*
		$('.link').qtip({
			style: {
				classes: 'qtip-bootstrap'
			}
		}); 
		*/

		var strength = [1, 2, 3, 4, 5];
		var certainty = [1, 2, 3, 4, 5];
	
		var legend = svg.append('g')
			.attr('width', legendW)
			.attr('height', legendH)
			.attr("transform", "translate(" + (width + margin.left) + ", 100)");		
		
		// Config legend svg
		/* Appending per-element containers */
		legend.selectAll('g.strength')
			.data(strength)
			.enter()
			.append('g')
			.attr('transform', function(d, i) {
				return 'translate(20,' + (i * 30 + 80) +')';
			})
			.attr('class', 'strength');
		legend.selectAll('g.certainty')
			.data(certainty)
			.enter()
			.append('g')
			.attr('transform', function(d, i) {
				return 'translate(120,' + (i * 30 + 80) +')';
			})
			.attr('class', 'certainty');
	
		/* Appending titles */
		legend.append('text')
			.attr('font-size', '20px')
			.attr('transform', 'translate(20, 0)')
			.text('Legend');
		legend.append('text')
			.attr('font-size', '14px')
			.attr('transform', 'translate(20, 50)')
			.text('Strength');
		legend.append('text')
			.attr('font-size', '14px')
			.attr('transform', 'translate(120, 50)')
			.text('Certainty');		

		/* Appending labels for legends */
		legend.selectAll('g.strength')
			.append('text')
			.attr("transform", "translate(55, 7) rotate(0)")
			.text(function(d) { return d; });			
		legend.selectAll('g.certainty')
			.append('text')
			.attr("transform", "translate(55, 7) rotate(0)")
			.text(function(d) { return d; });
  	
  		window.appendLegends(legend, strength, certainty);

  	}

  	$(document).ready(function() {
		d3.json(window.dataPath, function(error, json) {
		  if (error) return console.warn(error);
		  data = json;
		  dataReady();
		});

	});