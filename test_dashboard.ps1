Write-Host "1. Submitting Public Orders (to have data)..."
try {
    # Create Order for Restaurant
    $body = @{ tableNumber = "99"; customerName = "Dash Tester"; items = @(@{name = "Steak"; quantity = 1 }) } | ConvertTo-Json -Depth 3
    $ord = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/public/demo-restaurant/orders" -ContentType "application/json" -Body $body
    Write-Host "Created Order: $($ord.id)"
   
    # Create Job for Mechanic
    $body = @{ customerName = "Dash Mechanic"; customerPhone = "999"; vehicleDetails = "Truck"; problemDescription = "Fix"; location = @{} } | ConvertTo-Json -Depth 3
    $job = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/public/demo-mechanic/jobs" -ContentType "application/json" -Body $body
    Write-Host "Created Job: $($job.id)"
}
catch { Write-Host "Setup Failed: $($_.Exception.Message)" }

Write-Host "`n2. Testing Restaurant Dashboard..."
# Login as Restaurant Owner
$login = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/auth/login" -ContentType "application/json" -Body '{"email":"rest-owner@demo.com","password":"secret123"}'
$token = $login.token
Write-Host "Logged in as Restaurant Owner"

# Get Dashboard
$dash = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard" -Headers @{Authorization = "Bearer $token" }
if ($dash.type -eq "restaurant" -and $dash.data.Count -gt 0) {
    Write-Host "SUCCESS: Fetched $($dash.count) orders"
}
else { Write-Host "FAIL: Dashboard fetch failed" }

# Complete Order
$orderId = $dash.data[0].id
$comp = Invoke-RestMethod -Method PATCH -Uri "http://localhost:3000/dashboard/orders/$orderId/complete" -Headers @{Authorization = "Bearer $token" }
Write-Host "Marked Order $orderId as $($comp.status)"

# Fetch Reports
Write-Host "`n--- Testing Report Access (REST OWNER) ---"
$reports = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/reports" -Headers @{Authorization = "Bearer $token" }
$files = $reports.reports
if ($files.Count -ge 0) {
    Write-Host "SUCCESS: Listed $($files.Count) reports"
    if ($files.Count -gt 0) {
        $filename = $files[0].filename
        Write-Host "Attempting download: $filename"
        try {
            Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/reports/$filename" -Headers @{Authorization = "Bearer $token" } -OutFile "downloaded_report.pdf"
            Write-Host "SUCCESS: Downloaded file"
        }
        catch {
            Write-Host "FAIL: Download error - $($_.Exception.Message)"
        }
    }
}
else { Write-Host "FAIL: Report listing failed format" }

Write-Host "`n3. Testing Mechanic Dashboard..."
# Login as Mechanic Owner
$login = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/auth/login" -ContentType "application/json" -Body '{"email":"mech-owner@demo.com","password":"secret123"}'
$token = $login.token
Write-Host "Logged in as Mechanic Owner"

# Get Dashboard
$dash = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard" -Headers @{Authorization = "Bearer $token" }
if ($dash.type -eq "mechanic" -and $dash.data.Count -gt 0) {
    Write-Host "SUCCESS: Fetched $($dash.count) jobs"
}
else { Write-Host "FAIL: Dashboard fetch failed" }

# Complete Job
$jobId = $dash.data[0].id
$comp = Invoke-RestMethod -Method PATCH -Uri "http://localhost:3000/dashboard/jobs/$jobId/complete" -Headers @{Authorization = "Bearer $token" }
Write-Host "Marked Job $jobId as $($comp.status)"
