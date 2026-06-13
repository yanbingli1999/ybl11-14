import React from 'react';
import { GameState, RopeAnchor, AnchorType } from '../types/game';

interface GameBoardProps {
  game: GameState;
}

const TILE_SIZE = 40;

const tileIcons: Record<string, string> = {
  wall: '🧱',
  floor: '',
  entrance: '🚪',
  exit: '⬆️',
  stone: '🪨',
  pressurePlate: '🔘',
  door: '🚪',
  trap: '⚠️',
  relic: '💎',
  torch: '🔥',
  chest: '📦',
  chasm: '🕳️',
};

const anchorIcons: Record<AnchorType, string> = {
  entrance: '⚓',
  exit: '⚓',
  wall: '📍',
};

export const GameBoard: React.FC<GameBoardProps> = ({ game }) => {
  const { room, player } = game;

  const getTileStyle = (tile: any, x: number, y: number): React.CSSProperties => {
    const isPlayer = player.position.x === x && player.position.y === y;
    const baseStyle: React.CSSProperties = {
      width: TILE_SIZE,
      height: TILE_SIZE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      position: 'relative',
      transition: 'all 0.2s ease',
    };

    if (!tile.visible && !tile.explored) {
      return { ...baseStyle, backgroundColor: '#1a1a2e' };
    }

    if (!tile.visible && tile.explored) {
      return { ...baseStyle, backgroundColor: '#2d2d44', opacity: 0.5 };
    }

    let bgColor = '#3d3d5c';
    switch (tile.type) {
      case 'wall':
        bgColor = '#4a4a6a';
        break;
      case 'floor':
        bgColor = tile.lit ? '#5a5a7a' : '#3d3d5c';
        break;
      case 'entrance':
        bgColor = '#2d5a2d';
        break;
      case 'exit':
        bgColor = '#5a5a2d';
        break;
      case 'door':
        bgColor = tile.activated ? '#2d5a5a' : '#5a2d2d';
        break;
      case 'pressurePlate':
        bgColor = tile.activated ? '#4a7a4a' : '#5a5a5a';
        break;
      case 'chasm':
        bgColor = '#0a0a14';
        break;
      default:
        bgColor = tile.lit ? '#5a5a7a' : '#3d3d5c';
    }

    return { ...baseStyle, backgroundColor: bgColor };
  };

  const getTileContent = (tile: any, x: number, y: number) => {
    const isPlayer = player.position.x === x && player.position.y === y;
    
    if (isPlayer) {
      return <span style={{ zIndex: 10 }}>🧙</span>;
    }

    if (!tile.visible && !tile.explored) {
      return null;
    }

    const anchor = player.rope.anchors.find(
      (a) => a.position.x === x && a.position.y === y
    );
    if (anchor && tile.visible) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span>{tileIcons[tile.type] || ''}</span>
          <span style={{ position: 'absolute', fontSize: '14px', top: '-2px', right: '-2px', filter: 'drop-shadow(0 0 2px #a855f7)' }}>
            {anchorIcons[anchor.anchorType]}
          </span>
        </div>
      );
    }

    const trap = room.traps.find(
      (t) => t.position.x === x && t.position.y === y && t.visible
    );
    if (trap && tile.visible) {
      return trap.triggered ? '💥' : '⚠️';
    }

    const relic = room.relics.find(
      (r) => r.position.x === x && r.position.y === y && !r.collected
    );
    if (relic && tile.visible) {
      return '💎';
    }

    const torch = room.torches.find(
      (t) => t.position.x === x && t.position.y === y && t.fuel > 0
    );
    if (torch && tile.visible) {
      return '🔥';
    }

    if (tile.type === 'door') {
      return tile.activated ? '🚪' : '🔒';
    }

    return tileIcons[tile.type] || '';
  };

  const boardWidth = room.width * TILE_SIZE + (room.width - 1) * 1 + 4 + 6;
  const boardHeight = room.height * TILE_SIZE + (room.height - 1) * 1 + 4 + 6;

  const renderRopeLines = () => {
    if (player.rope.anchors.length === 0) return null;

    const lines: JSX.Element[] = [];
    const px = player.position.x * (TILE_SIZE + 1) + TILE_SIZE / 2 + 2 + 3;
    const py = player.position.y * (TILE_SIZE + 1) + TILE_SIZE / 2 + 2 + 3;

    player.rope.anchors.forEach((anchor, idx) => {
      const ax = anchor.position.x * (TILE_SIZE + 1) + TILE_SIZE / 2 + 2 + 3;
      const ay = anchor.position.y * (TILE_SIZE + 1) + TILE_SIZE / 2 + 2 + 3;

      const dist = Math.abs(anchor.position.x - player.position.x) + Math.abs(anchor.position.y - player.position.y);
      const opacity = player.rope.broken ? 0.2 : Math.max(0.3, 1 - dist * 0.03);
      const color = player.rope.wear > 80 ? '#ef4444' : player.rope.wear > 50 ? '#fbbf24' : '#a855f7';

      lines.push(
        <line
          key={`rope-${idx}`}
          x1={px}
          y1={py}
          x2={ax}
          y2={ay}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={player.rope.broken ? '4 4' : '6 3'}
          opacity={opacity}
        />
      );
    });

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: boardWidth,
          height: boardHeight,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {lines}
      </svg>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${room.width}, ${TILE_SIZE}px)`,
          gap: '1px',
          backgroundColor: '#1a1a2e',
          border: '3px solid #4a4a6a',
          borderRadius: '4px',
          padding: '2px',
        }}
      >
        {renderRopeLines()}
        {room.tiles.map((row, y) =>
          row.map((tile, x) => (
            <div key={`${x}-${y}`} style={getTileStyle(tile, x, y)}>
              {getTileContent(tile, x, y)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
