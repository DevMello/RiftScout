"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";

export default function MatchProcessing() {
    const [file, setFile] = useState<File | null>(null);
    const [teamNumber, setTeamNumber] = useState("");
    const [matches, setMatches] = useState<any[]>([]);
    const [teamStatsW, setTeamStatsW] = useState<Record<string, any>>({});
    const [teamDetails, setTeamDetails] = useState<Record<string, any>>({});
    const [errorW, setErrorW] = useState("");
    const [loadingW, setLoadingW] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);

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
        <div className="flex justify-center items-center min-h-screen p-4">
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
                            accept="image/png"
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
                                                                    "Unknown"}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="p-4">
                                                            <p>
                                                                Season:{" "}
                                                                {teamStatsW[team]?.season || "N/A"}
                                                            </p>
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
        </div>
    );
}
