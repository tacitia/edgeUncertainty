import json
import copy
import random
import networkx as nx
from networkx.readwrite import json_graph

file_counter = 0
group_counter = 0
config = ''
attribute = ''

answers = {}
answers['S'] = {}
answers['C'] = {}
answers['S']['LM'] = []
answers['S']['MH'] = []
answers['S']['LH'] = []
answers['C']['LM'] = []
answers['C']['MH'] = []
answers['C']['LH'] = []

def gen_graph_pair(attr, dist_keys):
	global file_counter

	gen_single_graph('a', attr, dist_keys[0])
	gen_single_graph('b', attr, dist_keys[1])
	file_counter += 1
		
def gen_single_graph(pos, attr, dist_key):
	global group_counter
	global config
	global attribute

	s_levels = range(1, 6)
	u_levels = range(1, 6)

	G = nx.gnm_random_graph(18, 25)
	while not nx.is_connected(G):
		G = nx.gnm_random_graph(18, 25)
	for e in G.edges():
		G[e[0]][e[1]]['strength'] = random.choice(s_levels)
		G[e[0]][e[1]]['certainty'] = random.choice(u_levels)
	
	counter = 0
	attr_values = list(dist_template[dist_key])
	random.shuffle(attr_values)
	for e in G.edges():
		G[e[0]][e[1]][attr] = attr_values[counter]
		counter += 1

	# write json formatted data
	d = json_graph.node_link_data(G) # node-link format to serialize
	# write json
	output_name = 'task_cp_' + attribute + '_' + config + '_' + str(group_counter) + '_' + pos + '.json'
	output = open(output_name, 'w')
	json.dump(d, output, indent=2, separators=(', ', ':' ))
	print('Wrote node-link JSON data to ' + output_name)

num_combos = 12
num_edge = 25
dist_dict = {}
dist_dict['H'] = [2, 3, 5, 8, 7]
dist_dict['M'] = [3, 6, 7, 6, 3]
dist_dict['L'] = [7, 8, 5, 3, 2]
dist_template = {}
conditions = [['L', 'M'], ['L', 'H'], ['M', 'H']]


for key, dist in dist_dict.iteritems():
	template = []
	value = 1
	for i in dist:
		for j in range(i):
			template.append(value)
		value += 1
	dist_template[key] = template
	

for i in range(num_combos * 2):
	s = copy.deepcopy(conditions)
	u = copy.deepcopy(conditions)
	for c in s:
		attribute = 'S'
		config = c[0] + c[1]
		orig_c = copy.deepcopy(c)
		random.shuffle(c)
		if c == orig_c:
			answers[attribute][config].append(0)
		else:
			answers[attribute][config].append(1)
		gen_graph_pair('strength', c)
	for c in u:
		attribute = 'C'
		config = c[0] + c[1]
		orig_c = copy.deepcopy(c)
		random.shuffle(c)
		if c == orig_c:
			answers[attribute][config].append(0)
		else:
			answers[attribute][config].append(1)
		gen_graph_pair('certainty', c)
	group_counter += 1
	
answer_file = open('cp_answer.json', 'w')
json.dump(answers, answer_file, indent=2, separators=(', ', ':'))			
answer_file.close()