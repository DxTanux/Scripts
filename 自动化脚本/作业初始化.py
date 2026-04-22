import os
import shutil
import re
from datetime import datetime, timedelta

def main():
    # 1. 获取当前日期，格式化为“年-月-日”和“年-月”
    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")
    month_str = today.strftime("%Y-%m")
    
    # 路径设置
    path_a = r"E:\###\一堆作业"          # 作业存放目录
    path_b = r"E:\###\一堆作业"  # 桌面目录
    template_file = os.path.join(path_a, "作业.pptx")
    
    # 2. 检查路径 a 下是否存在以本月命名的文件夹，不存在则创建
    month_folder = os.path.join(path_a, month_str)
    if not os.path.exists(month_folder):
        os.makedirs(month_folder)
        print(f"已创建文件夹: {month_folder}")
    else:
        print(f"文件夹已存在: {month_folder}")
    
    # 3. 移动昨天或更早的 .pptx 文件到月份文件夹
    # 获取昨天的日期字符串
    yesterday = today - timedelta(days=1)
    yesterday_str = yesterday.strftime("%Y-%m-%d")
    
    # 正则匹配文件名格式：YYYY-MM-DD.pptx 或 YYYY-MM-DD（任意后缀）.pptx
    pattern = re.compile(r"^(\d{4}-\d{2}-\d{2})(?:.*)?\.pptx$", re.IGNORECASE)
    
    for filename in os.listdir(path_b):
        file_path = os.path.join(path_b, filename)
        if not os.path.isfile(file_path):
            continue
        
        match = pattern.match(filename)
        if match:
            file_date_str = match.group(1)
            # 只处理日期 ≤ 昨天的文件
            if file_date_str <= yesterday_str:
                dest_path = os.path.join(month_folder, filename)
                shutil.move(file_path, dest_path)
                print(f"已移动: {filename} -> {month_folder}")
    
    # 4. 检查路径 b 下是否存在以今日日期命名的 .pptx 文件
    today_pptx_exists = False
    for filename in os.listdir(path_b):
        if filename.startswith(today_str) and filename.lower().endswith(".pptx"):
            today_pptx_exists = True
            break
    
    if not today_pptx_exists:
        # 不存在则复制模板文件并重命名
        if os.path.exists(template_file):
            new_file = os.path.join(path_b, f"{today_str}.pptx")
            shutil.copy2(template_file, new_file)
            print(f"已创建今日作业文件: {new_file}")
        else:
            print(f"警告: 模板文件不存在 - {template_file}")
    else:
        print(f"今日作业文件已存在，无需创建。")

if __name__ == "__main__":
    main()