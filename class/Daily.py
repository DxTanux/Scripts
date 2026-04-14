import os
import shutil
import time
from datetime import datetime
import sys
# 用于窗口最大化
def maximize_window():
    try:
        hwnd = win32gui.GetForegroundWindow()
        win32gui.ShowWindow(hwnd, win32gui.SW_MAXIMIZE)
    except Exception:
        pass

def main():
    
    # 设置路径
    source_dir = "C:\\Scripts\\class"
    target_dir = "D:\\APP\\dist\\ClassWidgets-Windows-x64\\config\\schedule"
    
    # 获取当前星期几（0是周一，6是周日）
    current_day = datetime.now().weekday()
    day_names = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
    current_day_name = day_names[current_day]
    
    # 确定要复制的源文件
    if current_day == 0:  # 周一
        source_file = "星期一.json"
    elif current_day == 5:  # 周六
        source_file = "星期六.json"
    elif current_day == 6:  # 周日
        source_file = "星期日.json"
    else:  # 其他天
        source_file = "高二（1）班.json"
    
    # 创建目标文件路径
    source_path = os.path.join(source_dir, source_file)
    target_path = os.path.join(target_dir, source_file)
    
    # 检查目标文件是否已存在
    if os.path.exists(target_path):
        print(f"目标文件 {source_file} 已存在于目标目录中，不执行操作。")
    else:
        print(f"目标文件 {source_file} 不存在，开始执行操作...")
        
        # 确保源文件存在
        if os.path.exists(source_path):
            # 删除目标目录中除backup.json外的所有文件
            for file in os.listdir(target_dir):
                file_path = os.path.join(target_dir, file)
                if os.path.isfile(file_path) and file != "backup.json" and file != source_file:
                    try:
                        os.remove(file_path)
                        print(f"已删除文件: {file}")
                    except Exception as e:
                        print(f"删除文件 {file} 时出错: {e}")
            
            # 执行复制操作
            try:
                shutil.copy(source_path, target_path)
                print(f"已成功将 {source_file} 复制到目标目录。")
            except Exception as e:
                print(f"复制文件时出错: {e}")
        else:
            print(f"源文件 {source_file} 不存在，无法执行复制操作。")
    
    # 等待3秒后退出
    print("操作完成，3秒后退出...")
    time.sleep(3)

if __name__ == "__main__":
    main()
