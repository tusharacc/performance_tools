$counters = @('\Process(w3wp_replaceId)\% Processor Time',
'\Process(w3wp_replaceId)\% User Time',
'\Process(w3wp_replaceId)\% Privileged Time',
'\Process(w3wp_replaceId)\Virtual Bytes Peak',
'\Process(w3wp_replaceId)\Virtual Bytes',
'\Process(w3wp_replaceId)\Page Faults/sec',
'\Process(w3wp_replaceId)\Working Set Peak',
'\Process(w3wp_replaceId)\Working Set',
'\Process(w3wp_replaceId)\Page File Bytes Peak',
'\Process(w3wp_replaceId)\Page File Bytes',
'\Process(w3wp_replaceId)\Private Bytes',
'\Process(w3wp_replaceId)\Thread Count',
'\Process(w3wp_replaceId)\Priority Base',
'\Process(w3wp_replaceId)\Elapsed Time',
'\Process(w3wp_replaceId)\ID Process',
'\Process(w3wp_replaceId)\Creating Process ID',
'\Process(w3wp_replaceId)\Pool Paged Bytes',
'\Process(w3wp_replaceId)\Pool Nonpaged Bytes',
'\Process(w3wp_replaceId)\Handle Count',
'\Process(w3wp_replaceId)\IO Read Operations/sec',
'\Process(w3wp_replaceId)\IO Write Operations/sec',
'\Process(w3wp_replaceId)\IO Data Operations/sec',
'\Process(w3wp_replaceId)\IO Other Operations/sec',
'\Process(w3wp_replaceId)\IO Read Bytes/sec',
'\Process(w3wp_replaceId)\IO Write Bytes/sec',
'\Process(w3wp_replaceId)\IO Data Bytes/sec',
'\Process(w3wp_replaceId)\IO Other Bytes/sec',
'\Process(w3wp_replaceId)\Working Set - Private')

$numberOfSamples = 10
$performance =[System.Collections.ArrayList]@() 
while ($numberOfSamples > 0){

    $workerProcesses = C:\Windows\System32\inetsrv\appcmd.exe LIST WP

    $processIds = @()

    foreach($process in $workerProcesses){
        $result = $process -match 'WP \"(?<processId>\d*)\".*'
        if ($result){
            $processIds += $Matches.processId
        }
    }



    foreach ($process in $processIds){
        $processCounters = @()
        for ($i=0;$i -lt $counters.Length; $i++)
        {
            $processCounters += $counters[$i] -replace "replaceId",$process
        }

        $result = Get-Counter -Counter $processCounters
        $processCounterValue = @($process,"W3WP",$result.Timestamp)
        foreach($row in $result.CounterSamples)
        {
            $processCounterValue += $row.CookedValue
        }
        $performance.Add($processCounterValue)

    }
    $numberOfSamples -= 1
    Start-Sleep -Seconds 1
}

if (Test-Path -Path performance.txt){
    Remove-Item performance.txt
}

foreach($record in $performance)
{
    $joined = $record -join ","
    Out-File -FilePath performance.txt -Append -InputObject $joined
}