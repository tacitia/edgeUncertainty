import json
import random
import networkx as nx
from networkx.readwrite import json_graph

num_graphs = 120
# generate a random graph
s_levels = range(1, 6)
u_levels = range(1, 6)

for i in range(num_graphs):
	G = nx.gnm_random_graph(18, 25)
	for e in G.edges():
		G[e[0]][e[1]]['strength'] = random.choice(s_levels)
		G[e[0]][e[1]]['certainty'] = random.choice(u_levels)

	# write json formatted data
	d = json_graph.node_link_data(G) # node-link format to serialize
	# write json
	output_name = 'task_vs_' + str(i) + '.json'
	output = open(output_name, 'w')
#	output.write('var data = ')
	json.dump(d, output, indent=2, separators=(', ', ':' ))
	print('Wrote node-link JSON data to ' + output_name)