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

interface QuickStats {
  tot: { value: number };
  auto: { value: number };
  dc: { value: number };
  eg: { value: number };
}

// Component
export default function IndexPage() {
  const [number, setNumber] = useState<string>('');
  const [compareNumber, setCompareNumber] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [compareTeamData, setCompareTeamData] = useState<TeamData | null>(null);
  const [compareTeamStats, setCompareTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    setCompareTeamData(null);
    setCompareTeamStats(null);

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

      setShowModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

      setShowModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roundValue = (value: number, decimals: number = 2): number => {
    return value ? parseFloat(value.toFixed(decimals)) : 0;
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
            {/* Team 1 Stats */}
            <DialogHeader>
              <DialogTitle className="text-white">{teamData?.name} - {teamData?.number}</DialogTitle>
              <DialogDescription className="text-white">
                <ul>
                  <li><strong>Total OPR:</strong> {roundValue(teamStats?.tot.value)} (Rank: {teamStats?.tot.rank})</li>
                  <li><strong>Auto OPR:</strong> {roundValue(teamStats?.auto.value)} (Rank: {teamStats?.auto.rank})</li>
                  <li><strong>TeleOp OPR:</strong> {roundValue(teamStats?.dc.value)} (Rank: {teamStats?.dc.rank})</li>
                  <li><strong>Endgame OPR:</strong> {roundValue(teamStats?.eg.value)} (Rank: {teamStats?.eg.rank})</li>
                </ul>
              </DialogDescription>
            </DialogHeader>

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
