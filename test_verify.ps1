Write-Host "1. Testing POST /users without token..."
try {
    Invoke-RestMethod -Method POST -Uri "http://localhost:3000/users" -ContentType "application/json" -Body '{}'
} catch {
    Write-Host "Response: $($_.Exception.Message)"
    if ($_.Exception.Message -match "401") { Write-Host "SUCCESS: Got 401" } else { Write-Host "FAIL: Expected 401" }
}

Write-Host "`n2. Logging in..."
$login = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/auth/login" -ContentType "application/json" -Body '{"email":"owner@demo.com","password":"secret123"}'
$token = $login.token
if ($token) { Write-Host "Got token" } else { Write-Host "Login Failed"; exit }

Write-Host "`n3. Testing POST /users with token..."
$rnd = Get-Random
try {
   $body = @{
     tenantId = "419312d1-113e-4a4d-85d1-b9b58ffe5327"
     email = "staff$rnd@demo.com"
     password = "staffpassword"
   } | ConvertTo-Json

   $user = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/users" -ContentType "application/json" -Headers @{Authorization=("Bearer " + $token)} -Body $body
   Write-Host "SUCCESS: Created user $($user.email)"
} catch {
   Write-Host "FAIL: $($_.Exception.Message)"
   Write-Host $_.ErrorDetails.Message
}
