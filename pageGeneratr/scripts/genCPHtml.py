temp_dir = '../templates/'
output_dir = '../htmls/'
prefix = 'cp_'
template_bases = ['width_opacity_', 'width_value_', 'sat_value_']
postfix = '.html'
output_prefix = 'task-cp-'

num_condition = 3
total_file_counter = 0

def write_single_file(p1, p2, p3, target_line):
	global total_file_counter
	file_id = output_prefix + str(total_file_counter)
	output_name = output_dir + file_id + postfix
	p1.seek(0)
	p2.seek(0)
	p3.seek(0)
	with open(output_name, 'w') as output:
		output.write(p1.read())
		data_line = '		window.dataPathA = "modules/data/task_cp_' + str(total_file_counter) + '_a.json";\n'
		data_line += '        window.dataPathB = "modules/data/task_cp_' + str(total_file_counter) + '_b.json";\n'
		trial_line = '		window.trialId = "' + file_id + '";\n'
		output.write(data_line)
		output.write(trial_line)
		output.write(p2.read())
		output.write(target_line)
		output.write(p3.read())
		total_file_counter += 1
	

for tb in template_bases:
	p1 = open(temp_dir + prefix + tb + 'p1' + postfix, 'r')
	p2 = open(temp_dir + prefix + tb + 'p2' + postfix, 'r')
	p3 = open(temp_dir + prefix + tb + 'p3' + postfix, 'r')
	for i in range(num_condition):
		target_line = '      <h3>Target: Strength</h3>'
		write_single_file(p1, p2, p3, target_line)
	for i in range(num_condition):	
		target_line = '      <h3>Target: Certainty</h3>'
		write_single_file(p1, p2, p3, target_line)
	p1.close()
	p2.close()
	p3.close()