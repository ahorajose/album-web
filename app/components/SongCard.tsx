type SongCardProps = {
  title: string;
  artist: string;
};

export default function SongCard({ title, artist }: SongCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
      }}
    >
      <h3>{title}</h3>
      <p>{artist}</p>
    </div>
  );
}
