import re

file = "index.js"

with open(file, "r", encoding="utf-8") as f:
    code = f.read()

# 🔧 arreglar join roto o incompleto
code = re.sub(r"lineas\.join\([^\)]*$", "lineas.join('\\n');", code)

# 🔧 arreglar casos con doble paréntesis
code = code.replace("lineas.join('\\n'))", "lineas.join('\\n')")

# 🔧 arreglar saltos de línea rotos en strings
code = code.replace("lineas.join('\n", "lineas.join('\\n')")

with open(file, "w", encoding="utf-8") as f:
    f.write(code)

print("✔ index.js reparado")
