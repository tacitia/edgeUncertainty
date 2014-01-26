import json
import math
import os
import fnmatch
import matplotlib.pyplot as plt
import matplotlib.cbook as cbook
import numpy as np
from operator import itemgetter

# Step 1 read in answers
vs_answers = json.loads(open('vs_answer.json').read())
cp_answers = json.loads(open('cp_answer.json').read())

# Step 2 initialize data container
binary_acc = {}
conditions = ['width_value', 'width_blur', 'width_grain', 'width_trans', 'sat_value', 'sat_blur', 'sat_grain', 'sat_trans', 'hue_value', 'hue_blur', 'hue_grain', 'hue_trans'];		
tasks = ['vs', 'cp']
diff_levels = [0, 1]
targetTypes = ['S', 'C']
subject_count = 0

for c in conditions:
	binary_acc[c] = {}
	for k in tasks:
		binary_acc[c][k] = {}
		for t in targetTypes:
	 		binary_acc[c][k][t] = {}
			for d in diff_levels:
				binary_acc[c][k][t][d] = 0

# Step 3 read in data

dir = '../results/'
for _, _, files in os.walk(dir):
	for filename in fnmatch.filter(files, '*.json'):
		with open(dir + filename, 'r') as infile:

			data = json.loads(infile.read())
			data = sorted(data, key=itemgetter('time_start_experiment'))
			subject = filename.split('.')[0]
			print 'Parsing file ' + filename + '...'
			subject_count += 1

			for dataset in data:
				if len(dataset) < 288:
					continue
				for i in range(1, 289):
					prefix = subject + '-' + str(i) + '-'
					response = int(dataset[prefix + 'response'])
					difficulty = int(dataset[prefix + 'difficulty'])
					condition = dataset[prefix + 'condition']
					task = dataset[prefix + 'task']
					targetParam = dataset[prefix + 'targetParam']
					targetType = dataset[prefix + 'targetType'][0]
					dataPath = dataset[prefix + 'dataPath']
					name_segs = dataPath.split('_')
					if task == 'cp':
						file_counter = int(name_segs[len(name_segs)-2])
						answer = cp_answers[targetType][targetParam][file_counter]
					else:
						file_counter = int(name_segs[len(name_segs)-1].split('.')[0])
						answer = vs_answers[targetType][targetParam][file_counter]
					b_acc = 0
					if answer == response:
						b_acc = 1
					binary_acc[condition][task][targetType][difficulty] += b_acc

# Step 4 analyze data
		
for c in conditions:
	for k in tasks:
		for t in targetTypes:
			for d in diff_levels:
				binary_acc[c][k][t][d] /= (3.0 * subject_count)
#				print c + '-' + k + '-' + t + '-' + str(d) + ': ' + str(binary_acc[c][k][t][d])
		

str_color_map = {}
str_color_map['width'] = 'r'		
str_color_map['hue'] = 'b'		
str_color_map['sat'] = 'g'		

cer_color_map = {}
cer_color_map['value'] = 'c'		
cer_color_map['grain'] = 'm'		
cer_color_map['blur'] = 'y'	
cer_color_map['trans'] = 'k'	

str_conditions = ['width', 'hue', 'sat', 'all']
cer_conditions = ['value', 'grain', 'blur', 'trans', 'all']
		
# 4.1 Compute average certainty accuracy for the 4 certainty methods, w.r.t to the 3 strength conditions (plus overall)
# Two graphs, one for each difficulty level
t = 'C'
for d in [0,1]:
	for k in tasks:
		print 'Task: ' + k
		print 'Difficulty: level ' + str(d+1)
		cer_accs = {}
		cer_accs['value'] = [0,0,0,0]
		cer_accs['grain'] = [0,0,0,0]
		cer_accs['blur'] = [0,0,0,0]
		cer_accs['trans'] = [0,0,0,0]
		for c in conditions:
			str_c = c.split('_')[0]
			cer_c = c.split('_')[1]
			cer_accs[cer_c][str_conditions.index(str_c)] += binary_acc[c][k][t][d]
			cer_accs[cer_c][3] += binary_acc[c][k][t][d]

		for key in cer_accs:
#			for i in range(3):
#				cer_accs[key][i] /= 2.0
			cer_accs[key][3] /= 3.0
			plt.scatter(range(len(cer_accs[key])),cer_accs[key], c=cer_color_map[key], alpha=0.5, s=100, label=key)
	
		plt.xticks(range(len(cer_accs[key])), str_conditions, size='large')	
		plt.legend()
		plt.show()
	
# 4.2 Compute average strength accuracy for the 3 strengths methods, w.r.t to the 4 accuracy conditions (plus overall)
# Two graphs, one for each difficulty level
t = 'S'
for d in [0,1]:
	for k in tasks:
		print 'Task: ' + k
		print 'Difficulty: level ' + str(d+1)
		str_accs = {}
		str_accs['width'] = [0,0,0,0,0]
		str_accs['hue'] = [0,0,0,0,0]
		str_accs['sat'] = [0,0,0,0,0]
		for c in conditions:
			str_c = c.split('_')[0]
			cer_c = c.split('_')[1]
			str_accs[str_c][cer_conditions.index(cer_c)] += binary_acc[c][k][t][d]
			str_accs[str_c][4] += binary_acc[c][k][t][d]

		for key in str_accs:
#			for i in range(4):
#				str_accs[key][i] /= 2.0
			str_accs[key][4] /= 4.0
			plt.scatter(range(len(str_accs[key])),str_accs[key], c=str_color_map[key], alpha=0.5, s=100, label=key)
	
		plt.xticks(range(len(str_accs[key])), cer_conditions, size='large')	
		plt.legend()
		plt.show()
	
# 4.3 Compute average combined accuracy 

print str_accs

#outfile = open(data_dir + 'prettified/' + source_name,"w")
#outfile.write(json.dumps(json.loads(infile.read()), indent=2, separators=(', ', ': ')))
#outfile.close()
