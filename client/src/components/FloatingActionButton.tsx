import { useNavigate } from 'react-router-dom';

export default function FloatingActionButton() {
  const navigate = useNavigate();

  const handleRandom = () => {
    const ch = Math.floor(Math.random() * 150) + 1;
    navigate(`/chapter/${ch}`);
  };

  return (
    <button
      onClick={handleRandom}
      className="fixed z-40 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-0 transition-all duration-300 hover:scale-110 active:scale-95 fab-pulse"
      style={{
        bottom: '80px',
        left: '20px',
        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
        boxShadow: '0 4px 20px rgba(212,168,67,0.4)',
        fontSize: '24px',
      }}
      title="פרק אקראי"
    >
      🎲
    </button>
  );
}
