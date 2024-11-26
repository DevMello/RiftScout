'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
interface TeamData {
  name: string;
  number: number;
  schoolName: string;
  rookieYear: number;
  city: string;
  state: string;
  sponsors: string[];
}

interface TeamStats {
  tot: { value: number; rank: number };
  auto: { value: number; rank: number };
  dc: { value: number; rank: number };
  eg: { value: number; rank: number };
  count: number;
}

interface Award {
  type: string;
  placement: string;
}

interface Event {
  eventCode: string;
  stats: { rank: number };
}

interface EventTeam {
  teamNumber: number;
  stats: { rank: number; rp: number };
}

interface QuickStats {
  tot: { value: number };
  auto: { value: number };
  dc: { value: number };
  eg: { value: number };
}
export default function IndexPage() {
  const [number, setNumber] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCompareModal, setCompareShowModal] = useState<boolean>(false);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTeams, setEventTeams] = useState<Record<string, EventTeam[]>>({});
  const [teamQuickStats, setTeamQuickStats] = useState<Record<number, QuickStats>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [compareTeamData, setCompareTeamData] = useState<TeamData | null>(null);
  const [compareTeamStats, setCompareTeamStats] = useState<TeamStats | null>(null);
  const [expandedTeamDetails, setExpandedTeamDetails] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
    const [teamNumber, setTeamNumber] = useState("");
    const [matches, setMatches] = useState<any[]>([]);
    const [teamStatsW, setTeamStatsW] = useState<Record<string, any>>({});
    const [teamDetails, setTeamDetails] = useState<Record<string, any>>({});
    const [errorW, setErrorW] = useState("");
    const [loadingW, setLoadingW] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
  

  const [compareNumber, setCompareNumber] = useState<string>('');
  const year: number = 2024;
  const handleSearch = async () => {
    if (!number) {
      alert('Please enter a valid team number.');
      return;
    }

    setLoading(true);
    setError(null);
    setTeamData(null);
    setTeamStats(null);
    setAwards([]);
    setEvents([]);
    setEventTeams({});

    try {
      const teamResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}`);
      if (!teamResponse.ok) {
        throw new Error('Team not found or data unavailable');
      }
      const teamDataResult = await teamResponse.json();
      setTeamData(teamDataResult);
      const statsResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}/quick-stats?season=${year}`);
      if (!statsResponse.ok) {
        throw new Error('Quick stats not available for this team');
      }
      const statsData = await statsResponse.json();
      setTeamStats(statsData);
      const awardsResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}/awards?season=${year}`);
      if (!awardsResponse.ok) {
        throw new Error('Awards not available for this team');
      }
      const awardsData = await awardsResponse.json();
      setAwards(awardsData);

      const eventsResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}/events/${year}`);
      if (!eventsResponse.ok) {
        throw new Error('Events not available for this team');
      }
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      const eventTeamsData: Record<string, EventTeam[]> = {};
      for (const event of eventsData) {
        const eventTeamsResponse = await fetch(`https://api.ftcscout.org/rest/v1/events/${year}/${event.eventCode}/teams`);
        const eventTeamsResult = await eventTeamsResponse.json();
        eventTeamsData[event.eventCode] = eventTeamsResult;
      }
      setEventTeams(eventTeamsData);

      setShowModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamQuickStats = async (teamNumber: number) => {
    if (teamQuickStats[teamNumber]) return;
    setLoading(true);
    try {
      const quickStatsResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${teamNumber}/quick-stats?season=${year}`);
      if (!quickStatsResponse.ok) {
        throw new Error('Quick stats not available for this team');
      }
      const quickStatsData = await quickStatsResponse.json();
      setTeamQuickStats((prevStats) => ({
        ...prevStats,
        [teamNumber]: quickStatsData,
      }));
    } catch (err: any) {
      console.error(`Failed to fetch stats for team ${teamNumber}:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  const roundValue = (value: number, decimals: number = 2): number => {
    return value ? parseFloat(value.toFixed(decimals)) : 0;
  };


  const toggleEventDetails = (eventCode: string): void => {
    setExpandedEvent(expandedEvent === eventCode ? null : eventCode);
  };


  const toggleIndividualTeamDetails = (teamNumber: number): void => {
    setExpandedTeamDetails(expandedTeamDetails === teamNumber ? null : teamNumber);
    loadTeamQuickStats(teamNumber); 
  };

  const handleCompare = async () => {
    if (!number || !compareNumber) {
      alert('Please enter valid team numbers for both teams.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompareTeamData(null);
    setCompareTeamStats(null);

    try {

      const teamResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}`);
      const teamDataResult = await teamResponse.json();
      setTeamData(teamDataResult);

      const statsResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}/quick-stats?season=${year}`);
      const statsData = await statsResponse.json();
      setTeamStats(statsData);

      const compareTeamResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${compareNumber}`);
      const compareTeamDataResult = await compareTeamResponse.json();
      setCompareTeamData(compareTeamDataResult);

      const compareStatsResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${compareNumber}/quick-stats?season=${year}`);
      const compareStatsData = await compareStatsResponse.json();
      setCompareTeamStats(compareStatsData);

      setCompareShowModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const compareStats = (team1Stats: TeamStats | null, team2Stats: TeamStats | null) => {
    if (!team1Stats || !team2Stats) return { pros: [], cons: [], finalResult: '' };

    const pros: string[] = [];
    const cons: string[] = [];
    let result = '';
    
    if (team1Stats.tot.value > team2Stats.tot.value) {
      pros.push(`${teamData?.name} has higher Total OPR`);
    } else if (team1Stats.tot.value < team2Stats.tot.value) {
      cons.push(`${compareTeamData?.name} has higher Total OPR`);
    } else {
      pros.push('Total OPR is tied');
    }

    if (team1Stats.auto.value > team2Stats.auto.value) {
      pros.push(`${teamData?.name} has higher Auto OPR`);
    } else if (team1Stats.auto.value < team2Stats.auto.value) {
      cons.push(`${compareTeamData?.name} has higher Auto OPR`);
    } else {
      pros.push('Auto OPR is tied');
    }
    if (team1Stats.dc.value > team2Stats.dc.value) {
      pros.push(`${teamData?.name} has higher TeleOp OPR`);
    } else if (team1Stats.dc.value < team2Stats.dc.value) {
      cons.push(`${compareTeamData?.name} has higher TeleOp OPR`);
    } else {
      pros.push('TeleOp OPR is tied');
    }

    if (team1Stats.eg.value > team2Stats.eg.value) {
      pros.push(`${teamData?.name} has higher Endgame OPR`);
    } else if (team1Stats.eg.value < team2Stats.eg.value) {
      cons.push(`${compareTeamData?.name} has higher TeleOp OPR`);
    } else {
      pros.push('Endgame OPR is tied');
    }

    if (pros.length > cons.length) {
      result = `${teamData?.name} is the overall winner due to superior OPR stats.`;
    } else if (cons.length > pros.length) {
      result = `${compareTeamData?.name} is the overall winner due to superior OPR stats.`;
    } else {
      result = 'It is a tie between the teams, with no significant difference in OPR values.';
    }

    return { pros, cons, finalResult: result };
  };

  const { pros, cons, finalResult } = compareStats(teamStats, compareTeamStats);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorW("");
    setMatches([]);
    setTeamStatsW({});
    setTeamDetails({});
    setLoadingW(true);

    if (!file || !teamNumber) {
        setErrorW("Both fields are required");
        setLoadingW(false);
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("team_number", teamNumber);

    try {
        const response = await fetch("https://waiua.devmello.xyz/process_image", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            setMatches(data.filtered_matches);
            await fetchTeamStats(data.filtered_matches);
            setShowResults(true); 
        } else {
            setErrorW(data.error || "An error occurred");
        }
    } catch (err) {
        setErrorW("Error: Unable to process the image");
    } finally {
        setLoadingW(false);
    }
};

const fetchTeamStats = async (matches: any[]) => {
    const teamNumbers = new Set<string>();

    matches.forEach((match) => {
        [...match.blueTeam, ...match.redTeam].forEach((num) => {
            if (num !== teamNumber) teamNumbers.add(num);
        });
    });

    const stats: Record<string, any> = {};
    const details: Record<string, any> = {};

    for (const num of Array.from(teamNumbers)) {
        if (!teamStatsW[num]) {
            try {
                const statsResponse = await fetch(
                    `https://api.ftcscout.org/rest/v1/teams/${num}/quick-stats?season=2024`
                );
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    stats[num] = statsData;
                } else {
                    stats[num] = { rookie: true, message: "Stats not available" };
                }

                const detailsResponse = await fetch(
                    `https://api.ftcscout.org/rest/v1/teams/${num}`
                );
                if (detailsResponse.ok) {
                    const detailsData = await detailsResponse.json();
                    details[num] = detailsData;
                } else {
                    details[num] = { message: "Details not available" };
                }
            } catch {
                stats[num] = { rookie: true, message: "Error fetching stats" };
                details[num] = { message: "Error fetching details" };
            }
        }
    }

    setTeamStatsW((prevStats) => ({ ...prevStats, ...stats }));
    setTeamDetails((prevDetails) => ({ ...prevDetails, ...details }));
};

const calculateWinningProbability = (match: any) => {
    const calculateScore = (team: string[]) =>
        team.reduce(
            (score, num) => score + (teamStatsW[num]?.tot?.value || 0),
            0
        );

    const blueScore = calculateScore(match.blueTeam);
    const redScore = calculateScore(match.redTeam);

    const total = blueScore + redScore;
    return total
        ? {
              blue: ((blueScore / total) * 100).toFixed(2),
              red: ((redScore / total) * 100).toFixed(2),
          }
        : null;
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-gray-100">
          Rift Scout
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Who is your next partner?
        </p>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Enter a team number..."
            className="flex-grow"
            aria-label="Search input"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <Button type="button" aria-label="Search" onClick={handleSearch} data-umami-event="Search">
            Search
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Enter a team number for comparison..."
            className="flex-grow"
            aria-label="Compare input"
            value={compareNumber}
            onChange={(e) => setCompareNumber(e.target.value)}
          />
          <Button type="button" aria-label="Compare" onClick={handleCompare} data-umami-event="Compare">
            Compare
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        <div className="w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center text-white mb-6">
                    WAIUA (Who Am I Up Against)
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="imageFile">Upload Match Schedule</Label>
                        <Input
                            type="file"
                            id="imageFile"
                            name="file"
                            accept="image/*"
                            required
                            onChange={(e) => setFile(e.target.files![0])}
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="teamNumber">Team Number</Label>
                        <Input
                            type="text"
                            id="teamNumber"
                            name="team_number"
                            placeholder="Enter team number"
                            required
                            value={teamNumber}
                            onChange={(e) => setTeamNumber(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4">
                        Process Image
                    </Button>
                </form>

                {loadingW && (
                    <p className="text-center text-white mt-4">
                        Processing data, please wait...
                    </p>
                )}

                {errorW && <p className="text-red-500 text-center mt-4">{errorW}</p>}

                {/* Modal to show results */}
                <Dialog open={showResults} onOpenChange={setShowResults}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Filtered Matches</DialogTitle>
                            <DialogDescription>
                                Here are the matches and their probabilities.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {matches.map((match, index) => {
                                const probabilities = calculateWinningProbability(match);
                                return (
                                    <div key={index} className="mb-6">
                                        <h4 className="text-lg font-medium mb-2">
                                            Match {index + 1}
                                        </h4>
                                        <p>Blue Team: {match.blueTeam.join(", ")}</p>
                                        <p>Red Team: {match.redTeam.join(", ")}</p>
                                        {probabilities ? (
                                            <p>
                                                Winning Probabilities: Blue -{" "}
                                                {probabilities.blue}%, Red -{" "}
                                                {probabilities.red}%
                                            </p>
                                        ) : (
                                            <p>Insufficient stats to calculate probabilities</p>
                                        )}

                                        {[...match.blueTeam, ...match.redTeam]
                                            .filter((num) => num !== teamNumber)
                                            .map((team) => (
                                                <Dialog key={team}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            className="w-full p-2 rounded-lg bg-gray-700 text-white font-medium mt-4"
                                                            onClick={() => setSelectedTeam(team)}
                                                        >
                                                            Show Details for Team {team}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Team {team} Details
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                {teamDetails[team]?.name ||
                                                                    "Unknown Name"}
                                                                <br />
                                                                {teamDetails[team]?.schoolName ||
                                                                    "No School"}
                                                                <br />
                                                                {teamDetails[team]?.city ||
                                                                    "No City"}, {teamDetails[team]?.state ||
                                                                      "No State"}, {teamDetails[team]?.country ||
                                                                        "No Country"}
                                                                <br/>
                                                                {teamDetails[team]?.website ||
                                                                    "No Website"}
                                                                <br/>
                                                                {teamDetails[team]?.rookieYear ||
                                                                    "No Website"}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="p-4">
                                                            <p>
                                                                Total Score:{" "}
                                                                {teamStatsW[team]?.tot?.value?.toFixed(2) ||
                                                                    "N/A"}{" "}
                                                                (Rank:{" "}
                                                                {teamStatsW[team]?.tot?.rank || "N/A"})
                                                            </p>
                                                            <p>
                                                                Autonomous Score:{" "}
                                                                {teamStatsW[team]?.auto?.value?.toFixed(2) ||
                                                                    "N/A"}{" "}
                                                                (Rank:{" "}
                                                                {teamStatsW[team]?.auto?.rank || "N/A"})
                                                            </p>
                                                            <p>
                                                                Driver-Controlled Score:{" "}
                                                                {teamStatsW[team]?.dc?.value?.toFixed(2) ||
                                                                    "N/A"}{" "}
                                                                (Rank:{" "}
                                                                {teamStatsW[team]?.dc?.rank || "N/A"})
                                                            </p>
                                                        </div>
                                                        <DialogClose asChild>
                                                            <Button className="mt-4">Close</Button>
                                                        </DialogClose>
                                                    </DialogContent>
                                                </Dialog>
                                            ))}
                                    </div>
                                );
                            })}
                        </div>
                        <DialogClose asChild>
                            <Button className="w-full">Close</Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            </div>
          <p className="mt-12 text-xs text-base-content/70 ">By using this site, you agree to our 
          <a className="link hover:underline-offset-4" href="/privacy" target="_blank" rel="noreferrer" data-unami-event="Privacy"> Privacy Policy</a>
        </p>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}

        <Dialog open={showModal} onOpenChange={(open) => setShowModal(open)}>
          <DialogContent className="max-w-lg p-6 bg-gray-800 rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">{teamData?.name} - {teamData?.number}</DialogTitle>
              <DialogDescription className="text-white">
                <div><strong>School:</strong> {teamData?.schoolName}</div>
                <div><strong>Rookie Year:</strong> {teamData?.rookieYear}</div>
                <div><strong>Location:</strong> {teamData?.city}, {teamData?.state}</div>
                <div><strong>Sponsors:</strong> {teamData?.sponsors.join(', ')}</div>
              </DialogDescription>
            </DialogHeader>

            {/* Awards Section */}
            <DialogHeader>
              <DialogTitle className="text-white">Awards</DialogTitle>
              <DialogDescription className="text-white">
                {awards.length > 0 ? (
                  <ul>
                    {awards.map((award, index) => (
                      <li key={index}>
                        {award.type} - Placement: {award.placement}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No awards available for this team from .</div>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Team Stats Section */}
            <DialogHeader>
              <DialogTitle className="text-white">Team Stats</DialogTitle>
              <DialogDescription className="text-white">
                {teamStats ? (
                  <ul>
                    <li><strong>Total OPR:</strong> {roundValue(teamStats.tot.value)} (Rank: {teamStats.tot.rank})</li>
                    <li><strong>Auto OPR:</strong> {roundValue(teamStats.auto.value)} (Rank: {teamStats.auto.rank})</li>
                    <li><strong>TeleOp OPR:</strong> {roundValue(teamStats.dc.value)} (Rank: {teamStats.dc.rank})</li>
                    <li><strong>Endgame OPR:</strong> {roundValue(teamStats.eg.value)} (Rank: {teamStats.eg.rank})</li>
                  </ul>
                ) : (
                  <div>No team stats available for this season.</div>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Events Section */}
            <DialogHeader>
              <DialogTitle className="text-white">Events</DialogTitle>
              <DialogDescription className="text-white">
                {events.length > 0 ? (
                  <ul>
                    {events.map((event, index) => {
                      const sortedTeams = eventTeams[event.eventCode]?.sort((a, b) => a.stats.rank - b.stats.rank);
                      return (
                        <li key={index}>
                          <Button onClick={() => toggleEventDetails(event.eventCode)} className="w-full text-left bg-gray-500">
                            <strong>{event.eventCode} - Team Rank: {event.stats.rank}</strong>
                          </Button>

                          {expandedEvent === event.eventCode && (
                            <div className="ml-4 mt-2">
                              <ul>
                                {sortedTeams?.map((team, idx) => (
                                  <li key={idx}>
                                    <Button
                                      onClick={() => toggleIndividualTeamDetails(team.teamNumber)}
                                      className="w-full text-left bg-gray-400"
                                    >
                                      <strong>Team {team.teamNumber}</strong> - Rank: {team.stats.rank} RP: {roundValue(team.stats.rp)}
                                    </Button>

                                    {/* Expanded team details with quick stats */}
                                    {expandedTeamDetails === team.teamNumber && teamQuickStats[team.teamNumber] && (
                                      <div className="ml-4 mt-2">
                                        <ul>
                                          <li><strong>Team Number:</strong> {team.teamNumber}</li>
                                          <li><strong>Rank:</strong> {team.stats.rank}</li>
                                          <li><strong>RP:</strong> {roundValue(team.stats.rp)}</li>
                                          <li><strong>Total OPR:</strong> {roundValue(teamQuickStats[team.teamNumber].tot.value)}</li>
                                          <li><strong>Auto OPR:</strong> {roundValue(teamQuickStats[team.teamNumber].auto.value)}</li>
                                          <li><strong>TeleOp OPR:</strong> {roundValue(teamQuickStats[team.teamNumber].dc.value)}</li>
                                          <li><strong>Endgame OPR:</strong> {roundValue(teamQuickStats[team.teamNumber].eg.value)}</li>
                                        </ul>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div>No events available for this team.</div>
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>




        <Dialog open={showCompareModal} onOpenChange={(open) => setCompareShowModal(open)}>
          <DialogContent className="max-w-lg p-6 bg-gray-800 rounded-lg max-h-[90vh] overflow-y-auto">
            {/* Team 1 Stats */}
            {teamData && teamStats && (
            <DialogHeader>
              <DialogTitle className="text-white">{teamData.name} - {teamData.number}</DialogTitle>
              <DialogDescription className="text-white">
                <ul>
                  <li><strong>Total OPR:</strong> {roundValue(teamStats.tot.value)} (Rank: {teamStats.tot.rank})</li>
                  <li><strong>Auto OPR:</strong> {roundValue(teamStats.auto.value)} (Rank: {teamStats.auto.rank})</li>
                  <li><strong>TeleOp OPR:</strong> {roundValue(teamStats.dc.value)} (Rank: {teamStats.dc.rank})</li>
                  <li><strong>Endgame OPR:</strong> {roundValue(teamStats.eg.value)} (Rank: {teamStats.eg.rank})</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
            )}
            {/* Team 2 Stats (Compare Team) */}
            {compareTeamData && compareTeamStats && (
              <DialogHeader>
                <DialogTitle className="text-white">{compareTeamData.name} - {compareTeamData.number}</DialogTitle>
                <DialogDescription className="text-white">
                  <ul>
                    <li><strong>Total OPR:</strong> {roundValue(compareTeamStats.tot.value)} (Rank: {compareTeamStats.tot.rank})</li>
                    <li><strong>Auto OPR:</strong> {roundValue(compareTeamStats.auto.value)} (Rank: {compareTeamStats.auto.rank})</li>
                    <li><strong>TeleOp OPR:</strong> {roundValue(compareTeamStats.dc.value)} (Rank: {compareTeamStats.dc.rank})</li>
                    <li><strong>Endgame OPR:</strong> {roundValue(compareTeamStats.eg.value)} (Rank: {compareTeamStats.eg.rank})</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
            )}

            {/* Comparison Results */}
            <DialogHeader>
              <DialogTitle className="text-white">Comparison Results</DialogTitle>
              <DialogDescription className="text-white">
                <div>
                  <ul>
                    {pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul>
                    {cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
                <h3 className="mt-4 text-lg font-bold">Final Result</h3>
                <p>{finalResult}</p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
