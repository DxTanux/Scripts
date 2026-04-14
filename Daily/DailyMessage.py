import os
import shutil
import subprocess
import sys
import time
from datetime import datetime

def main():
    # 隐藏控制台窗口
    sys.stdout = open(os.devnull, 'w')
    sys.stderr = open(os.devnull, 'w')
    
    # 获取当前星期几 (0=星期一, 6=星期日)
    current_weekday = datetime.now().weekday()
    weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
    weekday_name = weekdays[current_weekday]
    
    # 设置路径
    source_dir = r"C:\Scripts\Daily"
    target_dir = r"D:\APP\dist\ClassWidgets-Windows-x64\plugins\cw-text-plugin"
    source_file = os.path.join(source_dir, f"{weekday_name}.txt")
    target_file = os.path.join(target_dir, "text.txt")
    
    try:
        # 复制对应的星期文件
        shutil.copy2(source_file, target_dir)
        
        # 删除旧的text.txt文件
        if os.path.exists(target_file):
            os.remove(target_file)
        
        # 重置新复制的文件为text.txt
        new_copied_file = os.path.join(target_dir, f"{weekday_name}.txt")
        if os.path.exists(new_copied_file):
            os.rename(new_copied_file, target_file)
        
        # 启动ClassWidgets.exe并最大化窗口
        classwidgets_path = r"D:\APP\dist\ClassWidgets-Windows-x64\ClassWidgets.exe"
        
        # 使用substart最大化窗口运行
        subprocess.Popen([classwidgets_path], 
                        creationflags=subprocess.CREATE_NEW_CONSOLE,
                        shell=True)
        
        # 等待3秒
        time.sleep(3)
        
    except Exception as e:
        # 错误处理
        pass

if __name__ == "__main__":
    main()
