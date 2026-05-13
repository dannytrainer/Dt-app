import re

file = "index.js"

with open(file, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Arreglar import de baileys roto
code = re.sub(
    r"require\('@wh[^']*",
    "require('@whiskeysockets/baileys')",
    code
)

# 2. Arreglar DisconnectReason roto
code = re.sub(
    r"DisconnectReason[^;\n]*",
    "DisconnectReason.loggedOut",
    code
)

# 3. Arreglar array DIAS cortado
code = re.sub(
    r"const DIAS\s*=\s*\[[^\]]*$",
    "const DIAS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];",
    code
)

# 4. Eliminar caracteres basura tipo >
code = code.replace(">","")

with open(file, "w", encoding="utf-8") as f:
    f.write(code)

print("✔ index.js reparado automáticamente")
