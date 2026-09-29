'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  getCourtCoordinates,
  getNextRotationPosition,
  isValidCourtPosition,
  getCourtPositionName,
  shouldLiberoReplace,
  shouldPlayerReturnFromLibero,
  isBackRowPosition,
  type CourtPosition
} from '@/utils/volleyballUtils';

// Types conformes au backend Prisma
export type VolleyballPosition =
  | 'SETTER'         // Passeur (S)
  | 'OUTSIDE_HITTER' // Attaquant de pointe (WS - Wing Spiker)
  | 'MIDDLE_BLOCKER' // Central (MB)
  | 'OPPOSITE'       // Attaquant diagonal (Op)
  | 'LIBERO'         // Libéro (L)
  | 'DEFENSIVE_SPECIALIST'; // Spécialiste défensif

export interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  jerseyNumber: number;
  volleyballPosition: VolleyballPosition;
  courtPosition: CourtPosition; // Position 1-6 sur le terrain
  avatar?: string;
  color?: string;
}

export interface Movement {
  playerId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  timestamp: number;
}

export type PhaseType = 'service' | 'reception' | 'attack' | 'defense' | 'transition';

export interface Ball {
  id: string;
  position: { x: number; y: number };
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface TacticPhase {
  id: string;
  name: string;
  type: PhaseType;
  players: Player[];
  ball?: Ball;
  drawings: DrawingPath[];
  movements: Movement[];
  duration?: number;
}

export type DisplayMode = 'default' | 'positions'; // default = avatars/numéros, positions = postes volleyball

interface CourtStore {
  // État actuel
  phases: TacticPhase[];
  currentPhaseIndex: number;
  currentPhase: TacticPhase;
  isRecording: boolean;
  isReplaying: boolean;
  replayTime: number;
  isDrawing: boolean;
  displayMode: DisplayMode;

  // État du libéro
  liberoEnabled: boolean;
  liberoPlayerId: string | null; // ID du joueur du banc qui joue le rôle de libéro
  liberoBenchPlayerData: any | null; // Données complètes du joueur du banc (firstName, lastName, etc.)
  liberoReplacesVolleyballPosition: VolleyballPosition | null; // Poste que le libéro remplace (MB ou OH)
  liberoTeamColor: string | null; // Couleur de l'équipe du libéro
  replacedPlayerByLibero: Player | null; // Joueur actuellement remplacé par le libéro (en dehors du terrain)

