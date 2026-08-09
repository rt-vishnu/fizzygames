import CategoryStrip from "@/components/CategoryStrip";
import FlagshipRow from "@/components/FlagshipRow";
import GameRow from "@/components/GameRow";
import Hero from "@/components/Hero";
import RecentlyPlayed from "@/components/RecentlyPlayed";
import {
  flagshipGames,
  newestGames,
  popularGames,
  topRatedGames,
} from "@/lib/games";

export default function Home() {
  const flagships = flagshipGames();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10">
      <Hero game={flagships[0]} />
      <RecentlyPlayed />
      <FlagshipRow games={flagships} />
      <GameRow
        title="Popular right now"
        subtitle="What everyone else is clicking."
        games={popularGames().slice(0, 5)}
        href="/popular"
      />
      <CategoryStrip />
      <GameRow
        title="Fresh arrivals"
        subtitle="Added most recently."
        games={newestGames().slice(0, 5)}
        href="/new"
      />
      <GameRow
        title="Top rated"
        subtitle="Highest scores from players."
        games={topRatedGames().slice(0, 5)}
      />
    </div>
  );
}
