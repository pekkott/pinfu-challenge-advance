import sys
import glob
import re
import os

def extract_js_files(file):
    extracted_files = []
    f = open(file, 'r')
    content = f.read()
    for m in re.findall(r'[^/]+\.js', content):
        extracted_files.append(m)
    f.close()

    return extracted_files

def combine_js_files(js_dir, file):
    extracted_files = extract_js_files(file)
    size = len(extracted_files)
    if size > 1:
        content = ''
        for file in extracted_files:
            f = open(js_dir + file, 'r')
            content += f.read()
            f.close()
        fw = open(js_dir + extracted_files[size - 1], 'w')
        fw.write(content)
        fw.close();

    if size > 0:
        extracted_files.pop(size - 1)

    return extracted_files

dist_dir = sys.argv[1]
asset_dir = dist_dir + '/mahjong-ui/'
html_dir = asset_dir + 'html/'
js_dir = asset_dir + 'js/'

for file in glob.glob(html_dir + '*'):
    extracted_files = combine_js_files(js_dir, file)
    print(extracted_files)
    for extracted_file in extracted_files:
        with open(file, "r") as f:
            lines = f.readlines()
        with open(file, "w") as f:
            for line in lines:
                f.write(re.sub(r"<script.+%s.+?</script>" % extracted_file, '', line))
