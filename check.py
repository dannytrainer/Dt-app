import re, subprocess, os

errores = []

# Verificar archivos JS externos en js/
js_dir = '/data/data/com.termux/files/home/Dt-app/public/js/'
if os.path.exists(js_dir):
    for archivo in os.listdir(js_dir):
        if archivo.endswith('.js'):
            ruta = js_dir + archivo
            r = subprocess.run(['node', '--check', ruta], capture_output=True, text=True)
            if r.returncode != 0:
                errores.append(archivo + ': ' + r.stderr)
            else:
                print('✅ ' + archivo)

# Verificar bloques inline en index.html
with open('/data/data/com.termux/files/home/Dt-app/public/index.html', 'r') as f:
    h = f.read()
bloques = re.findall(r'<script>([\s\S]*?)</script>', h)
if bloques:
    principal = max(bloques, key=len)
    with open('/data/data/com.termux/files/home/dtcheck.js', 'w') as f:
        f.write(principal)
    r = subprocess.run(['node', '--check', '/data/data/com.termux/files/home/dtcheck.js'], capture_output=True, text=True)
    if r.returncode != 0:
        errores.append('index.html inline: ' + r.stderr)
    else:
        print('✅ index.html inline JS')

if errores:
    print('❌ Errores:')
    for e in errores:
        print(e)
else:
    print('✅ Todo OK')
