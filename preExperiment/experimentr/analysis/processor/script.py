import json
import math
from operator import itemgetter

# Step 1: produce prettified json files
data_dir = '../results/'
source_name = 'S13_1.json'
infile = open(data_dir + source_name, 'r')

data = json.loads(infile.read())

data = sorted(data, key=itemgetter('time_start_experiment'))

#outfile = open(data_dir + 'prettified/' + source_name,"w")
#outfile.write(json.dumps(json.loads(infile.read()), indent=2, separators=(', ', ': ')))

infile.close()
#outfile.close()

# Step 2: compute average accuracy for each difficulty level in each condition

subject = 'S13'
binary_acc = {}
error = {}
conditions =['value', 'saturation', 'transparency', 'grain', 'hue', 'blur', 'width']
diff_levels = [0, 1, 2]

for c in conditions:
	binary_acc[c] = {}
	error[c] = {}
	for d in diff_levels:
		binary_acc[c][d] = 0
		error[c][d] = 0

for dataset in data:
	for i in range(1, 45):
		prefix = subject + '-' + str(i) + '-'
		answer = int(dataset[prefix + 'answer'])
		response = int(dataset[prefix + 'response'])
		difficulty = int(dataset[prefix + 'difficulty'])
		condition = dataset[prefix + 'condition']
		b_acc = 0
		if answer == response:
			b_acc = 1
		e = math.fabs(answer - response) 
		binary_acc[condition][difficulty] += b_acc
		error[condition][difficulty] += e
		
for c in conditions:
	for d in diff_levels:
		binary_acc[c][d] /= 15.0
		error[c][d] /= 15.0
		print c + '-' + str(d) + ': ' + str(binary_acc[c][d])
#		print error[c][d]
		

