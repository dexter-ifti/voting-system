// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Voter {
        string name;
        uint age;
        uint voterId;
        Gender gender;
        uint voteCandidateId;
        address voterAddress;
        bool isRegistered;
        uint registrationTime;
    }

    struct Candidate {
        string name;
        string party;
        string manifesto;
        uint age;
        Gender gender;
        uint candidateId;
        address candidateAddress;
        uint votes;
        bool isActive;
        uint registrationTime;
    }

    struct Election {
        string title;
        string description;
        uint startTime;
        uint endTime;
        bool isActive;
        uint totalVotes;
        bool resultsAnnounced;
    }

    address public electionCommission;
    address public winner;
    uint public nextVoterId = 1;
    uint public nextCandidateId = 1;
    bool public emergencyStop = false;
    
    Election public electionDetails;
    
    mapping(uint => Voter) public voterDetails;
    mapping(uint => Candidate) public candidateDetails;
    mapping(address => uint) public voterAddressToId;
    mapping(address => uint) public candidateAddressToId;
    
    enum VotingStatus {NotStarted, InProgress, Ended}
    enum Gender {NotSpecified, Male, Female, Other}

    // Events
    event ElectionCreated(string title, uint startTime, uint endTime);
    event VoterRegistered(uint indexed voterId, address indexed voterAddress, string name);
    event CandidateRegistered(uint indexed candidateId, address indexed candidateAddress, string name, string party);
    event VoteCast(uint indexed voterId, uint indexed candidateId, address indexed voterAddress);
    event VotingResultAnnounced(address indexed winner, uint votes);
    event EmergencyStop();
    event ElectionEnded();

    constructor(
        string memory _title,
        string memory _description
    ) {
        electionCommission = msg.sender;
        electionDetails = Election({
            title: _title,
            description: _description,
            startTime: 0,
            endTime: 0,
            isActive: false,
            totalVotes: 0,
            resultsAnnounced: false
        });
        
        emit ElectionCreated(_title, 0, 0);
    }

    modifier onlyCommissioner() {
        require(msg.sender == electionCommission, "Only election commission authorized");
        _;
    }

    modifier isValidAge(uint _age) {
        require(_age >= 18, "Must be 18 or older to participate");
        _;
    }

    modifier votingActive() {
        require(getVotingStatus() == VotingStatus.InProgress, "Voting is not active");
        require(!emergencyStop, "Emergency stop activated");
        _;
    }

    modifier votingNotStarted() {
        require(getVotingStatus() == VotingStatus.NotStarted, "Election has already started");
        _;
    }

    // Election Management Functions
    function setElectionDetails(
        string memory _title,
        string memory _description,
        uint _startTimeFromNow,
        uint _durationInSeconds
    ) external onlyCommissioner votingNotStarted {
        require(_startTimeFromNow > 0, "Start time must be in the future");
        require(_durationInSeconds > 0, "Duration must be positive");
        
        electionDetails.title = _title;
        electionDetails.description = _description;
        electionDetails.startTime = block.timestamp + _startTimeFromNow;
        electionDetails.endTime = electionDetails.startTime + _durationInSeconds;
        electionDetails.isActive = true;
        
        emit ElectionCreated(_title, electionDetails.startTime, electionDetails.endTime);
    }

    // Candidate Registration
    function registerCandidate(
        string calldata _name,
        string calldata _party,
        string calldata _manifesto,
        uint _age,
        Gender _gender
    ) external isValidAge(_age) votingNotStarted {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_party).length > 0, "Party cannot be empty");
        require(candidateAddressToId[msg.sender] == 0, "Already registered as candidate");
        require(voterAddressToId[msg.sender] == 0, "Cannot be both voter and candidate");
        require(msg.sender != electionCommission, "Election commission cannot be candidate");
        require(nextCandidateId <= 10, "Maximum 10 candidates allowed"); // Increased limit

        candidateDetails[nextCandidateId] = Candidate({
            name: _name,
            party: _party,
            manifesto: _manifesto,
            age: _age,
            gender: _gender,
            candidateId: nextCandidateId,
            candidateAddress: msg.sender,
            votes: 0,
            isActive: true,
            registrationTime: block.timestamp
        });
        
        candidateAddressToId[msg.sender] = nextCandidateId;
        
        emit CandidateRegistered(nextCandidateId, msg.sender, _name, _party);
        nextCandidateId++;
    }

    // Voter Registration
    function registerVoter(
        string calldata _name,
        uint _age,
        Gender _gender
    ) external isValidAge(_age) votingNotStarted {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(voterAddressToId[msg.sender] == 0, "Already registered as voter");
        require(candidateAddressToId[msg.sender] == 0, "Cannot be both voter and candidate");

        voterDetails[nextVoterId] = Voter({
            name: _name,
            age: _age,
            voterId: nextVoterId,
            gender: _gender,
            voteCandidateId: 0,
            voterAddress: msg.sender,
            isRegistered: true,
            registrationTime: block.timestamp
        });
        
        voterAddressToId[msg.sender] = nextVoterId;
        
        emit VoterRegistered(nextVoterId, msg.sender, _name);
        nextVoterId++;
    }

    // Voting Function
    function castVote(uint _candidateId) external votingActive {
        uint voterId = voterAddressToId[msg.sender];
        require(voterId != 0, "Not registered as voter");
        require(voterDetails[voterId].voteCandidateId == 0, "Already voted");
        require(_candidateId > 0 && _candidateId < nextCandidateId, "Invalid candidate ID");
        require(candidateDetails[_candidateId].isActive, "Candidate is not active");

        voterDetails[voterId].voteCandidateId = _candidateId;
        candidateDetails[_candidateId].votes++;
        electionDetails.totalVotes++;
        
        emit VoteCast(voterId, _candidateId, msg.sender);
    }

    // View Functions
    function getCandidateList() external view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](nextCandidateId - 1);
        for (uint i = 1; i < nextCandidateId; i++) {
            candidateList[i - 1] = candidateDetails[i];
        }
        return candidateList;
    }

    function getVoterList() external view onlyCommissioner returns (Voter[] memory) {
        Voter[] memory voterList = new Voter[](nextVoterId - 1);
        for (uint i = 1; i < nextVoterId; i++) {
            voterList[i - 1] = voterDetails[i];
        }
        return voterList;
    }

    function getVotingStatus() public view returns (VotingStatus) {
        if (electionDetails.startTime == 0 || block.timestamp < electionDetails.startTime) {
            return VotingStatus.NotStarted;
        } else if (block.timestamp > electionDetails.endTime || emergencyStop) {
            return VotingStatus.Ended;
        }
        return VotingStatus.InProgress;
    }

    function getElectionInfo() external view returns (Election memory) {
        return electionDetails;
    }

    function getVoterInfo(address _voterAddress) external view returns (Voter memory) {
        uint voterId = voterAddressToId[_voterAddress];
        require(voterId != 0, "Voter not found");
        return voterDetails[voterId];
    }

    function getCandidateInfo(uint _candidateId) external view returns (Candidate memory) {
        require(_candidateId > 0 && _candidateId < nextCandidateId, "Invalid candidate ID");
        return candidateDetails[_candidateId];
    }

    // Results and Administration
    function announceResults() external onlyCommissioner {
        require(getVotingStatus() == VotingStatus.Ended, "Voting must be ended");
        require(!electionDetails.resultsAnnounced, "Results already announced");

        uint maxVotes = 0;
        address winnerAddress;
        
        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidateDetails[i].votes > maxVotes) {
                maxVotes = candidateDetails[i].votes;
                winnerAddress = candidateDetails[i].candidateAddress;
            }
        }
        
        winner = winnerAddress;
        electionDetails.resultsAnnounced = true;
        
        emit VotingResultAnnounced(winner, maxVotes);
    }

    function emergencyStopVoting() external onlyCommissioner {
        emergencyStop = true;
        emit EmergencyStop();
    }

    function endElection() external onlyCommissioner {
        require(getVotingStatus() == VotingStatus.Ended, "Election must be ended first");
        electionDetails.isActive = false;
        emit ElectionEnded();
    }

    // Get results (public view after announcement)
    function getResults() external view returns (address winnerAddress, uint winnerVotes, uint totalVotes) {
        require(electionDetails.resultsAnnounced, "Results not announced yet");
        
        uint maxVotes = 0;
        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidateDetails[i].votes > maxVotes) {
                maxVotes = candidateDetails[i].votes;
                winnerAddress = candidateDetails[i].candidateAddress;
            }
        }
        
        return (winnerAddress, maxVotes, electionDetails.totalVotes);
    }
}