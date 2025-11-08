# Commands to Kill Sessions & Processes

## 🛑 Kill Development Server

### Windows (PowerShell)

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or kill all Node processes
taskkill /IM node.exe /F

# Kill all npm processes
taskkill /IM npm.exe /F
```

### Quick Kill (Windows)

```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Kill all Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

## 🔄 Kill All Node Processes

### Windows

```powershell
# Kill all Node processes
taskkill /IM node.exe /F

# Kill all npm processes
taskkill /IM npm.exe /F

# Kill all processes containing "node"
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### Linux/Mac

```bash
# Kill all Node processes
pkill -f node

# Kill all npm processes
pkill -f npm

# Kill specific port
lsof -ti:3000 | xargs kill -9
```

## 🚪 Kill Specific Port

### Windows

```powershell
# Find and kill process on port 3000
$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
    Write-Host "Killed process on port $port"
} else {
    Write-Host "No process found on port $port"
}
```

### Linux/Mac

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or using fuser
fuser -k 3000/tcp
```

## 🔍 Find Running Processes

### Windows

```powershell
# List all Node processes
Get-Process node -ErrorAction SilentlyContinue

# List processes using port 3000
netstat -ano | findstr :3000

# List all listening ports
netstat -ano | findstr LISTENING
```

### Linux/Mac

```bash
# List processes on port 3000
lsof -i :3000

# List all Node processes
ps aux | grep node

# List all listening ports
lsof -i -P -n | grep LISTEN
```

## 🧹 Clean Up Everything

### Windows (PowerShell Script)

```powershell
# Kill all Node, npm, and Next.js processes
Get-Process | Where-Object {
    $_.ProcessName -like "*node*" -or 
    $_.ProcessName -like "*npm*" -or
    $_.ProcessName -like "*next*"
} | Stop-Process -Force

# Kill processes on common dev ports
3000, 3001, 3002, 8080, 5000 | ForEach-Object {
    $port = $_
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.OwningProcess -Force
        Write-Host "Killed process on port $port"
    }
}
```

## 🎯 Quick Reference

### Most Common Commands

**Windows:**
```powershell
# Kill dev server (port 3000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Kill all Node processes
taskkill /IM node.exe /F
```

**Linux/Mac:**
```bash
# Kill dev server (port 3000)
lsof -ti:3000 | xargs kill -9

# Kill all Node processes
pkill -f node
```

## ⚠️ Important Notes

- `/F` flag forces termination (Windows)
- `-9` sends SIGKILL signal (Linux/Mac)
- Always save your work before killing processes
- Some processes may restart automatically

