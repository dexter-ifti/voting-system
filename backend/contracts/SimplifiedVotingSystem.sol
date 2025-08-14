// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimplifiedVotingSystem {
    struct Voter {
        uint voterId;
        uint voteCandidateId;
        address voterAddress;
        bool isRegistered;
        bool hasVoted;
    }

    struct Candidate {
        uint candidateId;
        address candidateAddress;
        uint votes;
        bool isActive;
    }

    address public electionCommission;
    address public winner;
    uint public nextVoterId = 1;
    uint public nextCandidateId = 1;
    bool public emergencyStop = false;
    bool public votingActive = false;
    bool public resultsAnnounced = false;
    uint public totalVotes = 0;
    
    mapping(uint => Voter) public voterDetails;
    mapping(uint => Candidate) public candidateDetails;
    mapping(address => uint) public voterAddressToId;
    mapping(address => uint) public candidateAddressToId;

    // Events
    event VoterRegistered(uint indexed voterId, address indexed voterAddress);
    event CandidateRegistered(uint indexed candidateId, address indexed candidateAddress);
    event VoteCast(uint indexed voterId, uint indexed candidateId, address indexed voterAddress);
    event VotingStarted();
    event VotingEnded();
    event ResultsAnnounced(address indexed winner, uint votes);

    constructor() {
        electionCommission = msg.sender;
    }

    modifier onlyCommissioner() {
        require(msg.sender == electionCommission, "Only election commission authorized");
        _;
    }

    modifier votingInProgress() {
        require(votingActive, "Voting is not active");
        require(!emergencyStop, "Emergency stop activated");
        _;
    }

    modifier votingNotStarted() {
        require(!votingActive, "Voting has already started");
        _;
    }

    // Candidate Registration
    function registerCandidate() external votingNotStarted {
        require(candidateAddressToId[msg.sender] == 0, "Already registered as candidate");
        require(voterAddressToId[msg.sender] == 0, "Cannot be both voter and candidate");
        require(msg.sender != electionCommission, "Election commission cannot be candidate");
        require(nextCandidateId <= 10, "Maximum 10 candidates allowed");

        candidateDetails[nextCandidateId] = Candidate({
            candidateId: nextCandidateId,
            candidateAddress: msg.sender,
            votes: 0,
            isActive: true
        });
        
        candidateAddressToId[msg.sender] = nextCandidateId;
        
        emit CandidateRegistered(nextCandidateId, msg.sender);
        nextCandidateId++;
    }

    // Voter Registration
    function registerVoter() external votingNotStarted {
        require(voterAddressToId[msg.sender] == 0, "Already registered as voter");
        require(candidateAddressToId[msg.sender] == 0, "Cannot be both voter and candidate");

        voterDetails[nextVoterId] = Voter({
            voterId: nextVoterId,
            voteCandidateId: 0,
            voterAddress: msg.sender,
            isRegistered: true,
            hasVoted: false
        });
        
        voterAddressToId[msg.sender] = nextVoterId;
        
        emit VoterRegistered(nextVoterId, msg.sender);
        nextVoterId++;
    }

    // Start voting (only commissioner)
    function startVoting() external onlyCommissioner votingNotStarted {
        require(nextCandidateId > 1, "Need at least one candidate");
        votingActive = true;
        emit VotingStarted();
    }

    // Voting Function
    function castVote(uint _candidateId) external votingInProgress {
        uint voterId = voterAddressToId[msg.sender];
        require(voterId != 0, "Not registered as voter");
        require(!voterDetails[voterId].hasVoted, "Already voted");
        require(_candidateId > 0 && _candidateId < nextCandidateId, "Invalid candidate ID");
        require(candidateDetails[_candidateId].isActive, "Candidate is not active");

        voterDetails[voterId].voteCandidateId = _candidateId;
        voterDetails[voterId].hasVoted = true;
        candidateDetails[_candidateId].votes++;
        totalVotes++;
        
        emit VoteCast(voterId, _candidateId, msg.sender);
    }

    // End voting
    function endVoting() external onlyCommissioner {
        require(votingActive, "Voting not started");
        votingActive = false;
        emit VotingEnded();
    }

    // Announce Results
    function announceResults() external onlyCommissioner {
        require(!votingActive, "Voting must be ended first");
        require(!resultsAnnounced, "Results already announced");

        uint maxVotes = 0;
        address winnerAddress = address(0);
        
        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidateDetails[i].votes > maxVotes) {
                maxVotes = candidateDetails[i].votes;
                winnerAddress = candidateDetails[i].candidateAddress;
            }
        }
        
        winner = winnerAddress;
        resultsAnnounced = true;
        
        emit ResultsAnnounced(winner, maxVotes);
    }

    // View Functions
    function getCandidateCount() external view returns (uint) {
        return nextCandidateId - 1;
    }

    function getVoterCount() external view returns (uint) {
        return nextVoterId - 1;
    }

    function getCandidateVotes(uint _candidateId) external view returns (uint) {
        require(_candidateId > 0 && _candidateId < nextCandidateId, "Invalid candidate ID");
        return candidateDetails[_candidateId].votes;
    }

    function getVoterChoice(address _voterAddress) external view returns (uint) {
        uint voterId = voterAddressToId[_voterAddress];
        require(voterId != 0, "Voter not found");
        return voterDetails[voterId].voteCandidateId;
    }

    function isVotingActive() external view returns (bool) {
        return votingActive && !emergencyStop;
    }

    function hasVoted(address _voterAddress) external view returns (bool) {
        uint voterId = voterAddressToId[_voterAddress];
        if (voterId == 0) return false;
        return voterDetails[voterId].hasVoted;
    }

    function isRegisteredVoter(address _voterAddress) external view returns (bool) {
        return voterAddressToId[_voterAddress] != 0;
    }

    function isRegisteredCandidate(address _candidateAddress) external view returns (bool) {
        return candidateAddressToId[_candidateAddress] != 0;
    }

    // Get results (public view after announcement)
    function getResults() external view returns (address winnerAddress, uint winnerVotes, uint totalVotesCast) {
        require(resultsAnnounced, "Results not announced yet");
        
        uint maxVotes = 0;
        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidateDetails[i].votes > maxVotes) {
                maxVotes = candidateDetails[i].votes;
                winnerAddress = candidateDetails[i].candidateAddress;
            }
        }
        
        return (winnerAddress, maxVotes, totalVotes);
    }

    // Emergency functions
    function emergencyStopVoting() external onlyCommissioner {
        emergencyStop = true;
    }

    function resumeVoting() external onlyCommissioner {
        emergencyStop = false;
    }
}
