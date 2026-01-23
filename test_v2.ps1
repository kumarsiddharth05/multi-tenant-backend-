Write-Host "1. Testing Restaurant Order (demo-restaurant)..."
try {
    $body = @{
        tableNumber  = "5"
        customerName = "Hungry Customer"
        items        = @( @{ name = "Pizza"; quantity = 1 } )
    } | ConvertTo-Json -Depth 3

    $res = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/public/demo-restaurant/orders" -ContentType "application/json" -Body $body
    Write-Host "SUCCESS: Order ID $($res.id) created for $($res.customer_name)"
}
catch {
    Write-Host "FAIL: $($_.Exception.Message)"
    Write-Host $_.ErrorDetails.Message
}

Write-Host "`n2. Testing Mechanic Job (demo-mechanic)..."
try {
    $body = @{
        customerName       = "Broken Car Owner"
        customerPhone      = "555-0199"
        vehicleDetails     = "Ford Mustang 1969"
        problemDescription = "Engine smoke"
        location           = @{ lat = 10.0; lng = 20.0 }
    } | ConvertTo-Json -Depth 3

    $res = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/public/demo-mechanic/jobs" -ContentType "application/json" -Body $body
    Write-Host "SUCCESS: Job ID $($res.id) created for $($res.vehicle_details)"
}
catch {
    Write-Host "FAIL: $($_.Exception.Message)"
    Write-Host $_.ErrorDetails.Message
}

Write-Host "`n3. Testing Cross-Tenant Validation (Sending Job to Restaurant)..."
try {
    $body = @{ customerName = "Fail"; customerPhone = "123"; vehicleDetails = "Car" } | ConvertTo-Json
    $res = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/public/demo-restaurant/jobs" -ContentType "application/json" -Body $body
    Write-Host "FAIL: Should have rejected job for restaurant"
}
catch {
    if ($_.Exception.Message -match "400") { Write-Host "SUCCESS: Got main error 400 (Type mismatch)" }
    else { Write-Host "FAIL: $($_.Exception.Message)" }
}
