#Remove any older output file. Assumed that the file was named "cpu.csv"
if (Test-Path -Path cpu.csv){
    Remove-Item -Path cpu.csv
}

#Adding header to output file
Add-Content -Path cpu.csv -Value "Time,Percentage"

while ($true){

    #Communicating to program through clipboard. Once the clipboard has "STOP", the program will exit
    $clipboard = Get-Clipboard

    if ($clipboard -eq "STOP"){
        break
    }

    #Use CimInstance to get the current load percentage
    $load_percentage = (Get-CimInstance -ClassName win32_processor).LoadPercentage

    $date = Get-Date -Format "yyyy-MM-dd HH:mm"

    Add-Content -Path cpu.csv -Value "$date, $load_percentage"

    Write-Host "Sleeping for a second"

    #Sleep for a second
    Start-Sleep -Seconds 1
}