Write-Host "1. Testing Restaurant Order (demo-restaurant via key)..."
try {
    $body = @{
        tableNumber  = "5"
        customerName = "Key Customer"
        items        = @( @{ name = "Pizza"; quantity = 1 } )
    } | ConvertTo-Json -Depth 3

    # URL uses demo-restaurant as key now
    $res = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/public/demo-restaurant/orders" -ContentType "application/json" -Body $body
    Write-Host "SUCCESS: Order ID $($res.id) created"
}
catch {
    Write-Host "FAIL: $($_.Exception.Message)"
    Write-Host $_.ErrorDetails.Message
}

Write-Host "`n2. Testing Mechanic Job (demo-mechanic via key)..."
try {
    $body = @{
        customerName       = "Key Client"
        customerPhone      = "555-KEY"
        vehicleDetails     = "Tesla"
        problemDescription = "Silent"
        location           = @{ lat = 10.0; lng = 20.0 }
    } | ConvertTo-Json -Depth 3

    $res = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/public/demo-mechanic/jobs" -ContentType "application/json" -Body $body
    Write-Host "SUCCESS: Job ID $($res.id) created"
}
catch {
    Write-Host "FAIL: $($_.Exception.Message)" 
    Write-Host $_.ErrorDetails.Message
}
