import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('147.93.155.122', username='root', password='enfonotech')
    stdin, stdout, stderr = ssh.exec_command('cd /opt/Fatheherp-website && git pull origin master && docker compose build && docker compose up -d')
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
except Exception as e:
    print(e)
finally:
    ssh.close()
