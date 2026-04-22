import os
import re

path = r"E:\###\一堆作业"
pattern = re.compile(r"^\d{4}-\d{2}-\d{2}(?:.*)?\.pptx$", re.IGNORECASE)

for filename in os.listdir(path):
    if pattern.match(filename):
        os.startfile(os.path.join(path, filename))
        break