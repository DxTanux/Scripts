num=int(input("几子连珠?"))
size=int(input("棋盘边长?"))
flag=True
Flag=False
map=[["  "] * size for i in range(size)]
history=[]
row=col=0
index=[]
line_0="--*"*(size + 1)
space=int((3*(size+1)-8)/2)*"-"
for i in range(size):
    if 0 <= i <= 9:
        index.append("0" + str(i))
    else:
        index.append(str(i))
def draw(map):
    print(f"\n{line_0}")
    for i in range(size-1,-1,-1):
        print(index[i], end="|")
        for j in map[i]:
            print(j, end="|")
        print(f"\n{line_0}")
    print("  ", end="|")
    for i in index[:-1]:
        print(i, end="|")
    print(index[-1], end="|\n")
def judge(row, col, num, target):
    cnt = [0] * 4
    for i in range(size):
        if map[row][i] == target:
            cnt[0]+=1
    for i in range(size):
        if map[i][col] == target:
            cnt[1]+=1
    if row >= col:
        st_row=row-col;st_col=0;step=size-st_row
    else:
        st_col=col-row;st_row=0;step=size-st_col
    for i in range(st_row,st_row+step):
        if map[i][st_col] == target:
            cnt[2]+=1
        st_col+=1
    if row+col < size:
        st_row=row+col;st_col=0;step=st_row+1
    else:
        st_row=size-1;st_col=row+col-size+1;step=size-st_col
    for i in range(st_row, st_row-step, -1):
        if map[i][st_col] == target:
            cnt[3]+=1
        st_col+=1
    for i in cnt:
        if i == num:
            return True
    return False
while len(history) < size ** 2:
    draw(map)
    while True:
        if flag:
            print(space+"黑方执子"+space)
        else:
            print(space+"白方落子"+space)
        col=input("输入X坐标")
        row=input("输入Y坐标")
        if row == "" or col == "":
            print(space+"输入为空"+space)
            continue
        try:
            row=int(row)
            col=int(col)
        except:
            print(space+"格式错误"+space)
            continue
        if not 0 <= row < size or not 0 <= col < size:
            print(space+"超出范围"+space)
            continue
        if map[row][col] != "  ":
            print(space+"位置非法"+space)
            continue
        break

    if flag:
        map[row][col] = "黑"
        history.append(["黑"] + [row, col])
        Flag=judge(row, col, num, "黑")
    else:
        map[row][col] = "白"
        history.append(["白"] + [row, col])
        Flag=judge(row, col, num, "白")
    if Flag:
        break
    flag=not flag
draw(map)
if Flag:
    if flag:
        print("游戏结束,黑方获胜!")
    else:
        print("游戏结束,白方获胜!")
else:
    print("游戏结束,平局!")
end=input("按任意键结束")
