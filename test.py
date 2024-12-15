import tkinter as tk
import random

def insertion_sort(list):
    swaps = []
    # swaps = 0
    for i in range(len(list)):
        count = 1
        swaps.append(0)
        while (count <= i):
            if (list[i-count+1] < list[i-count]):
                swaps[i] += 1
                # swaps += 1
                list[i-count+1], list[i-count] = list[i-count], list[i-count+1]
                count += 1
            else:
                break
    return swaps

def randomise(list):
    # n = 0
    # list.sort()
    # newList = []
    # newList.append(list[-1])
    # for i in range(len(list)):
    #     ran = random.randint(0, 2)
    #     if ran == 0:
    #         if n == 0:
    #             ran = 1
    #         else:
    #             n -= 1
    #     if (ran >= len(newList)):
    #         newList.insert(1, list[i])
    #     elif (ran == 0):
    #         newList.append(list[i])
    #     else:
    #         newList.insert(len(newList) - ran, list[i])
    # return newList

    n = 0
    list.sort()
    newList = []
    newList.append(list[-1])
    for i in range(len(list)):
        if n < -1:
            ran = 0
        elif n > 1:
            ran = random.randint(1, 3)
        else:
            ran = random.randint(0, 3)
        
        if ran == 0:
            n += 1
        else:
            n -= 1

        if (ran >= len(newList)):
            newList.insert(1, list[i])
        elif (ran == 0):
            newList.append(list[i])
        else:
            newList.insert(len(newList) - ran, list[i])
    return newList

nums = {}
for i in range(1000000):
    l = [i for i in range(8)]
    random.shuffle(l)
    newL = randomise(l)
    # val = insertion_sort(l)
    val = insertion_sort(newL)
    for j in range(len(val)):
        nums[j] = nums.get(j, 0) + val[j]
    # nums[val] = nums.get(val, 0) + 1


nums = dict(sorted(nums.items()))

root = tk.Tk()

c_width = 900
c_height = 800
c = tk.Canvas(root, width=c_width, height=c_height, bg='white')
c.pack()

y_stretch = 15 
y_gap = 20
x_stretch = 10 
x_width = 20
x_gap = 20

# A quick for loop to calculate the rectangle
for x, y in nums.items():

    # coordinates of each bar

    # Bottom left coordinate
    x0 = x * x_stretch + x * x_width + x_gap

    # Top left coordinates
    y0 = (c_height - 50) * (1 - y/max(nums.values())) + y_gap

    # Bottom right coordinates
    x1 = x * x_stretch + x * x_width + x_width + x_gap

    # Top right coordinates
    y1 = c_height - y_gap

    # Draw the bar
    c.create_rectangle(x0, y0, x1, y1, fill="red")

    # Put the y value above the bar
    c.create_text(x0 + 2, y0, anchor=tk.SW, text=str(y))
    c.create_text(x0 + 2, c_height, anchor=tk.SW, text=str(x))


total = 0
for x, y in nums.items():
    total += 1 * y

total = total/(1000000)
print(total)

root.mainloop()

