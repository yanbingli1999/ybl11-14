import React from 'react';
import { GameState, Direction, AnchorType } from '../types/game';

interface ControlPanelProps {
  game: GameState;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onUseTorch: () => void;
  onRest: () => void;
  onNextFloor: () => void;
  onStartEscape: () => void;
  onRestart: () => void;
  onPlaceAnchor: () => void;
  onTravelToAnchor: (anchorId: string) => void;
  onRemoveAnchor: (anchorId: string) => void;
  crossChasmMode: boolean;
  onToggleCrossChasm: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  game,
  onMove,
  onUseTorch,
  onRest,
  onNextFloor,
  onStartEscape,
  onRestart,
  onPlaceAnchor,
  onTravelToAnchor,
  onRemoveAnchor,
  crossChasmMode,
  onToggleCrossChasm,
}) => {
  const isGameOver = game.status === 'victory' || game.status === 'defeat';
  const currentTile = game.room.tiles[game.player.position.y]?.[game.player.position.x];
  const isAtExit = currentTile?.type === 'exit';
  const isAtEntrance = currentTile?.type === 'entrance';
  const canEscape = game.status === 'exploring' && game.turn > 0 && (isAtEntrance || isAtExit);

  return (
    <div
      style={{
        backgroundColor: '#252540',
        padding: '16px',
        borderRadius: '8px',
        color: '#e0e0e0',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#c0c0ff' }}>
        🎮 操作
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() => onMove('up')}
          disabled={isGameOver}
          style={buttonStyle}
        >
          ⬆️
        </button>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onMove('left')}
            disabled={isGameOver}
            style={buttonStyle}
          >
            ⬅️
          </button>
          <div style={buttonStyle}>{/* spacer */}</div>
          <button
            onClick={() => onMove('right')}
            disabled={isGameOver}
            style={buttonStyle}
          >
            ➡️
          </button>
        </div>
        <button
          onClick={() => onMove('down')}
          disabled={isGameOver}
          style={buttonStyle}
        >
          ⬇️
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onUseTorch}
          disabled={isGameOver || game.player.torchesRemaining <= 0}
          style={actionButtonStyle('#fbbf24')}
        >
          🔥 使用火把 ({game.player.torchesRemaining})
        </button>

        <button
          onClick={onRest}
          disabled={isGameOver}
          style={actionButtonStyle('#4ade80')}
        >
          😴 休息 (+20体力)
        </button>

        {isAtExit && game.status === 'exploring' && (
          <button
            onClick={onNextFloor}
            style={actionButtonStyle('#60a5fa')}
          >
            ⬇️ 进入下一层
          </button>
        )}

        {canEscape && (
          <button
            onClick={onStartEscape}
            style={actionButtonStyle('#f87171')}
          >
            🏃 携带战利品撤离
          </button>
        )}

        {game.status === 'escaping' && (
          <div
            style={{
              padding: '8px',
              backgroundColor: '#f8717133',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '13px',
            }}
          >
            🏃 撤离中！回到入口🚪或出口⬆️撤离结算
          </div>
        )}

        {game.status === 'exploring' && game.turn > 0 && !canEscape && (
          <div
            style={{
              padding: '8px',
              backgroundColor: '#3d3d5c',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#aaa',
            }}
          >
            💡 走到入口🚪或出口⬆️可选择撤离
          </div>
        )}

        {isGameOver && (
          <button onClick={onRestart} style={actionButtonStyle('#a855f7')}>
            🔄 重新开始
          </button>
        )}

        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#2d2d44',
            borderRadius: '6px',
            border: crossChasmMode ? '2px solid #60a5fa' : '1px solid #3d3d5c',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#c0c0ff', marginBottom: '8px' }}>
            🪢 绳索系统
          </div>

          <button
            onClick={onPlaceAnchor}
            disabled={isGameOver || game.player.rope.broken}
            style={{
              ...actionButtonStyle('#a855f7'),
              width: '100%',
              marginBottom: '6px',
              fontSize: '13px',
              padding: '8px 12px',
            }}
          >
            📍 固定锚点 (E键) -2绳长
          </button>

          <button
            onClick={onToggleCrossChasm}
            disabled={isGameOver || game.player.rope.broken}
            style={{
              ...actionButtonStyle(crossChasmMode ? '#60a5fa' : '#3d3d5c'),
              width: '100%',
              marginBottom: '8px',
              fontSize: '13px',
              padding: '8px 12px',
              color: crossChasmMode ? '#1a1a2e' : '#e0e0e0',
            }}
          >
            {crossChasmMode ? '🎯 跨越中：选方向' : '🕳️ 跨越裂隙 (Q键)'} -3绳长
          </button>

          {crossChasmMode && (
            <div
              style={{
                padding: '6px',
                backgroundColor: '#60a5fa22',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#93c5fd',
                marginBottom: '8px',
              }}
            >
              按方向键/WASD跨越相邻裂隙
            </div>
          )}

          {game.player.rope.anchors.length > 0 && (
            <div style={{ fontSize: '12px' }}>
              <div style={{ color: '#aaa', marginBottom: '4px' }}>📍 已放置锚点：</div>
              {game.player.rope.anchors.map((anchor) => {
                const typeLabels: Record<AnchorType, string> = {
                  entrance: '入口🚪',
                  exit: '出口⬆️',
                  wall: '墙根🧱',
                };
                const dist =
                  Math.abs(anchor.position.x - game.player.position.x) +
                  Math.abs(anchor.position.y - game.player.position.y);
                const canRemove = dist <= 1;
                const cost = Math.ceil(dist * 0.5);
                const canTravel =
                  !game.player.rope.broken &&
                  dist > 1 &&
                  game.player.rope.remainingLength >= cost;
                return (
                  <div
                    key={anchor.id}
                    style={{
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center',
                      marginBottom: '4px',
                      padding: '4px',
                      backgroundColor: '#1a1a2e',
                      borderRadius: '4px',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: '11px' }}>
                      {typeLabels[anchor.anchorType]}
                      <span style={{ color: '#888' }}> ({dist}格)</span>
                    </span>
                    <button
                      onClick={() => onTravelToAnchor(anchor.id)}
                      disabled={!canTravel || isGameOver}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        backgroundColor: canTravel ? '#60a5fa' : '#3d3d5c',
                        color: canTravel ? '#1a1a2e' : '#6b7280',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: canTravel ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                      }}
                    >
                      前往(-{cost})
                    </button>
                    <button
                      onClick={() => onRemoveAnchor(anchor.id)}
                      disabled={!canRemove || isGameOver}
                      title={canRemove ? '回收锚点' : '需站在旁边'}
                      style={{
                        padding: '3px 6px',
                        fontSize: '11px',
                        backgroundColor: canRemove ? '#f87171' : '#3d3d5c',
                        color: canRemove ? '#1a1a2e' : '#6b7280',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: canRemove ? 'pointer' : 'not-allowed',
                      }}
                    >
                      ♻️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          padding: '8px',
          backgroundColor: '#1a1a2e',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#aaa',
        }}
      >
        <div>💡 提示:</div>
        <div>• 方向键/WASD 移动</div>
        <div>• 推石头到机关上开门</div>
        <div>• 小心陷阱和诅咒</div>
        <div>• 见好就收，及时撤离</div>
        <div style={{ marginTop: '6px', borderTop: '1px solid #3d3d5c', paddingTop: '6px', color: '#93c5fd' }}>
          🪢 <strong>绳索系统:</strong>
        </div>
        <div>• <strong>E键</strong>: 在入口/出口/墙边固定锚点</div>
        <div>• <strong>Q键</strong>: 开启跨越裂隙模式后选方向</div>
        <div>• 点击"前往"按钮快速滑到锚点</div>
        <div>• 携带重物会磨损绳索，注意⚠️磨损条</div>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  fontSize: '18px',
  backgroundColor: '#3d3d5c',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const actionButtonStyle = (color: string): React.CSSProperties => ({
  padding: '10px 16px',
  backgroundColor: color,
  color: '#1a1a2e',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
});
