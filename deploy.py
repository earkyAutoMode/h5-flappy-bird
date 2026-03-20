import paramiko
import os

hostname = '43.138.163.183'
username = 'ubuntu'
password = '2;wZqs-Wy^63Uz'
local_path = '/workspace/home/output/h5-game/index.html'
remote_dir = '/var/www/html/h5-game'
remote_path = f'{remote_dir}/index.html'

def deploy():
    try:
        # Connect to server
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, username=username, password=password)
        
        # Create remote directory
        print(f"Ensuring remote directory {remote_dir} exists...")
        ssh.exec_command(f"sudo mkdir -p {remote_dir} && sudo chown {username}:{username} {remote_dir}")
        
        # SCP file
        print(f"Uploading {local_path} to {remote_path}...")
        sftp = ssh.open_sftp()
        sftp.put(local_path, remote_path)
        sftp.close()
        
        # Try to serve on 8080 if not already served
        print("Checking if something is already on 8080...")
        stdin, stdout, stderr = ssh.exec_command("sudo lsof -i :8080")
        output = stdout.read().decode()
        if not output:
            print("Port 8080 is free. Starting a simple python server in the background...")
            # Run python server in background
            ssh.exec_command(f"cd {remote_dir} && nohup python3 -m http.server 8080 > /dev/null 2>&1 &")
            print("Python server started.")
        else:
            print(f"Port 8080 is already in use:\n{output}")
        
        # Check if the process actually started
        import time
        time.sleep(2)
        stdin, stdout, stderr = ssh.exec_command("ps aux | grep http.server")
        print(f"Running processes:\n{stdout.read().decode()}")
            
        ssh.close()
        print("Deployment completed successfully.")
    except Exception as e:
        print(f"Error during deployment: {e}")
        exit(1)

if __name__ == "__main__":
    deploy()
