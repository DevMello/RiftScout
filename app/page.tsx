'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

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

// Component
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
      // Fetch main team data
      const teamResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}`);
      const teamDataResult = await teamResponse.json();
      setTeamData(teamDataResult);

      const statsResponse = await fetch(`https://api.ftcscout.org/rest/v1/teams/${number}/quick-stats?season=${year}`);
      const statsData = await statsResponse.json();
      setTeamStats(statsData);

      // Fetch comparison team data
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
    
    // Compare Total OPR
    if (team1Stats.tot.value > team2Stats.tot.value) {
      pros.push(`${teamData?.name} has higher Total OPR`);
    } else if (team1Stats.tot.value < team2Stats.tot.value) {
      cons.push(`${compareTeamData?.name} has higher Total OPR`);
    } else {
      pros.push('Total OPR is tied');
    }

    // Compare Auto OPR
    if (team1Stats.auto.value > team2Stats.auto.value) {
      pros.push(`${teamData?.name} has higher Auto OPR`);
    } else if (team1Stats.auto.value < team2Stats.auto.value) {
      cons.push(`${compareTeamData?.name} has higher Auto OPR`);
    } else {
      pros.push('Auto OPR is tied');
    }

    // Compare TeleOp OPR
    if (team1Stats.dc.value > team2Stats.dc.value) {
      pros.push(`${teamData?.name} has higher TeleOp OPR`);
    } else if (team1Stats.dc.value < team2Stats.dc.value) {
      cons.push(`${compareTeamData?.name} has higher TeleOp OPR`);
    } else {
      pros.push('TeleOp OPR is tied');
    }

    // Compare Endgame OPR
    if (team1Stats.eg.value > team2Stats.eg.value) {
      pros.push(`${teamData?.name} has higher Endgame OPR`);
    } else if (team1Stats.eg.value < team2Stats.eg.value) {
      cons.push(`${compareTeamData?.name} has higher TeleOp OPR`);
    } else {
      pros.push('Endgame OPR is tied');
    }

    // Final comparison result
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
          <Button type="button" aria-label="Search" onClick={handleSearch}>
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
          <Button type="button" aria-label="Compare" onClick={handleCompare}>
            Compare
          </Button>
        </div>
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
