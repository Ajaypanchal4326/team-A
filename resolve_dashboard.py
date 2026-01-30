
import re

def resolve_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    output_lines = []
    in_head_block = False
    in_remote_block = False

    for line in lines:
        if line.strip().startswith('<<<<<<< HEAD'):
            in_head_block = True
            in_remote_block = False
            continue
        elif line.strip().startswith('======='):
            in_head_block = False
            in_remote_block = True
            continue
        elif line.strip().startswith('>>>>>>>'):
            in_head_block = False
            in_remote_block = False
            continue
        
        if in_head_block:
            continue # Skip HEAD content
        elif in_remote_block:
            output_lines.append(line) # Keep remote content
        else:
            output_lines.append(line) # Keep common content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    print(f"Resolved {filepath}")

resolve_file('c:/Users/LENOVO/Downloads/team-A-request (2)/team-A-request/webapp/src/components/Dashboard.jsx')
