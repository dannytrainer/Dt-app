import re, subprocess
with open('/data/data/com.termux/files/home/Dt-app/public/index.html','r') as f:
    h=f.read()
bloques=re.findall(r'<script>([\s\S]*?)</script>',h)
principal=max(bloques,key=len)
with open('/data/data/com.termux/files/home/dtcheck.js','w') as f:
    f.write(principal)
r=subprocess.run(['node','--check','/data/data/com.termux/files/home/dtcheck.js'],capture_output=True,text=True)
if r.returncode==0:
    print('✅ JS OK')
else:
    print('❌ Error:')
    print(r.stderr)
