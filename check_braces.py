
import re

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    
    # Simple regex to strip strings and comments would be better, but let's try strict first.
    # Actually, naive counting fails with strings containing braces.
    # Let's try to track simple nesting.
    
    for i, line in enumerate(lines):
        line_num = i + 1
        for char in line:
            if char == '{':
                stack.append(('{', line_num))
            elif char == '}':
                if not stack:
                    print(f"Error: Unexpected }} at line {line_num}")
                    return
                last, last_line = stack.pop()
                if last != '{':
                     print(f"Error: Mismatched }} at line {line_num}, expected closing for {last} from line {last_line}")
                     return
            elif char == '(':
                stack.append(('(', line_num))
            elif char == ')':
                if not stack:
                    print(f"Error: Unexpected ) at line {line_num}")
                    return
                last, last_line = stack.pop()
                if last != '(':
                     print(f"Error: Mismatched ) at line {line_num}, expected closing for {last} from line {last_line}")
                     return

    if stack:
        print("Error: Unclosed brackets:")
        for item in stack[-5:]: # Show last 5
            print(f"  {item[0]} at line {item[1]}")
    else:
        print("Braces appear balanced (naive check).")

check_balance(r"C:\Users\Yılma\VSCodeProjects\qr-main\qr-frontend\qr-frontend\src\pages\CreateQR.tsx")
