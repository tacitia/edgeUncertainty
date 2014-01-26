import json
import math
import csv
import os
import fnmatch
from operator import itemgetter

vs_answers = json.loads(open('vs_answer.json').read())
cp_answers = json.loads(open('cp_answer.json').read())

results = {}
results['S'] = {}
results['S']['0'] = []
results['S']['1'] = []
results['C'] = {}
results['C']['0'] = []
results['C']['1'] = []

for key1 in results:
	for key2 in results[key1]:
		results[key1][key2].append(['subject', 'strEnc', 'cerEnc', 'task', 'targetParam', 'accuracy'])

dir = '../results/'
for _, _, files in os.walk(dir):
	for filename in fnmatch.filter(files, '*.json'):
		with open(dir + filename, 'r') as infile:

			data = json.loads(infile.read())
			data = sorted(data, key=itemgetter('time_start_experiment'))
			subject = filename.split('.')[0]
			print 'Parsing file ' + filename + '...'

			for dataset in data:
				if len(dataset) < 288:
					continue
				for i in range(1, 289):
					prefix = subject + '-' + str(i) + '-'
					response = int(dataset[prefix + 'response'])
					difficulty = int(dataset[prefix + 'difficulty'])
					conditions = dataset[prefix + 'condition'].split('_')
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
					print results[targetType]
					print results[targetType][difficulty]
					results[targetType][difficulty].append([subject, conditions[0], conditions[1], task, targetParam, b_acc])	

with open('str_d0_results.csv', 'w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	for a in results['S']['0']:
		writer.writerow(a)
		
with open('str_d1_results.csv', 'w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	for a in results['S']['1']:
		writer.writerow(a)

with open('cer_d0_results.csv', 'w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	for a in results['C']['0']:
		writer.writerow(a)

with open('cer_d1_results.csv', 'w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	for a in results['C']['1']:
		writer.writerow(a)	
		

