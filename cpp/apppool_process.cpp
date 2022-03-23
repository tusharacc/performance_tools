#define UNICODE
#define _UNICODE
#include <windows.h>
#include <tlhelp32.h>
#include <tchar.h>
#include <Psapi.h>
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <stdlib.h>

using namespace std;

struct performanceData
{
    string peakPageFaultCount;
    string peakWorkingSetSize;
    string workingSetSize;
    string quotaPagePoolUsage;
    string quotaNonPagedPoolUsage;
    string pageFileUsage;
    string peakPageFileUsage;
    string numberOfThreads;
    string numberOfHandles;
    string kernelTime;
    string userTime;
    string readOperationCount;
    string writeOperationCount;
    string otherOperationCount;
    string readTransferCount;
    string writeTransferCount;
    string otherTransferCount;
};

struct processPerformanceData
{
    string processName;
    string processId;
    string datetime;
    performanceData pd;
};

BOOL GetProcessList(vector<processPerformanceData> &v);
string lptstring_tostring(TCHAR * str);
BOOL GetPerformanceDetails(DWORD processId,  processPerformanceData *pd);

int _tmain(int argc, wchar_t *argv[])
{   
    if (argc != 2){
        cout << "Incorrect Number of arguments " << argc << endl;
        return 1;
    }

    ofstream myfile ("performance.txt");
    
   
    int counter = _ttoi(argv[1]);


    while (counter > 0){
        vector<processPerformanceData> v = {};
    
        BOOL returnFromProcess = GetProcessList(v);
        if (TRUE == returnFromProcess)
        {
            for(processPerformanceData temp: v)
            {
                myfile  << temp.processId << "," 
                        << temp.processName <<  "," 
                        << temp.datetime << "," 
                        << temp.pd.kernelTime << "," 
                        << temp.pd.userTime << ","
                        << -1 << "," 
                        << -1 << "," 
                        << -1 << ","
                        << temp.pd.peakPageFaultCount << "," 
                        << temp.pd.peakWorkingSetSize << "," 
                        << temp.pd.workingSetSize << "," 
                        << temp.pd.peakPageFileUsage << "," 
                        << temp.pd.pageFileUsage << "," 
                        << -1 << ","
                        << temp.pd.numberOfThreads << "," 
                        << -1 << ","
                        << -1 << ","
                        << -1 << ","
                        << -1 << ","
                        << temp.pd.quotaPagePoolUsage << "," 
                        << temp.pd.quotaNonPagedPoolUsage << ","
                        << temp.pd.numberOfHandles << "," 
                        << temp.pd.readOperationCount << ","
                        << temp.pd.writeOperationCount << ","
                        << -1 << ","
                        << temp.pd.otherOperationCount << ","
                        << temp.pd.readTransferCount << ","
                        << temp.pd.writeTransferCount << ","
                        << -1 << ","
                        << temp.pd.otherOperationCount << ","
                        << -1 << ","
                        << endl;
            }
        }
        counter--;
        
        Sleep(1000);
    }
    
    myfile.close();
    return 0;
}

BOOL GetProcessList(vector<processPerformanceData> &v)
{
    HANDLE hProcessSnap;
    HANDLE hProcess;
    PROCESSENTRY32 pe32;
    DWORD dwPriorityClass;
    SYSTEMTIME systemTime;

    GetLocalTime(&systemTime);

    
    // Take a snapshot of all processes in the system.
    hProcessSnap = CreateToolhelp32Snapshot( TH32CS_SNAPPROCESS, 0 );
    if( hProcessSnap == INVALID_HANDLE_VALUE )
    {
        return( FALSE );
    }

    // Set the size of the structure before using it.
    pe32.dwSize = sizeof( PROCESSENTRY32 );

    // Retrieve information about the first process,
    // and exit if unsuccessful
    if( !Process32First( hProcessSnap, &pe32 ) )
    {
        CloseHandle( hProcessSnap );          // clean the snapshot object
        return( FALSE );
    }

    do
    {
        //cout << "Process Name : " << lptstring_tostring(pe32.szExeFile) << " Comparison "<< lstrcmpi(pe32.szExeFile,L"code.exe") <<endl;

        if (lstrcmpi(pe32.szExeFile,L"w3wp.exe") == 0)
        {
            cout << "W3WP Found : " << pe32.szExeFile << endl;
            //processPerformanceData pd = {0,0,0,{0,0,0,0,0,0,0,0,0,0}};
            processPerformanceData pd;
            DWORD processId = pe32.th32ProcessID;
            DWORD numberOfThreads = pe32.cntThreads;
            pd.processId = to_string(processId);
            pd.processName = lptstring_tostring(pe32.szExeFile);
            pd.datetime = to_string(systemTime.wYear) + "-" + to_string(systemTime.wMonth) + "-" + to_string(systemTime.wDay) + " " + to_string(systemTime.wHour) + ":" + to_string(systemTime.wMinute) + ":" + to_string(systemTime.wSecond);
            pd.pd.numberOfThreads = to_string(numberOfThreads);
            cout << "The process id is - " << processId << " .The process Name is - " << pd.processName << " .The number of threads " << pd.pd.numberOfThreads << endl;
            GetPerformanceDetails(processId, &pd);
            v.push_back(pd);
        }
    } while (Process32Next(hProcessSnap, &pe32));
    return TRUE;
}

