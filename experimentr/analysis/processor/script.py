import json
import math
from operator import itemgetter

# Step 1: produce prettified json files
data_dir = '../results/'
source_name = 'P2.json'
infile = open(data_dir + source_name, 'r')

data = json.loads(infile.read())

data = sorted(data, key=itemgetter('time_start_experiment'))

#outfile = open(data_dir + 'prettified/' + source_name,"w")
#outfile.write(json.dumps(json.loads(infile.read()), indent=2, separators=(', ', ': ')))

infile.close()
#outfile.close()

# Step 2 read in answers
vs_answers = json.loads(open('vs_answer.json').read())
cp_answers = json.loads(open('cp_answer.json').read())

# Step 3: compute average accuracy for each difficulty level in each condition

subject = 'P2'
binary_acc = {}
conditions =['sat_value', 'sat_blur']
tasks = ['vs', 'cp']
diff_levels = [0, 1]
targetTypes = ['S', 'C']

for c in conditions:
	binary_acc[c] = {}
	for k in tasks:
		binary_acc[c][k] = {}
		for t in targetTypes:
	 		binary_acc[c][k][t] = {}
			for d in diff_levels:
				binary_acc[c][k][t][d] = 0

for dataset in data:
	for i in range(1, 25):
		prefix = subject + '-' + str(i) + '-'
#		answer = int(dataset[prefix + 'answer'])
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
			print 'newline'		
			print answer
			print response
		else:
			file_counter = int(name_segs[len(name_segs)-1].split('.')[0])
			answer = vs_answers[targetType][targetParam][file_counter]
#		print task + ' ' + str(difficulty)
#		print answer
#		print response
		b_acc = 0
		if answer == response:
			b_acc = 1
		binary_acc[condition][task][targetType][difficulty] += b_acc
		
for c in conditions:
	for k in tasks:
		for t in targetTypes:
			for d in diff_levels:
				binary_acc[c][k][t][d] /= 3.0
				print c + '-' + k + '-' + t + '-' + str(d) + ': ' + str(binary_acc[c][k][t][d])
		

