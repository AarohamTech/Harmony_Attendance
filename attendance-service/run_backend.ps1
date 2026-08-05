Write-Host "Starting Attendance Service Backend on port 8002..." -ForegroundColor Green
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
}
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