string lptstring_tostring(TCHAR * str) {
    //cout << "The length of string is - " << sizeof(str) << endl;
	string s = "";
	for (int i= 0; str[i] != 0; i++) {
        //cout << "The character being processed is " << str[i] << endl;
		s += str[i];
	}
	return s;
}

BOOL GetPerformanceDetails(DWORD processId,  processPerformanceData *pd)
{
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION,FALSE, processId);

    if (NULL != hProcess)
    {

    } 
    else 
    {
        cout << "Process Handle Failed : " <<  GetLastError() << endl;
        return FALSE;
    }

    PROCESS_MEMORY_COUNTERS pmc;
    BOOL memoryCounters = GetProcessMemoryInfo( hProcess, &pmc, sizeof(pmc));

    if (memoryCounters == FALSE)
    {
        cout << "Memory Information Failed " << GetLastError() << endl;
        CloseHandle(hProcess);
        return FALSE;
    }

    pd->pd.pageFileUsage = to_string(pmc.PagefileUsage);
    pd->pd.peakPageFaultCount = to_string(pmc.PageFaultCount);
    pd->pd.peakPageFileUsage = to_string(pmc.PeakPagefileUsage);
    pd->pd.peakWorkingSetSize = to_string(pmc.PeakWorkingSetSize);
    pd->pd.quotaNonPagedPoolUsage = to_string(pmc.QuotaPeakNonPagedPoolUsage);
    pd->pd.quotaPagePoolUsage = to_string(pmc.QuotaPagedPoolUsage);
    pd->pd.workingSetSize = to_string(pmc.WorkingSetSize);

    FILETIME lpCreationTime;
    FILETIME lpExitTime;
    FILETIME lpKernelTime;
    FILETIME lpUserTime;
    BOOL processTimes = GetProcessTimes(hProcess,&lpCreationTime,&lpExitTime,&lpKernelTime,&lpUserTime);

    if (FALSE == processTimes)
    {
        cout << "Process Times Failed " << GetLastError() << endl;
        CloseHandle(hProcess);
        return false;
    }
    //SYSTEMTIME st;
    //SystemTimeToFileTime(&st, &lpKernelTime);
    //pd->pd.kernelTime = to_string(st.wYear) +"-"+ to_string(st.wMonth) +"-" + to_string(st.wDay)+" "+ to_string(st.wHour)+ ":"+ to_string(st.wMinute)+":"+ to_string(st.wSecond)+ "."+ to_string(st.wMilliseconds);
    //cout << "The time is " << st.wYear << "-" << st.wMonth << endl;
    ULARGE_INTEGER ul;
    ul.LowPart = lpKernelTime.dwLowDateTime;
    ul.HighPart = lpKernelTime.dwHighDateTime;
    cout << "The quad part " << ul.QuadPart << endl;
    pd->pd.kernelTime = to_string(ul.QuadPart);
    ul.LowPart = lpUserTime.dwLowDateTime;
    ul.HighPart = lpUserTime.dwHighDateTime;
    cout << "The user quad time " << ul.QuadPart << endl;
    pd->pd.userTime = to_string(ul.QuadPart);

    //SYSTEMTIME ut;
    //SystemTimeToFileTime(&ut, &lpUserTime);
    //pd->pd.userTime = to_string(ut.wYear) +"-"+ to_string(ut.wMonth) +"-" + to_string(ut.wDay)+" "+ to_string(ut.wHour)+ ":"+ to_string(ut.wMinute)+":"+ to_string(ut.wSecond)+ "."+ to_string(ut.wMilliseconds);


    DWORD dwHandleCount;
    BOOL processHandleCount = GetProcessHandleCount(hProcess, &dwHandleCount);

    if (FALSE == processHandleCount
    )
    {
        cout << "Process handle Failed " << GetLastError() << endl;
        CloseHandle(hProcess);
        return FALSE;
    }

    pd->pd.numberOfHandles = to_string(dwHandleCount);

    IO_COUNTERS ioCounters;
    BOOL ioCounterResult = GetProcessIoCounters(hProcess, &ioCounters);

    if (FALSE == ioCounterResult)
    {
        cout << "Get Io counter failed" << GetLastError() << endl;
        CloseHandle(hProcess);
        return FALSE;
    }

    pd->pd.readOperationCount = to_string(ioCounters.ReadOperationCount);
    pd->pd.writeOperationCount = to_string(ioCounters.WriteOperationCount);
    pd->pd.otherOperationCount = to_string(ioCounters.OtherOperationCount);
    pd->pd.readTransferCount = to_string(ioCounters.ReadTransferCount);
    pd->pd.writeTransferCount = to_string(ioCounters.WriteTransferCount);
    pd->pd.otherTransferCount = to_string(ioCounters.OtherTransferCount);

    return TRUE;
}