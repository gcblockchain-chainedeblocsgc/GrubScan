pragma solidity ^0.4.2;


contract Grubscan {
    uint public timeStamp;
    uint public historyCount;
    
    struct HistoryLog {
        uint id;
        string company;
        string date;
        string process;
        string treatment;
    }

    mapping(uint => HistoryLog) public historyLogs;

    function Grubscan() public {
        addHistory("AgroFarms", "April1", "Fertilizing", "NPK");
        addHistory("AdankoFarms", "April2", "Processing", "Soya Milk");
    }

    function addHistory(
        string company,
        string date,
        string process,
        string treatment) public 
    {
        
        historyCount++;
        historyLogs[historyCount] = HistoryLog(historyCount, company, date, process, treatment);

    }
}