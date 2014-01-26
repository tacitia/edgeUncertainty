import json
import copy
import random
import networkx as nx
from networkx.readwrite import json_graph

num_graphs = 144
targets = [1, 3, 5]
num_per_target = 2 * 12 * 2
# generate a random graph
levels = range(1, 6)

attrs = ['S', 'C']

answers = {}
answers['S'] = {}
answers['C'] = {}
answers['S'][1] = []
answers['S'][3] = []
answers['S'][5] = []
answers['C'][1] = []
answers['C'][3] = []
answers['C'][5] = []


tts = {}
tts[1] = [[1,6,6,6,6], [1,5,5,7,7], [1,7,7,5,5], [1,5,7,7,5], [1,5,6,6,7], [1,7,6,6,5], [1,6,5,7,6], [1,6,7,5,6], [1,4,8,8,4], [1,4,8,7,5], [1,4,6,8,6]]
tts[3] = [[6,6,1,6,6], [5,5,1,7,7], [7,7,1,5,5], [5,7,1,7,5], [5,6,1,6,7], [7,6,1,6,5], [6,5,1,7,6], [6,7,1,5,6], [4,8,1,8,4], [4,8,1,7,5], [4,6,1,8,6]]
tts[5] = [[6,6,6,6,1], [5,5,7,7,1], [7,7,5,5,1], [5,7,7,5,1], [5,6,6,7,1], [7,6,6,5,1], [6,5,7,6,1], [6,7,5,6,1], [4,8,8,4,1], [4,8,7,5,1], [4,6,8,6,1]]

presence = []
for i in range(num_per_target / 2):
	presence.append(0)
	presence.append(1)
	
# Change the distribution of values
for attr in attrs:
	for target in targets:
		# generate attribute templates
		tt = tts[target]
		templates = []
		for t in tt:
			template = []
			for i in range(len(t)):
				rep = t[i]
				for j in range(rep):
					template.append(i+1)
			templates.append(template)
		# generate presence array
		p = copy.deepcopy(presence)
		random.shuffle(p)
	
		for j in range(num_per_target):
			G = nx.gnm_random_graph(18, 25)
			while not nx.is_connected(G):
				G = nx.gnm_random_graph(18, 25)
			template = copy.deepcopy(random.choice(templates))
			answers[attr][target].append(p[j])
			if p[j] == 0: # substitue target for a random level if presence = 0
				template.remove(target)
				elem = random.choice(levels)
				while elem == target:
					elem = random.choice(levels)
				template.append(elem)
			random.shuffle(template)
			
			counter = 0
			for e in G.edges():
				G[e[0]][e[1]]['strength'] = random.choice(levels)
				G[e[0]][e[1]]['certainty'] = random.choice(levels)
				if attr == 'S':
					G[e[0]][e[1]]['strength'] = template[counter]
				else:
					G[e[0]][e[1]]['certainty'] = template[counter]					
				counter += 1				

			# write json formatted data
			d = json_graph.node_link_data(G) # node-link format to serialize
			# write json
			output_name = 'task_vs_' + attr + '_' + str(target) + '_' + str(j) + '.json'
			output = open(output_name, 'w')
		#	output.write('var data = ')
			json.dump(d, output, indent=2, separators=(', ', ':' ))
			print('Wrote node-link JSON data to ' + output_name)
			output.close()

answer_file = open('vs_answer_extra.json', 'w')
json.dump(answers, answer_file, indent=2, separators=(', ', ':'))			
answer_file.close()