  // Actions
  updatePlayerPosition: (playerId: string, position: { x: number; y: number }) => void;
  updateBallPosition: (position: { x: number; y: number }) => void;
  rotateTeamPositions: (teamColor: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  removePlayer: (playerId: string) => void;
  startReplay: () => void;
  stopReplay: () => void;
  setReplayTime: (time: number) => void;
  clearMovements: () => void;
  savePhase: (name: string) => void;
  loadPhase: (phase: TacticPhase) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  applyLineupToPlayers: (lineup: Array<{ courtPosition: number; position: VolleyballPosition; player?: any }>, teamColor: string) => void;

  // Gestion des phases
  duplicateCurrentPhase: () => void;
  deleteCurrentPhase: () => void;
  renameCurrentPhase: (name: string) => void;
  nextPhase: () => void;
  previousPhase: () => void;

  // Gestion du dessin
  toggleDrawing: () => void;
  addDrawing: (path: DrawingPath) => void;
  clearDrawings: () => void;

  // Gestion des changements de joueurs
  substitutePlayer: (courtPlayerId: string, benchPlayerData: any) => void;

  // Gestion du libéro
  toggleLibero: (teamColor: string) => void;
  setLiberoPlayer: (playerId: string, benchPlayerData: any, teamColor: string) => void;
  setLiberoReplacesVolleyballPosition: (vPosition: VolleyballPosition) => void;
}

export const useCourtStore = create<CourtStore>()(
  subscribeWithSelector((set, get) => ({
    // État initial
    phases: [],
    currentPhaseIndex: 0,
    currentPhase: {
      id: 'default',
      name: 'Formation initiale',
      type: 'transition' as PhaseType,
      players: [
        // Équipe A (côté haut) - Formation standard 6 joueurs
        // Zone arrière (positions 1, 6, 5) - serveur à droite
        { id: 'a1', name: 'Central A', position: getCourtCoordinates(1, true), jerseyNumber: 1, volleyballPosition: 'MIDDLE_BLOCKER', courtPosition: 1, color: '#8B5CF6' },
        { id: 'a6', name: 'Attaquant A', position: getCourtCoordinates(6, true), jerseyNumber: 6, volleyballPosition: 'OUTSIDE_HITTER', courtPosition: 6, color: '#8B5CF6' },
        { id: 'a5', name: 'Passeur A', position: getCourtCoordinates(5, true), jerseyNumber: 5, volleyballPosition: 'SETTER', courtPosition: 5, color: '#8B5CF6' },
        // Zone avant (positions 4, 3, 2)
        { id: 'a4', name: 'Central A', position: getCourtCoordinates(4, true), jerseyNumber: 4, volleyballPosition: 'MIDDLE_BLOCKER', courtPosition: 4, color: '#8B5CF6' },
        { id: 'a3', name: 'Attaquant A', position: getCourtCoordinates(3, true), jerseyNumber: 3, volleyballPosition: 'OUTSIDE_HITTER', courtPosition: 3, color: '#8B5CF6' },
        { id: 'a2', name: 'Diagonal A', position: getCourtCoordinates(2, true), jerseyNumber: 2, volleyballPosition: 'OPPOSITE', courtPosition: 2, color: '#8B5CF6' },

        // Équipe B (côté bas) - FIXED: Positions corrigées selon règles volleyball
        // Zone arrière (positions 1, 6, 5) - serveur à droite
        { id: 'b1', name: 'Central B', position: getCourtCoordinates(1, false), jerseyNumber: 1, volleyballPosition: 'MIDDLE_BLOCKER', courtPosition: 1, color: '#10B981' },
        { id: 'b6', name: 'Attaquant B', position: getCourtCoordinates(6, false), jerseyNumber: 6, volleyballPosition: 'OUTSIDE_HITTER', courtPosition: 6, color: '#10B981' },
        { id: 'b5', name: 'Diagonal B', position: getCourtCoordinates(5, false), jerseyNumber: 5, volleyballPosition: 'OPPOSITE', courtPosition: 5, color: '#10B981' },
        // Zone avant (positions 4, 3, 2)
        { id: 'b4', name: 'Central B', position: getCourtCoordinates(4, false), jerseyNumber: 4, volleyballPosition: 'MIDDLE_BLOCKER', courtPosition: 4, color: '#10B981' },
        { id: 'b3', name: 'Attaquant B', position: getCourtCoordinates(3, false), jerseyNumber: 3, volleyballPosition: 'OUTSIDE_HITTER', courtPosition: 3, color: '#10B981' },
        { id: 'b2', name: 'Passeur B', position: getCourtCoordinates(2, false), jerseyNumber: 2, volleyballPosition: 'SETTER', courtPosition: 2, color: '#10B981' },
      ],
      ball: {
        id: 'ball',
        position: { x: 9, y: 4.5 }, // Au centre du filet
      },
      drawings: [],
      movements: []
    },
    isRecording: false,
    isReplaying: false,
    replayTime: 0,
    isDrawing: false,
    displayMode: 'default',

    // État initial du libéro
    liberoEnabled: false,
    liberoPlayerId: null,
    liberoBenchPlayerData: null,
    liberoReplacesVolleyballPosition: null,
    liberoTeamColor: null,
    replacedPlayerByLibero: null,


    // Actions - Refactored rotation logic using SOLID principles with Libero support
    rotateTeamPositions: (teamColor: string) => {
      set((state) => {
        const teamPlayers = state.currentPhase.players.filter(p => p.color === teamColor);
        const isTeamA = teamColor === '#8B5CF6';

        // Étape 1: Effectuer la rotation normale de tous les joueurs
        const rotatedPlayers = teamPlayers.map(player => {
          // Validate current position
          if (!isValidCourtPosition(player.courtPosition)) {
            console.error(`Invalid court position for player ${player.name}: ${player.courtPosition}`);
            return player; // Return unchanged if invalid
          }

          // Calculate next position using utility function (DRY principle)
          const nextPosition = getNextRotationPosition(player.courtPosition);

          // Get coordinates using utility function (DRY principle)
          const newCoords = getCourtCoordinates(nextPosition, isTeamA);

          return {
            ...player,
            courtPosition: nextPosition,
            position: newCoords
          };
        });

        // Étape 2: Gérer les substitutions du libéro si activé
        let finalPlayers = [...rotatedPlayers];
        let newReplacedPlayer = state.replacedPlayerByLibero;

        if (
          state.liberoEnabled &&
          state.liberoPlayerId &&
          state.liberoBenchPlayerData &&
          state.liberoReplacesVolleyballPosition &&
          state.liberoTeamColor === teamColor
        ) {
          console.log('🏐 Libero system active for volleyball position:', state.liberoReplacesVolleyballPosition);

          // Trouver TOUS les joueurs du poste désigné (ex: tous les MB)
          const playersOfTargetPosition = rotatedPlayers.filter(
            p => p.volleyballPosition === state.liberoReplacesVolleyballPosition
          );

          console.log(`Found ${playersOfTargetPosition.length} players with position ${state.liberoReplacesVolleyballPosition}`);

          // Chercher le libéro sur le terrain (s'il y est)
          const liberoOnCourt = rotatedPlayers.find(p => p.id === state.liberoPlayerId);

          // Chercher les joueurs du poste cible (MB ou OH)
          const playerAtPos1 = rotatedPlayers.find(p => p.courtPosition === 1);
          const playerAtPos4 = rotatedPlayers.find(p => p.courtPosition === 4);

          // CAS 2 (PRIORITAIRE): Le libéro est au poste 4 ET un joueur MB/OH est au poste 1
          // → Échange : le joueur remplacé revient au poste 4, le nouveau MB/OH au poste 1 est remplacé par le libéro
          // IMPORTANT: Ce cas doit être vérifié EN PREMIER pour éviter que le libéro soit visible au poste 4
          if (
            liberoOnCourt &&
            liberoOnCourt.courtPosition === 4 &&
            playerAtPos1 &&
            playerAtPos1.volleyballPosition === state.liberoReplacesVolleyballPosition &&
            newReplacedPlayer
          ) {
            console.log('🔄 LIBERO SWAP:', {
              liberoOut: 'from position 4',
              playerReturns: newReplacedPlayer.name,
              newPlayerOut: playerAtPos1.name,
            });

            // Le joueur qui était remplacé revient au poste 4
            const returningPlayer: Player = {
              ...newReplacedPlayer,
              courtPosition: 4,
              position: liberoOnCourt.position,
              color: liberoOnCourt.color,
            };

            // Le libéro va au poste 1
            const liberoAtPos1: Player = {
              id: state.liberoPlayerId,
              name: `${state.liberoBenchPlayerData.firstName} ${state.liberoBenchPlayerData.lastName}`,
              position: playerAtPos1.position,
              jerseyNumber: state.liberoBenchPlayerData.jerseyNumber,
              volleyballPosition: 'LIBERO',
              courtPosition: 1,
              avatar: state.liberoBenchPlayerData.avatar,
              color: playerAtPos1.color,
            };

            // Faire l'échange double
            finalPlayers = rotatedPlayers.map(p => {
              if (p.courtPosition === 4) return returningPlayer;
              if (p.courtPosition === 1) return liberoAtPos1;
              return p;
            });

            // Le nouveau joueur remplacé est celui qui était au poste 1
            newReplacedPlayer = playerAtPos1;
          }
          // CAS 1: Un joueur MB/OH arrive au poste 1 ET le libéro n'est PAS sur le terrain
          // → Le libéro entre
          else if (
            playerAtPos1 &&
            playerAtPos1.volleyballPosition === state.liberoReplacesVolleyballPosition &&
            !liberoOnCourt
          ) {
            console.log('🔄 LIBERO IN at position 1:', {
              out: playerAtPos1.name,
              in: `${state.liberoBenchPlayerData.firstName} ${state.liberoBenchPlayerData.lastName}`,
            });

            // Créer le joueur libéro
            const liberoPlayer: Player = {
              id: state.liberoPlayerId,
              name: `${state.liberoBenchPlayerData.firstName} ${state.liberoBenchPlayerData.lastName}`,
              position: playerAtPos1.position,
              jerseyNumber: state.liberoBenchPlayerData.jerseyNumber,
              volleyballPosition: 'LIBERO',
              courtPosition: 1,
              avatar: state.liberoBenchPlayerData.avatar,
              color: playerAtPos1.color,
            };

            // Remplacer le joueur en position 1 par le libéro
            finalPlayers = rotatedPlayers.map(p =>
              p.courtPosition === 1 ? liberoPlayer : p
            );

            // Sauvegarder le joueur remplacé
            newReplacedPlayer = playerAtPos1;
          }
          // CAS 3: Le libéro est au poste 4 mais AUCUN MB/OH au poste 1
          // → Le joueur remplacé revient au poste 4, le libéro sort
          else if (
            liberoOnCourt &&
            liberoOnCourt.courtPosition === 4 &&
            newReplacedPlayer &&
            (!playerAtPos1 || playerAtPos1.volleyballPosition !== state.liberoReplacesVolleyballPosition)
          ) {
            console.log('🔄 LIBERO OUT (no replacement):', {
              liberoOut: 'from position 4',
              playerReturns: newReplacedPlayer.name,
            });

            // Le joueur revient au poste 4
            const returningPlayer: Player = {
              ...newReplacedPlayer,
              courtPosition: 4,
              position: liberoOnCourt.position,
              color: liberoOnCourt.color,
            };

            // Remplacer le libéro par le joueur
            finalPlayers = rotatedPlayers.map(p =>
              p.courtPosition === 4 ? returningPlayer : p
            );

            // Le libéro n'est plus sur le terrain
            newReplacedPlayer = null;
          }
        }

        // Mettre à jour tous les joueurs
        // On remplace TOUS les joueurs de l'équipe qui tourne par finalPlayers
        // et on garde l'autre équipe intacte
        const otherTeamPlayers = state.currentPhase.players.filter(p => p.color !== teamColor);
        const updatedPlayers = [...finalPlayers, ...otherTeamPlayers];

        return {
          currentPhase: {
            ...state.currentPhase,
            players: updatedPlayers
          },
          replacedPlayerByLibero: newReplacedPlayer
        };
      });
    },

    updatePlayerPosition: (playerId: string, newPosition: { x: number; y: number }) => {
      console.log('Store: updatePlayerPosition called', { playerId, newPosition });

      set((state) => {
        const player = state.currentPhase.players.find(p => p.id === playerId);
        if (!player) {
          console.log('Store: Player not found', playerId);
          return state;
        }

        console.log('Store: Updating player position', {
          player: player.name,
          from: player.position,
          to: newPosition
        });

        const movement: Movement = {
          playerId,
          fromX: player.position.x,
          fromY: player.position.y,
          toX: newPosition.x,
          toY: newPosition.y,
          timestamp: state.isRecording ? Date.now() : 0
        };

        const newState = {
          currentPhase: {
            ...state.currentPhase,
            players: state.currentPhase.players.map(p =>
              p.id === playerId ? { ...p, position: { ...newPosition } } : p
            ),
            movements: state.isRecording
              ? [...state.currentPhase.movements, movement]
              : state.currentPhase.movements
          }
        };

        console.log('Store: New state created', newState);
        return newState;
      });
    },

    startRecording: () => {
      set((state) => ({
        isRecording: true,
        currentPhase: {
          ...state.currentPhase,
          movements: [] // Reset movements when starting new recording
        }
      }));
    },

    stopRecording: () => {
      set({ isRecording: false });
    },

    addPlayer: (playerData) => {
      set((state) => ({
        currentPhase: {
          ...state.currentPhase,
          players: [
            ...state.currentPhase.players,
            {
              ...playerData,
              id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
          ]
        }
      }));
    },

    removePlayer: (playerId: string) => {
      set((state) => ({
        currentPhase: {
          ...state.currentPhase,
          players: state.currentPhase.players.filter(p => p.id !== playerId)
        }
      }));
    },

    startReplay: () => {
      set({ isReplaying: true, replayTime: 0 });
    },

    stopReplay: () => {
      set({ isReplaying: false, replayTime: 0 });
    },

    setReplayTime: (time: number) => {
      set({ replayTime: time });
    },

    clearMovements: () => {
      set((state) => ({
        currentPhase: {
          ...state.currentPhase,
          movements: []
        }
      }));
    },

    savePhase: (name: string) => {
      set((state) => ({
        currentPhase: {
          ...state.currentPhase,
          name,
          id: `phase-${Date.now()}`
        }
      }));

      // Ici on pourrait envoyer les données au backend
      console.log('Phase sauvegardée:', get().currentPhase);
    },

    loadPhase: (phase: TacticPhase) => {
      set({
        currentPhase: phase,
        isRecording: false,
        isReplaying: false,
        replayTime: 0
      });
    },

    setDisplayMode: (mode: DisplayMode) => {
      set({ displayMode: mode });
    },

    applyLineupToPlayers: (lineup, teamColor) => {
      set((state) => {
        const lineupByPosition = new Map(
          lineup.map(pos => [pos.courtPosition, pos])
        );

        const updatedPlayers = state.currentPhase.players.map((player) => {
          // Only apply to the specified team
          if (player.color !== teamColor) {
            return player;
          }

          const savedPlayerData = lineupByPosition.get(player.courtPosition);

          if (savedPlayerData?.player) {
            const { position: volleyballPosition, player: playerData } = savedPlayerData;

            // Support both old structure (personalInfo) and new structure (direct fields)
            const firstName = playerData.personalInfo?.firstName || playerData.firstName;
            const lastName = playerData.personalInfo?.lastName || playerData.lastName;
            const jerseyNumber = playerData.personalInfo?.jerseyNumber || playerData.jerseyNumber;
            const avatar = playerData.personalInfo?.avatar || playerData.avatar;

            return {
              ...player,
              name: `${firstName || 'Joueur'} ${lastName || ''}`.trim(),
              jerseyNumber: jerseyNumber || player.jerseyNumber,
              volleyballPosition,
              avatar: avatar || player.avatar,
            };
          }

          return player;
        });

        return {
          currentPhase: {
            ...state.currentPhase,
            players: updatedPlayers
          }
        };
      });
    },

    // Gestion des phases
    // Dupliquer la phase actuelle et passer dessus
    duplicateCurrentPhase: () => {
      set((state) => {
        const newPhase: TacticPhase = {
          ...state.currentPhase,
          id: `phase-${Date.now()}`,
          name: `Phase ${state.phases.length + 1}`,
          players: state.currentPhase.players.map(p => ({ ...p })), // Deep copy players
          ball: state.currentPhase.ball ? { ...state.currentPhase.ball } : undefined,
          movements: [],
        };

        return {
          phases: [...state.phases, newPhase],
          currentPhaseIndex: state.phases.length,
          currentPhase: newPhase,
        };
      });
    },

    // Supprimer la phase actuelle
    deleteCurrentPhase: () => {
      set((state) => {
        // Ne pas supprimer s'il n'y a qu'une phase ou si on est sur la formation initiale
        if (state.phases.length === 0) {
          return state;
        }

        const newPhases = [...state.phases];
        newPhases.splice(state.currentPhaseIndex, 1);

        // Ajuster l'index si nécessaire
        let newIndex = state.currentPhaseIndex;
        if (newIndex >= newPhases.length && newPhases.length > 0) {
          newIndex = newPhases.length - 1;
        }

        // Si on a supprimé toutes les phases, revenir à la formation initiale
        if (newPhases.length === 0) {
          return {
            phases: [],
            currentPhaseIndex: 0,
            // currentPhase reste inchangé (formation initiale)
          };
        }

        return {
          phases: newPhases,
          currentPhaseIndex: newIndex,
          currentPhase: newPhases[newIndex],
        };
      });
    },

    // Renommer la phase actuelle
    renameCurrentPhase: (name: string) => {
      set((state) => {
        const updatedPhase = {
          ...state.currentPhase,
          name,
        };

        // Si on est dans le tableau des phases, mettre à jour
        if (state.phases.length > 0 && state.currentPhaseIndex < state.phases.length) {
          const newPhases = [...state.phases];
          newPhases[state.currentPhaseIndex] = updatedPhase;
          return {
            phases: newPhases,
            currentPhase: updatedPhase,
          };
        }

        // Sinon juste mettre à jour currentPhase (formation initiale)
        return {
          currentPhase: updatedPhase,
        };
      });
    },

    nextPhase: () => {
      set((state) => {
        if (state.currentPhaseIndex < state.phases.length - 1) {
          const nextIndex = state.currentPhaseIndex + 1;
          return {
            currentPhaseIndex: nextIndex,
            currentPhase: state.phases[nextIndex],
          };
        }
        return state;
      });
    },

    previousPhase: () => {
      set((state) => {
        if (state.currentPhaseIndex > 0) {
          const prevIndex = state.currentPhaseIndex - 1;
          return {
            currentPhaseIndex: prevIndex,
            currentPhase: state.phases[prevIndex],
          };
        }
        return state;
      });
    },

    updateBallPosition: (position: { x: number; y: number }) => {
      set((state) => ({
        currentPhase: {
          ...state.currentPhase,
          ball: {
            id: 'ball',
            position,
          },
        },
      }));
    },

    // Gestion du dessin
    toggleDrawing: () => {
      set((state) => ({ isDrawing: !state.isDrawing }));
    },

    addDrawing: (path: DrawingPath) => {
      set((state) => ({
        currentPhase: {
          ...state.currentPhase,
          drawings: [...state.currentPhase.drawings, path],
        },
      }));
    },

    clearDrawings: () => {
      set((state) => ({
        currentPhase: {
          ...state.currentPhase,
          drawings: [],
        },
      }));
    },

    // Échanger un joueur sur le terrain avec un joueur du banc
    substitutePlayer: (courtPlayerId: string, benchPlayerData: any) => {
      set((state) => {
        const courtPlayer = state.currentPhase.players.find(p => p.id === courtPlayerId);
        if (!courtPlayer) {
          console.error('Court player not found:', courtPlayerId);
          return state;
        }

        console.log('🔄 Substitution:', {
          out: courtPlayer.name,
          in: `${benchPlayerData.firstName} ${benchPlayerData.lastName}`,
          position: courtPlayer.courtPosition,
        });

        // Remplacer le joueur sur le terrain par le joueur du banc
        // Le joueur du banc prend la position et les coordonnées du joueur sortant
        const newPlayer: Player = {
          id: benchPlayerData.id,
          name: `${benchPlayerData.firstName} ${benchPlayerData.lastName}`,
          position: { ...courtPlayer.position }, // Garde la même position sur le terrain
          jerseyNumber: benchPlayerData.jerseyNumber,
          volleyballPosition: benchPlayerData.primaryPosition,
          courtPosition: courtPlayer.courtPosition, // Garde la même courtPosition (1-6)
          avatar: benchPlayerData.avatar || courtPlayer.avatar,
          color: courtPlayer.color, // Garde la même couleur d'équipe
        };

        const updatedPlayers = state.currentPhase.players.map(p =>
          p.id === courtPlayerId ? newPlayer : p
        );

        return {
          currentPhase: {
            ...state.currentPhase,
            players: updatedPlayers,
          },
        };
      });
    },

    // === Actions Libéro ===

    // Activer/désactiver le système de libéro pour une équipe
    toggleLibero: (teamColor: string) => {
      set((state) => {
        const newEnabled = !state.liberoEnabled;

        console.log('🔄 Toggle Libéro:', {
          enabled: newEnabled,
          teamColor,
          currentLibero: state.liberoPlayerId
        });

        // Si on désactive le libéro, réinitialiser tout
        if (!newEnabled) {
          return {
            liberoEnabled: false,
            liberoPlayerId: null,
            liberoBenchPlayerData: null,
            liberoReplacesVolleyballPosition: null,
            liberoTeamColor: null,
            replacedPlayerByLibero: null,
          };
        }

        // Si on active, définir l'équipe
        return {
          liberoEnabled: true,
          liberoTeamColor: teamColor,
        };
      });
    },

    // Définir quel joueur du banc est le libéro
    setLiberoPlayer: (playerId: string, benchPlayerData: any, teamColor: string) => {
      set((state) => {
        if (!benchPlayerData) {
          console.error('Libero bench player data is required');
          return state;
        }

        console.log('🏐 Set Libéro:', {
          player: `${benchPlayerData.firstName} ${benchPlayerData.lastName}`,
          id: playerId,
          teamColor
        });

        return {
          liberoPlayerId: playerId,
          liberoBenchPlayerData: benchPlayerData,
          liberoTeamColor: teamColor,
        };
      });
    },

    // Définir quel poste (MB/OH) le libéro remplace
    setLiberoReplacesVolleyballPosition: (vPosition: VolleyballPosition) => {
      set((state) => {
        console.log('🏐 Set Libéro Replaces Volleyball Position:', {
          volleyballPosition: vPosition
        });

        // Vérifier si configuration complète (libéro activé + joueur sélectionné + poste choisi)
        if (
          state.liberoEnabled &&
          state.liberoPlayerId &&
          state.liberoBenchPlayerData &&
          state.liberoTeamColor
        ) {
          console.log('🏐 Libero fully configured, checking for immediate substitution...');

          // Vérifier s'il y a un joueur du poste cible déjà au poste 1
          const teamPlayers = state.currentPhase.players.filter(p => p.color === state.liberoTeamColor);
          const playerAtPos1 = teamPlayers.find(p => p.courtPosition === 1);

          if (playerAtPos1 && playerAtPos1.volleyballPosition === vPosition) {
            console.log('🔄 IMMEDIATE LIBERO SUBSTITUTION at position 1:', {
              out: playerAtPos1.name,
              in: `${state.liberoBenchPlayerData.firstName} ${state.liberoBenchPlayerData.lastName}`,
            });

            // Créer le joueur libéro
            const liberoPlayer: Player = {
              id: state.liberoPlayerId,
              name: `${state.liberoBenchPlayerData.firstName} ${state.liberoBenchPlayerData.lastName}`,
              position: playerAtPos1.position,
              jerseyNumber: state.liberoBenchPlayerData.jerseyNumber,
              volleyballPosition: 'LIBERO',
              courtPosition: 1,
              avatar: state.liberoBenchPlayerData.avatar,
              color: playerAtPos1.color,
            };

            // Remplacer le joueur en position 1 par le libéro
            const updatedPlayers = state.currentPhase.players.map(p =>
              p.id === playerAtPos1.id ? liberoPlayer : p
            );

            return {
              liberoReplacesVolleyballPosition: vPosition,
              replacedPlayerByLibero: playerAtPos1,
              currentPhase: {
                ...state.currentPhase,
                players: updatedPlayers,
              },
            };
          }
        }

        return {
          liberoReplacesVolleyballPosition: vPosition,
        };
      });
    },
  }))
);
